import { Router } from "express";
import { AppDataSource } from "../data-source";
import { TenantEndpointSettings } from "../entities/TenantEndpointSettings";
import { logger } from "../utils/logger";

const router = Router();

// Lista de endpoints disponíveis (13 do manual)
export const AVAILABLE_ENDPOINTS = [
  { name: "fuel_usage_utilization", label: "Consumo por Utilização", item: 4 },
  { name: "fuel_usage_refueling", label: "Consumo por Abastecimento", item: 5 },
  { name: "fuel_usage_period", label: "Consumo por Período", item: 6 },
  { name: "fuel_usage_equipment", label: "Consumo por Equipamento", item: 7 },
  { name: "fuel_usage_worksite", label: "Consumo por Obra", item: 8 },
  { name: "fuel_usage_cost_center", label: "Consumo por Centro de Custo", item: 9 },
  { name: "fuel_usage_equipment_type", label: "Consumo por Tipo de Equipamento", item: 10 },
  { name: "fuel_usage_equipment_group", label: "Consumo por Grupo de Equipamento", item: 11 },
  { name: "fuel_usage_company", label: "Consumo por Empresa", item: 12 },
  { name: "fuel_usage_consolidated", label: "Consumo Consolidado", item: 13 },
  { name: "fuel_usage_driver", label: "Consumo por Motorista/Operador", item: 14 },
  { name: "fuel_usage_vehicle", label: "Consumo por Veículo", item: 15 },
  { name: "fuel_usage_fleet", label: "Consumo por Frota", item: 16 },
  { name: "equipment_configuration", label: "Configuração de Equipamento", item: 17 },
];

// Criar configuração de endpoint
router.post("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantEndpointSettings);
    const settings = repo.create(req.body);
    await repo.save(settings);
    
    logger.info("Endpoint settings created", { 
      tenantId: settings.tenant_id,
      endpoint: settings.endpoint_name 
    });
    
    res.status(201).json(settings);
  } catch (error: any) {
    logger.error("Error creating endpoint settings", { error: error.message });
    res.status(500).json({ error: "Failed to create endpoint settings" });
  }
});

// Listar configurações de um tenant
router.get("/tenant/:tenantId", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantEndpointSettings);
    const settings = await repo.find({
      where: { tenant_id: req.params.tenantId },
      order: { endpoint_name: "ASC" },
    });
    
    res.json(settings);
  } catch (error: any) {
    logger.error("Error fetching endpoint settings", { error: error.message });
    res.status(500).json({ error: "Failed to fetch endpoint settings" });
  }
});

// Listar endpoints disponíveis
router.get("/available", async (req, res) => {
  res.json(AVAILABLE_ENDPOINTS);
});

// Atualizar configuração de endpoint
router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantEndpointSettings);
    const settings = await repo.findOneBy({ id: req.params.id });
    
    if (!settings) {
      return res.status(404).json({ error: "Endpoint settings not found" });
    }
    
    repo.merge(settings, req.body);
    await repo.save(settings);
    
    logger.info("Endpoint settings updated", { settingsId: settings.id });
    res.json(settings);
  } catch (error: any) {
    logger.error("Error updating endpoint settings", { error: error.message });
    res.status(500).json({ error: "Failed to update endpoint settings" });
  }
});

// Toggle enabled
router.patch("/:id/toggle", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantEndpointSettings);
    const settings = await repo.findOneBy({ id: req.params.id });
    
    if (!settings) {
      return res.status(404).json({ error: "Endpoint settings not found" });
    }
    
    settings.enabled = !settings.enabled;
    await repo.save(settings);
    
    logger.info("Endpoint toggled", { 
      settingsId: settings.id,
      enabled: settings.enabled 
    });
    
    res.json(settings);
  } catch (error: any) {
    logger.error("Error toggling endpoint", { error: error.message });
    res.status(500).json({ error: "Failed to toggle endpoint" });
  }
});

// Deletar configuração
router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantEndpointSettings);
    const result = await repo.delete(req.params.id);
    
    if (result.affected === 0) {
      return res.status(404).json({ error: "Endpoint settings not found" });
    }
    
    logger.info("Endpoint settings deleted", { settingsId: req.params.id });
    res.status(204).send();
  } catch (error: any) {
    logger.error("Error deleting endpoint settings", { error: error.message });
    res.status(500).json({ error: "Failed to delete endpoint settings" });
  }
});

export default router;
