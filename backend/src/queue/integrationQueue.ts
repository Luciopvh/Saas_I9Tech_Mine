import { Queue, QueueEvents } from "bullmq";
import redisConnection from "./connection";
import { logger } from "../utils/logger";

export interface IntegrationJobData {
  tenantId: string;
  endpointName: string;
  priority?: number;
}

export const integrationQueue = new Queue<IntegrationJobData>("integration", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60000, // 1 minuto
    },
    removeOnComplete: {
      age: 86400, // Manter por 24 horas
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // Manter por 7 dias
    },
  },
});

// Event listeners
const queueEvents = new QueueEvents("integration", {
  connection: redisConnection,
});

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  logger.info("Job completed", { jobId, result: returnvalue });
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error("Job failed", { jobId, error: failedReason });
});

queueEvents.on("progress", ({ jobId, data }) => {
  logger.debug("Job progress", { jobId, progress: data });
});

export default integrationQueue;
