import { BaseConnector, FetchResult } from "./BaseConnector";
import { AppDataSource } from "../data-source";
import { FuelUsageEquipment } from "../entities/FuelUsageEquipment";
import { logger } from "../utils/logger";

export class FuelUsageEquipmentConnector extends BaseConnector {
  getEndpointName(): string {
    return "fuel_usage_equipment";
  }

  async fetch(checkpoint: any): Promise<FetchResult> {
    const params: any = {
      page: checkpoint?.page || 1,
      limit: 100,
    };

    if (this.context.settings.window_hours) {
      const now = new Date();
      const windowStart = new Date(now.getTime() - this.context.settings.window_hours * 60 * 60 * 1000);
      params.dataInicio = windowStart.toISOString();
      params.dataFim = now.toISOString();
    }

    try {
      const response = await this.client.get("/api/consumo/equipamento", { params });
      
      const items = response.data.items || response.data.data || [];
      const hasMore = response.data.hasMore || response.data.nextPage || false;
      const nextPage = hasMore ? (params.page + 1) : null;

      return {
        items,
        nextCheckpoint: nextPage ? { page: nextPage } : undefined,
        hasMore: hasMore && items.length > 0,
      };
    } catch (error: any) {
      logger.error("Error fetching from Tacweb API", {
        endpoint: this.getEndpointName(),
        error: error.message,
      });
      throw error;
    }
  }

  normalize(item: any): any {
    return {
      tenant_id: this.context.tenantId,
      external_id: String(item.id || item.codigo),
      equipamento_id: item.equipamentoId || item.equipamento?.id,
      periodo_inicio: item.periodoInicio ? new Date(item.periodoInicio) : null,
      periodo_fim: item.periodoFim ? new Date(item.periodoFim) : null,
      litros: parseFloat(item.litros || 0),
      abastecimentos: parseInt(item.abastecimentos || 0),
      consumo_medio: parseFloat(item.consumoMedio || 0),
      source_timestamp: item.atualizadoEm ? new Date(item.atualizadoEm) : new Date(),
      raw_data: JSON.stringify(item),
    };
  }

  async upsert(normalized: any): Promise<boolean> {
    try {
      const repo = AppDataSource.getRepository(FuelUsageEquipment);
      
      await repo.upsert(normalized, {
        conflictPaths: ["tenant_id", "external_id"],
        skipUpdateIfNoValuesChanged: true,
      });
      
      return true;
    } catch (error: any) {
      logger.error("Error upserting fuel usage equipment", {
        error: error.message,
        data: normalized,
      });
      return false;
    }
  }
}
