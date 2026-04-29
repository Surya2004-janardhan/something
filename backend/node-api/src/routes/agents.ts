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

const AgentCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  templateId: z.string().uuid().optional(),
  systemPrompt: z.string().max(4000).optional(),
  provider: z.string().min(1),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(64).max(8192).optional(),
});

const AgentUpdateSchema = AgentCreateSchema.partial();

const AgentRunSchema = z.object({
  input: z.string().min(1).max(8000),
  provider: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(64).max(8192).optional(),
  useMemory: z.boolean().optional(),
});

const TEMPLATE_SEEDS = [
  {
    name: 'Email Triage Agent',
    description: 'Drafts replies, extracts action items, and prioritizes inbox threads.',
    category: 'Communication',
    prompt: 'You triage inbound emails. Provide a concise response draft, a priority level, and action items.',
    icon: 'mail',
  },
  {
    name: 'Research Brief Agent',
    description: 'Produces structured research briefs with claims, evidence, and next steps.',
    category: 'Research',
    prompt: 'You are a research analyst. Provide a brief with key findings, citations, and risks.',
    icon: 'search',
  },
  {
    name: 'Meeting Prep Agent',
    description: 'Generates agenda, prep notes, and talking points from context.',
    category: 'Productivity',
    prompt: 'You prepare meeting agendas. Summarize context, propose agenda, and list questions.',
    icon: 'calendar',
  },
  {
    name: 'Workflow Refiner Agent',
    description: 'Turns rough task lists into executable workflows with clear steps.',
    category: 'Operations',
    prompt: 'Convert the input into a clear workflow with numbered steps and owners.',
    icon: 'layers',
  },
];

async function ensureTemplates() {
  const existing = await prisma.agentTemplate.count();
  if (existing > 0) return;
  await prisma.agentTemplate.createMany({ data: TEMPLATE_SEEDS });
}

// GET /api/agents/templates
router.get('/templates', authenticate, async (_req: AuthRequest, res: Response) => {
  await ensureTemplates();
  const templates = await prisma.agentTemplate.findMany({ orderBy: { createdAt: 'asc' } });
  res.json({ templates });
});

// GET /api/agents
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const agents = await prisma.agent.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ agents });
});

// GET /api/agents/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
  });
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  res.json(agent);
});

// POST /api/agents
router.post('/', authenticate, validate(AgentCreateSchema), async (req: AuthRequest, res: Response) => {
  const data = req.body as z.infer<typeof AgentCreateSchema>;
  const agent = await prisma.agent.create({
    data: {
      userId: req.user!.sub,
      name: data.name,
      description: data.description,
      templateId: data.templateId,
      systemPrompt: data.systemPrompt,
      provider: data.provider,
      model: data.model,
      temperature: data.temperature ?? 0.7,
      maxTokens: data.maxTokens ?? 512,
    },
  });
  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'agent.created', targetType: 'agent', targetId: agent.id },
  });
  res.status(201).json(agent);
});

// PATCH /api/agents/:id
router.patch('/:id', authenticate, validate(AgentUpdateSchema), async (req: AuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
  });
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  const data = req.body as z.infer<typeof AgentUpdateSchema>;
  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      name: data.name,
      description: data.description,
      templateId: data.templateId,
      systemPrompt: data.systemPrompt,
      provider: data.provider,
      model: data.model,
      temperature: data.temperature,
      maxTokens: data.maxTokens,
    },
  });
  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'agent.updated', targetType: 'agent', targetId: agent.id },
  });
  res.json(updated);
});

// DELETE /api/agents/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
  });
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  await prisma.agent.delete({ where: { id: agent.id } });
  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'agent.deleted', targetType: 'agent', targetId: agent.id },
  });
  res.status(204).send();
});

// POST /api/agents/:id/run
router.post('/:id/run', authenticate, aiLimiter, validate(AgentRunSchema), async (req: AuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
  });
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }

  const body = req.body as z.infer<typeof AgentRunSchema>;
  const run = await prisma.run.create({
    data: {
      userId: req.user!.sub,
      type: 'agent',
      status: 'queued',
      agentId: agent.id,
      input: { input: body.input },
      startedAt: new Date(),
    },
  });

  try {
    const { data } = await axios.post(
      `${AI_URL}/ai/jobs`,
      {
        type: 'agent',
        run_id: run.id,
        user_id: req.user!.sub,
        input: body.input,
        use_memory: body.useMemory ?? true,
        agent: {
          id: agent.id,
          name: agent.name,
          system_prompt: agent.systemPrompt,
          provider: body.provider || agent.provider,
          model: body.model || agent.model,
          temperature: body.temperature ?? agent.temperature,
          max_tokens: body.maxTokens ?? agent.maxTokens,
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

// GET /api/agents/:id/memory
router.get('/:id/memory', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data } = await axios.get(
      `${AI_URL}/ai/agents/${req.params.id}/memory/${req.user!.sub}`,
      { headers: aiHeaders() },
    );
    res.json(data);
  } catch (err: any) {
    const status = err.response?.status || 502;
    res.status(status).json({ error: err.response?.data?.error || 'AI service error' });
  }
});

// DELETE /api/agents/:id/memory
router.delete('/:id/memory', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await axios.delete(
      `${AI_URL}/ai/agents/${req.params.id}/memory/${req.user!.sub}`,
      { headers: aiHeaders() },
    );
    res.json({ message: 'Memory cleared' });
  } catch (err: any) {
    const status = err.response?.status || 502;
    res.status(status).json({ error: err.response?.data?.error || 'AI service error' });
  }
});

export default router;
