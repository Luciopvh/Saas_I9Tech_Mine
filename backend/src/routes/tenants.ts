import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entities/Tenant";
import { logger } from "../utils/logger";

const router = Router();

// Criar tenant
router.post("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Tenant);
    const tenant = repo.create(req.body);
    await repo.save(tenant);
    
    logger.info("Tenant created", { tenantId: tenant.id, name: tenant.name });
    res.status(201).json(tenant);
  } catch (error: any) {
    logger.error("Error creating tenant", { error: error.message });
    res.status(500).json({ error: "Failed to create tenant" });
  }
});

// Listar todos os tenants
router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Tenant);
    const { status } = req.query;
    
    const queryBuilder = repo.createQueryBuilder("tenant");
    
    if (status) {
      queryBuilder.where("tenant.status = :status", { status });
    }
    
    const tenants = await queryBuilder
      .orderBy("tenant.created_at", "DESC")
      .getMany();
    
    res.json(tenants);
  } catch (error: any) {
    logger.error("Error fetching tenants", { error: error.message });
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});

// Buscar tenant por ID
router.get("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Tenant);
    const tenant = await repo.findOne({
      where: { id: req.params.id },
      relations: ["credentials", "endpoint_settings"],
    });
    
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    
    res.json(tenant);
  } catch (error: any) {
    logger.error("Error fetching tenant", { error: error.message });
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
});

// Atualizar tenant
router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Tenant);
    const tenant = await repo.findOneBy({ id: req.params.id });
    
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    
    repo.merge(tenant, req.body);
    await repo.save(tenant);
    
    logger.info("Tenant updated", { tenantId: tenant.id });
    res.json(tenant);
  } catch (error: any) {
    logger.error("Error updating tenant", { error: error.message });
    res.status(500).json({ error: "Failed to update tenant" });
  }
});

// Deletar tenant
router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Tenant);
    const result = await repo.delete(req.params.id);
    
    if (result.affected === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    
    logger.info("Tenant deleted", { tenantId: req.params.id });
    res.status(204).send();
  } catch (error: any) {
    logger.error("Error deleting tenant", { error: error.message });
    res.status(500).json({ error: "Failed to delete tenant" });
  }
});

export default router;
