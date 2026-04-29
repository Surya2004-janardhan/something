const express = require("express");
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");
const jobsRouter = require("./routes/jobs");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379/0";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

async function createApp() {
  const redis = createClient({ url: REDIS_URL });
  redis.on("error", (err) => console.error("[ai-worker][redis] error", err));
  await redis.connect();

  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use((req, _res, next) => {
    // check internal header for security
    if (!INTERNAL_API_SECRET) return next();
    if (req.headers["x-internal-secret"] !== INTERNAL_API_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  });

  // attach redis and helper to request
  app.locals.redis = redis;
  app.locals.uuid = uuidv4;

  app.use("/ai", jobsRouter);

  return { app, redis };
}

createApp()
  .then(({ app }) => {
    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => console.log(`[ai-worker] listening on :${port}`));
  })
  .catch((err) => {
    console.error("[ai-worker] failed to start", err);
    process.exit(1);
  });

module.exports = createApp;
