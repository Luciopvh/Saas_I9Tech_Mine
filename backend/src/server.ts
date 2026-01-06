import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as dotenv from "dotenv";
import { initializeDatabase } from "./data-source";
import { logger } from "./utils/logger";

// Routes
import tenantsRouter from "./routes/tenants";
import credentialsRouter from "./routes/credentials";
import endpointsRouter from "./routes/endpoints";
import jobsRouter from "./routes/jobs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
});
app.use("/api/", limiter);

// Request logging
app.use((req, res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/tenants", tenantsRouter);
app.use("/api/credentials", credentialsRouter);
app.use("/api/endpoints", endpointsRouter);
app.use("/api/jobs", jobsRouter);

// Trigger manual job scheduling
app.post("/api/scheduler/trigger", async (req, res) => {
  try {
    const { triggerManualSchedule } = await import("./scheduler/jobScheduler");
    await triggerManualSchedule();
    res.json({ message: "Job scheduling triggered successfully" });
  } catch (error: any) {
    logger.error("Error triggering scheduler", { error: error.message });
    res.status(500).json({ error: "Failed to trigger scheduler" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });
  
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start server
async function startServer() {
  try {
    // Inicializar banco de dados
    await initializeDatabase();
    
    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`📍 Health check: http://localhost:${PORT}/health`);
      logger.info(`📍 API docs: http://localhost:${PORT}/api`);
    });
  } catch (error: any) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

export default app;
