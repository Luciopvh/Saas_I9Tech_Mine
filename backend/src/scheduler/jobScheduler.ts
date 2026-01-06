import * as cron from "node-cron";
import { AppDataSource, initializeDatabase } from "../data-source";
import { Tenant } from "../entities/Tenant";
import { TenantEndpointSettings } from "../entities/TenantEndpointSettings";
import integrationQueue from "../queue/integrationQueue";
import { logger } from "../utils/logger";

async function scheduleJobs() {
  try {
    logger.info("Running hourly job scheduler...");

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const settingsRepo = AppDataSource.getRepository(TenantEndpointSettings);

    // Buscar todos os tenants ativos
    const activeTenants = await tenantRepo.find({
      where: { status: "active" },
    });

    logger.info(`Found ${activeTenants.length} active tenants`);

    for (const tenant of activeTenants) {
      // Buscar endpoints habilitados para este tenant
      const enabledSettings = await settingsRepo.find({
        where: {
          tenant_id: tenant.id,
          enabled: true,
        },
        order: {
          priority: "DESC", // Maior prioridade primeiro
        },
      });

      logger.info(`Tenant ${tenant.name}: ${enabledSettings.length} enabled endpoints`);

      for (const settings of enabledSettings) {
        try {
          // Adicionar job na fila
          const job = await integrationQueue.add(
            "fetch",
            {
              tenantId: tenant.id,
              endpointName: settings.endpoint_name,
              priority: settings.priority,
            },
            {
              priority: settings.priority,
              jobId: `${tenant.id}-${settings.endpoint_name}-${Date.now()}`,
            }
          );

          logger.info("Job scheduled", {
            jobId: job.id,
            tenantId: tenant.id,
            tenantName: tenant.name,
            endpoint: settings.endpoint_name,
          });
        } catch (error: any) {
          logger.error("Error scheduling job", {
            tenantId: tenant.id,
            endpoint: settings.endpoint_name,
            error: error.message,
          });
        }
      }
    }

    logger.info("Job scheduling completed");
  } catch (error: any) {
    logger.error("Error in job scheduler", { error: error.message });
  }
}

async function startScheduler() {
  await initializeDatabase();

  logger.info("Starting job scheduler...");

  // Agendar execução a cada hora (no minuto 0)
  // Cron format: segundo minuto hora dia mês dia-da-semana
  cron.schedule("0 * * * *", scheduleJobs, {
    timezone: "America/Sao_Paulo",
  });

  logger.info("✅ Job scheduler started (runs every hour at minute 0)");

  // Executar imediatamente na inicialização (opcional)
  if (process.env.RUN_ON_STARTUP === "true") {
    logger.info("Running initial job scheduling...");
    await scheduleJobs();
  }

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, stopping scheduler...");
    cron.getTasks().forEach((task) => task.stop());
    process.exit(0);
  });
}

// Permitir execução manual
export async function triggerManualSchedule() {
  await scheduleJobs();
}

// Start scheduler
if (require.main === module) {
  startScheduler().catch((error) => {
    logger.error("Failed to start scheduler", { error: error.message });
    process.exit(1);
  });
}

export { startScheduler };
