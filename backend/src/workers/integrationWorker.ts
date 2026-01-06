import { Worker, Job } from "bullmq";
import redisConnection from "../queue/connection";
import { IntegrationJobData } from "../queue/integrationQueue";
import { AppDataSource, initializeDatabase } from "../data-source";
import { IntegrationJob } from "../entities/IntegrationJob";
import { IntegrationJobLog } from "../entities/IntegrationJobLog";
import { TenantCredentials } from "../entities/TenantCredentials";
import { TenantEndpointSettings } from "../entities/TenantEndpointSettings";
import { ConnectorFactory } from "../connectors/ConnectorFactory";
import { logger } from "../utils/logger";

async function processIntegrationJob(job: Job<IntegrationJobData>) {
  const { tenantId, endpointName } = job.data;
  
  logger.info("Processing integration job", {
    jobId: job.id,
    tenantId,
    endpointName,
  });

  // Criar registro de job
  const jobRepo = AppDataSource.getRepository(IntegrationJob);
  const integrationJob = jobRepo.create({
    tenant_id: tenantId,
    endpoint_name: endpointName,
    started_at: new Date(),
    status: "running",
  });
  await jobRepo.save(integrationJob);

  const logRepo = AppDataSource.getRepository(IntegrationJobLog);
  
  const addLog = async (level: string, message: string, context?: any) => {
    const log = logRepo.create({
      job_id: integrationJob.id,
      level,
      message,
      context_json: context ? JSON.stringify(context) : null,
    });
    await logRepo.save(log);
  };

  try {
    // Buscar credenciais do tenant
    const credRepo = AppDataSource.getRepository(TenantCredentials);
    const credentials = await credRepo.findOne({
      where: { 
        tenant_id: tenantId,
        provider: "tacweb",
        is_active: true,
      },
    });

    if (!credentials) {
      throw new Error("Active credentials not found for tenant");
    }

    // Buscar configuração do endpoint
    const settingsRepo = AppDataSource.getRepository(TenantEndpointSettings);
    const settings = await settingsRepo.findOne({
      where: {
        tenant_id: tenantId,
        endpoint_name: endpointName,
        enabled: true,
      },
    });

    if (!settings) {
      throw new Error("Endpoint settings not found or disabled");
    }

    await addLog("info", "Starting data collection", {
      endpoint: endpointName,
    });

    // Criar e executar conector
    const connector = ConnectorFactory.create(endpointName, {
      tenantId,
      credentials,
      settings,
    });

    const result = await connector.execute();

    // Atualizar job com sucesso
    integrationJob.status = "success";
    integrationJob.finished_at = new Date();
    integrationJob.fetched_count = result.fetched;
    integrationJob.upserted_count = result.upserted;
    await jobRepo.save(integrationJob);

    await addLog("info", "Data collection completed successfully", {
      fetched: result.fetched,
      upserted: result.upserted,
    });

    logger.info("Integration job completed successfully", {
      jobId: job.id,
      tenantId,
      endpointName,
      result,
    });

    return result;
  } catch (error: any) {
    // Atualizar job com erro
    integrationJob.status = "failed";
    integrationJob.finished_at = new Date();
    integrationJob.error_message = error.message;
    integrationJob.retry_count = job.attemptsMade;
    await jobRepo.save(integrationJob);

    await addLog("error", "Data collection failed", {
      error: error.message,
      stack: error.stack,
    });

    logger.error("Integration job failed", {
      jobId: job.id,
      tenantId,
      endpointName,
      error: error.message,
    });

    throw error;
  }
}

// Inicializar worker
async function startWorker() {
  await initializeDatabase();

  const worker = new Worker<IntegrationJobData>(
    "integration",
    processIntegrationJob,
    {
      connection: redisConnection,
      concurrency: 5, // Processar até 5 jobs simultaneamente
      limiter: {
        max: 10, // Máximo de 10 jobs
        duration: 60000, // Por minuto
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info("Worker completed job", { jobId: job.id });
  });

  worker.on("failed", (job, error) => {
    logger.error("Worker failed job", {
      jobId: job?.id,
      error: error.message,
    });
  });

  logger.info("✅ Integration worker started");

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing worker...");
    await worker.close();
    await redisConnection.quit();
    process.exit(0);
  });
}

// Start worker
if (require.main === module) {
  startWorker().catch((error) => {
    logger.error("Failed to start worker", { error: error.message });
    process.exit(1);
  });
}

export { startWorker };
