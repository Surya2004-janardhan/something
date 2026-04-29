const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const llm = require("../lib/llm");

function jobKey(id) {
  return `job:${id}`;
}

// POST /ai/jobs — create and process a job
router.post("/jobs", async (req, res) => {
  const redis = req.app.locals.redis;
  const id = uuidv4();
  const payload = req.body || {};
  const createdAt = new Date().toISOString();

  const job = {
    id,
    status: "queued",
    type: payload.type || "agent",
    createdAt,
    payload,
  };

  await redis.set(jobKey(id), JSON.stringify(job));

  // process asynchronously (fire-and-forget)
  (async () => {
    try {
      await redis.set(
        jobKey(id),
        JSON.stringify({
          ...job,
          status: "running",
          startedAt: new Date().toISOString(),
        }),
      );

      let result;
      if (payload.type === "workflow") {
        // run sequential steps
        const steps = payload.workflow?.steps || [];
        let previous = "";
        const outputs = [];
        for (const step of steps) {
          const agent = step.agent || {};
          const prompt = (step.config?.prompt_template || "{input}").replace(
            "{input}",
            previous || payload.input || "",
          );
          const run = await llm.runCompletion({
            provider: agent.provider || "openai",
            model: agent.model || "gpt-4o-mini",
            messages: [
              { role: "system", content: agent.system_prompt || "" },
              { role: "user", content: prompt },
            ],
            temperature: agent.temperature ?? 0.7,
            maxTokens: agent.max_tokens ?? 512,
          });
          outputs.push({
            order: step.order,
            agent_id: agent.id,
            input: prompt,
            output: run.text,
          });
          previous = run.text;
        }
        result = {
          status: "finished",
          result: { output: { text: previous, steps: outputs }, usage: {} },
        };
      } else {
        // agent job
        const agent = payload.agent || {};
        const messages = [
          { role: "system", content: agent.system_prompt || "" },
          { role: "user", content: payload.input || "" },
        ];
        const run = await llm.runCompletion({
          provider: agent.provider || "openai",
          model: agent.model || "gpt-4o-mini",
          messages,
          temperature: agent.temperature ?? 0.7,
          maxTokens: agent.max_tokens ?? 512,
        });
        result = {
          status: "finished",
          result: { output: { text: run.text }, usage: run.usage },
        };
      }

      await redis.set(
        jobKey(id),
        JSON.stringify({
          ...job,
          status: "finished",
          completedAt: new Date().toISOString(),
          result: result,
        }),
      );
    } catch (err) {
      await redis.set(
        jobKey(id),
        JSON.stringify({
          ...job,
          status: "failed",
          completedAt: new Date().toISOString(),
          error: String(err),
        }),
      );
      console.error("[ai-worker] job failed", err);
    }
  })();

  res.status(201).json({ job_id: id });
});

// GET /ai/jobs/:id
router.get("/jobs/:id", async (req, res) => {
  const redis = req.app.locals.redis;
  const id = req.params.id;
  const raw = await redis.get(jobKey(id));
  if (!raw) return res.status(404).json({ error: "Job not found" });
  const obj = JSON.parse(raw);
  res.json(obj);
});

module.exports = router;
