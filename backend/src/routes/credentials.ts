import { Router } from "express";
import { AppDataSource } from "../data-source";
import { TenantCredentials } from "../entities/TenantCredentials";
import { Encryption } from "../utils/encryption";
import { logger } from "../utils/logger";

const router = Router();

// Criar credenciais
router.post("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantCredentials);
    const data = req.body;
    
    // Criptografar campos sensíveis
    if (data.client_secret) {
      data.client_secret_encrypted = Encryption.encrypt(data.client_secret);
      delete data.client_secret;
    }
    
    if (data.token) {
      data.token_encrypted = Encryption.encrypt(data.token);
      delete data.token;
    }
    
    if (data.api_key) {
      data.api_key_encrypted = Encryption.encrypt(data.api_key);
      delete data.api_key;
    }
    
    const credentials = repo.create(data);
    await repo.save(credentials);
    
    logger.info("Credentials created", { 
      tenantId: credentials.tenant_id,
      provider: credentials.provider 
    });
    
    res.status(201).json(credentials);
  } catch (error: any) {
    logger.error("Error creating credentials", { error: error.message });
    res.status(500).json({ error: "Failed to create credentials" });
  }
});

// Listar credenciais de um tenant
router.get("/tenant/:tenantId", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantCredentials);
    const credentials = await repo.find({
      where: { tenant_id: req.params.tenantId },
      order: { created_at: "DESC" },
    });
    
    // Não retornar dados sensíveis descriptografados
    const sanitized = credentials.map(cred => ({
      ...cred,
      client_secret_encrypted: cred.client_secret_encrypted ? "***" : null,
      token_encrypted: cred.token_encrypted ? "***" : null,
      api_key_encrypted: cred.api_key_encrypted ? "***" : null,
    }));
    
    res.json(sanitized);
  } catch (error: any) {
    logger.error("Error fetching credentials", { error: error.message });
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
});

// Buscar credencial por ID
router.get("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantCredentials);
    const credentials = await repo.findOneBy({ id: req.params.id });
    
    if (!credentials) {
      return res.status(404).json({ error: "Credentials not found" });
    }
    
    // Sanitizar
    const sanitized = {
      ...credentials,
      client_secret_encrypted: credentials.client_secret_encrypted ? "***" : null,
      token_encrypted: credentials.token_encrypted ? "***" : null,
      api_key_encrypted: credentials.api_key_encrypted ? "***" : null,
    };
    
    res.json(sanitized);
  } catch (error: any) {
    logger.error("Error fetching credentials", { error: error.message });
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
});

// Atualizar credenciais
router.put("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantCredentials);
    const credentials = await repo.findOneBy({ id: req.params.id });
    
    if (!credentials) {
      return res.status(404).json({ error: "Credentials not found" });
    }
    
    const data = req.body;
    
    // Criptografar campos sensíveis se fornecidos
    if (data.client_secret) {
      data.client_secret_encrypted = Encryption.encrypt(data.client_secret);
      delete data.client_secret;
    }
    
    if (data.token) {
      data.token_encrypted = Encryption.encrypt(data.token);
      delete data.token;
    }
    
    if (data.api_key) {
      data.api_key_encrypted = Encryption.encrypt(data.api_key);
      delete data.api_key;
    }
    
    repo.merge(credentials, data);
    await repo.save(credentials);
    
    logger.info("Credentials updated", { credentialsId: credentials.id });
    res.json(credentials);
  } catch (error: any) {
    logger.error("Error updating credentials", { error: error.message });
    res.status(500).json({ error: "Failed to update credentials" });
  }
});

// Deletar credenciais
router.delete("/:id", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(TenantCredentials);
    const result = await repo.delete(req.params.id);
    
    if (result.affected === 0) {
      return res.status(404).json({ error: "Credentials not found" });
    }
    
    logger.info("Credentials deleted", { credentialsId: req.params.id });
    res.status(204).send();
  } catch (error: any) {
    logger.error("Error deleting credentials", { error: error.message });
    res.status(500).json({ error: "Failed to delete credentials" });
  }
});

export default router;
