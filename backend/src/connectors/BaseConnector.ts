import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { AppDataSource } from "../data-source";
import { TenantCredentials } from "../entities/TenantCredentials";
import { TenantEndpointSettings } from "../entities/TenantEndpointSettings";
import { Encryption } from "../utils/encryption";
import { logger } from "../utils/logger";

export interface TenantContext {
  tenantId: string;
  credentials: TenantCredentials;
  settings: TenantEndpointSettings;
}

export interface FetchResult {
  items: any[];
  nextCheckpoint?: string;
  hasMore: boolean;
}

export abstract class BaseConnector {
  protected client: AxiosInstance;
  protected context: TenantContext;

  constructor(context: TenantContext) {
    this.context = context;
    this.client = this.createAxiosClient();
  }

  protected createAxiosClient(): AxiosInstance {
    const { credentials, settings } = this.context;
    
    const config: AxiosRequestConfig = {
      baseURL: credentials.base_url,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Configurar autenticação
    if (credentials.auth_type === "bearer" && credentials.token_encrypted) {
      const token = Encryption.decrypt(credentials.token_encrypted);
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } else if (credentials.auth_type === "api_key" && credentials.api_key_encrypted) {
      const apiKey = Encryption.decrypt(credentials.api_key_encrypted);
      config.headers = {
        ...config.headers,
        "X-API-Key": apiKey,
      };
    } else if (credentials.auth_type === "basic" && credentials.client_id && credentials.client_secret_encrypted) {
      const clientSecret = Encryption.decrypt(credentials.client_secret_encrypted);
      const auth = Buffer.from(`${credentials.client_id}:${clientSecret}`).toString("base64");
      config.headers = {
        ...config.headers,
        Authorization: `Basic ${auth}`,
      };
    }

    return axios.create(config);
  }

  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async respectRateLimit(): Promise<void> {
    const rateLimit = this.context.settings.rate_limit_per_minute;
    const delayMs = (60 / rateLimit) * 1000;
    await this.sleep(delayMs);
  }

  protected parseCheckpoint(checkpoint: string | null): any {
    if (!checkpoint) return null;
    try {
      return JSON.parse(checkpoint);
    } catch {
      return null;
    }
  }

  protected stringifyCheckpoint(checkpoint: any): string {
    return JSON.stringify(checkpoint);
  }

  // Métodos abstratos que devem ser implementados pelos conectores
  abstract getEndpointName(): string;
  abstract fetch(checkpoint: any): Promise<FetchResult>;
  abstract normalize(item: any): any;
  abstract upsert(normalized: any): Promise<boolean>;

  // Método principal de execução
  async execute(): Promise<{ fetched: number; upserted: number }> {
    const { settings } = this.context;
    const checkpoint = this.parseCheckpoint(settings.last_checkpoint);
    
    let totalFetched = 0;
    let totalUpserted = 0;
    let currentCheckpoint = checkpoint;
    let hasMore = true;

    logger.info(`Starting connector execution`, {
      tenantId: this.context.tenantId,
      endpoint: this.getEndpointName(),
    });

    try {
      while (hasMore) {
        const result = await this.fetch(currentCheckpoint);
        
        for (const item of result.items) {
          try {
            const normalized = this.normalize(item);
            const saved = await this.upsert(normalized);
            if (saved) totalUpserted++;
          } catch (error: any) {
            logger.error("Error processing item", {
              endpoint: this.getEndpointName(),
              error: error.message,
              item,
            });
          }
        }

        totalFetched += result.items.length;
        currentCheckpoint = result.nextCheckpoint;
        hasMore = result.hasMore;

        // Respeitar rate limit
        if (hasMore) {
          await this.respectRateLimit();
        }
      }

      // Atualizar checkpoint
      if (currentCheckpoint) {
        await this.updateCheckpoint(currentCheckpoint);
      }

      logger.info("Connector execution completed", {
        tenantId: this.context.tenantId,
        endpoint: this.getEndpointName(),
        fetched: totalFetched,
        upserted: totalUpserted,
      });

      return { fetched: totalFetched, upserted: totalUpserted };
    } catch (error: any) {
      logger.error("Connector execution failed", {
        tenantId: this.context.tenantId,
        endpoint: this.getEndpointName(),
        error: error.message,
      });
      throw error;
    }
  }

  private async updateCheckpoint(checkpoint: any): Promise<void> {
    const repo = AppDataSource.getRepository(TenantEndpointSettings);
    const { settings } = this.context;
    
    settings.last_checkpoint = this.stringifyCheckpoint(checkpoint);
    await repo.save(settings);
  }
}
