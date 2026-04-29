import { Router, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';

const router = Router();
const AI_URL = process.env.AI_WORKER_URL || 'http://localhost:5000';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || '';

const aiHeaders = () => ({ 'x-internal-secret': INTERNAL_SECRET });

const WorkflowCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  steps: z
    .array(
      z.object({
        agentId: z.string().uuid(),
        order: z.number().int().min(0),
        config: z.record(z.unknown()).default({}),
      }),
    )
    .min(1),
});

const WorkflowUpdateSchema = WorkflowCreateSchema.partial();

const WorkflowRunSchema = z.object({
  input: z.string().min(1).max(8000),
});

// GET /api/workflows
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const workflows = await prisma.workflow.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: 'desc' },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
  res.json({ workflows });
});

// GET /api/workflows/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
  if (!workflow) {
    res.status(404).json({ error: 'Workflow not found' });
    return;
  }
  res.json(workflow);
});

// POST /api/workflows
router.post('/', authenticate, validate(WorkflowCreateSchema), async (req: AuthRequest, res: Response) => {
  const data = req.body as z.infer<typeof WorkflowCreateSchema>;
  const workflow = await prisma.workflow.create({
    data: {
      userId: req.user!.sub,
      name: data.name,
      description: data.description,
      steps: {
          create: data.steps.map((step: z.infer<typeof WorkflowCreateSchema>['steps'][number]) => ({
          order: step.order,
          agentId: step.agentId,
          config: step.config,
        })),
      },
    },
    include: { steps: { orderBy: { order: 'asc' } } },
  });
  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'workflow.created', targetType: 'workflow', targetId: workflow.id },
  });
  res.status(201).json(workflow);
});

// PATCH /api/workflows/:id
router.patch('/:id', authenticate, validate(WorkflowUpdateSchema), async (req: AuthRequest, res: Response) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
    include: { steps: true },
  });
  if (!workflow) {
    res.status(404).json({ error: 'Workflow not found' });
    return;
  }

  const data = req.body as z.infer<typeof WorkflowUpdateSchema>;

  const updated = await prisma.workflow.update({
    where: { id: workflow.id },
    data: {
      name: data.name,
      description: data.description,
      steps: data.steps
        ? {
            deleteMany: {},
            create: data.steps.map((step: z.infer<typeof WorkflowCreateSchema>['steps'][number]) => ({
              order: step.order,
              agentId: step.agentId,
              config: step.config,
            })),
          }
        : undefined,
    },
    include: { steps: { orderBy: { order: 'asc' } } },
  });

  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'workflow.updated', targetType: 'workflow', targetId: workflow.id },
  });

  res.json(updated);
});

// DELETE /api/workflows/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
  });
  if (!workflow) {
    res.status(404).json({ error: 'Workflow not found' });
    return;
  }
  await prisma.workflow.delete({ where: { id: workflow.id } });
  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'workflow.deleted', targetType: 'workflow', targetId: workflow.id },
  });
  res.status(204).send();
});

// POST /api/workflows/:id/run
router.post('/:id/run', authenticate, aiLimiter, validate(WorkflowRunSchema), async (req: AuthRequest, res: Response) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
    include: { steps: { orderBy: { order: 'asc' } }, user: true },
  });
  if (!workflow) {
    res.status(404).json({ error: 'Workflow not found' });
    return;
  }

  const body = req.body as z.infer<typeof WorkflowRunSchema>;
  const run = await prisma.run.create({
    data: {
      userId: req.user!.sub,
      type: 'workflow',
      status: 'queued',
      workflowId: workflow.id,
      input: { input: body.input },
      startedAt: new Date(),
    },
  });

  const steps = await prisma.workflowStep.findMany({
    where: { workflowId: workflow.id },
    orderBy: { order: 'asc' },
    include: { agent: true },
  });

  try {
    const { data } = await axios.post(
      `${AI_URL}/ai/jobs`,
      {
        type: 'workflow',
        run_id: run.id,
        user_id: req.user!.sub,
        input: body.input,
        workflow: {
          id: workflow.id,
          name: workflow.name,
          steps: steps.map((step: (typeof steps)[number]) => ({
            order: step.order,
            config: step.config,
            agent: {
              id: step.agent.id,
              name: step.agent.name,
              system_prompt: step.agent.systemPrompt,
              provider: step.agent.provider,
              model: step.agent.model,
              temperature: step.agent.temperature,
              max_tokens: step.agent.maxTokens,
            },
          })),
        },
      },
      { headers: aiHeaders() },
    );

    const updated = await prisma.run.update({
      where: { id: run.id },
      data: { jobId: data.job_id },
    });
    res.status(202).json(updated);
  } catch (err: any) {
    const status = err.response?.status || 502;
    await prisma.run.update({
      where: { id: run.id },
      data: { status: 'failed', error: err.response?.data?.error || 'AI service error', completedAt: new Date() },
    });
    res.status(status).json({ error: err.response?.data?.error || 'AI service error' });
  }
});

export default router;
