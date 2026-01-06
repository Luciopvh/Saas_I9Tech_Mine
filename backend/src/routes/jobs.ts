import { Router } from "express";
import { AppDataSource } from "../data-source";
import { IntegrationJob } from "../entities/IntegrationJob";
import { IntegrationJobLog } from "../entities/IntegrationJobLog";
import { logger } from "../utils/logger";

const router = Router();

// Listar jobs
router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(IntegrationJob);
    const { tenant_id, endpoint_name, status, limit = "50" } = req.query;
    
    const queryBuilder = repo
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.tenant", "tenant")
      .orderBy("job.started_at", "DESC")
      .limit(parseInt(limit as string));
    
    if (tenant_id) {
      queryBuilder.andWhere("job.tenant_id = :tenant_id", { tenant_id });
    }
    
    if (endpoint_name) {
      queryBuilder.andWhere("job.endpoint_name = :endpoint_name", { endpoint_name });
    }
    
    if (status) {
      queryBuilder.andWhere("job.status = :status", { status });
    }
    
    const jobs = await queryBuilder.getMany();
    res.json(jobs);
  } catch (error: any) {
    logger.error("Error fetching jobs", { error: error.message });
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Buscar job por ID
router.get("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(IntegrationJob);
    const job = await repo.findOne({
      where: { id: req.params.id },
      relations: ["tenant"],
    });
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    res.json(job);
  } catch (error: any) {
    logger.error("Error fetching job", { error: error.message });
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Buscar logs de um job
router.get("/:id/logs", async (req, res) => {
  try {
    const logRepo = AppDataSource.getRepository(IntegrationJobLog);
    const logs = await logRepo.find({
      where: { job_id: req.params.id },
      order: { created_at: "ASC" },
    });
    
    res.json(logs);
  } catch (error: any) {
    logger.error("Error fetching job logs", { error: error.message });
    res.status(500).json({ error: "Failed to fetch job logs" });
  }
});

// Estatísticas de jobs
router.get("/stats/summary", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(IntegrationJob);
    const { tenant_id } = req.query;
    
    const queryBuilder = repo.createQueryBuilder("job");
    
    if (tenant_id) {
      queryBuilder.where("job.tenant_id = :tenant_id", { tenant_id });
    }
    
    const [total, success, failed, running] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere("job.status = :status", { status: "success" }).getCount(),
      queryBuilder.clone().andWhere("job.status = :status", { status: "failed" }).getCount(),
      queryBuilder.clone().andWhere("job.status = :status", { status: "running" }).getCount(),
    ]);
    
    res.json({
      total,
      success,
      failed,
      running,
      pending: total - success - failed - running,
    });
  } catch (error: any) {
    logger.error("Error fetching job stats", { error: error.message });
    res.status(500).json({ error: "Failed to fetch job stats" });
  }
});

export default router;
