import { BaseConnector, FetchResult } from "./BaseConnector";
import { AppDataSource } from "../data-source";
import { FuelUsageUtilization } from "../entities/FuelUsageUtilization";
import { logger } from "../utils/logger";

export class FuelUsageUtilizationConnector extends BaseConnector {
  getEndpointName(): string {
    return "fuel_usage_utilization";
  }

  async fetch(checkpoint: any): Promise<FetchResult> {
    const params: any = {
      page: checkpoint?.page || 1,
      limit: 100,
    };

    // Janela temporal
    if (this.context.settings.window_hours) {
      const now = new Date();
      const windowStart = new Date(now.getTime() - this.context.settings.window_hours * 60 * 60 * 1000);
      params.dataInicio = windowStart.toISOString();
      params.dataFim = now.toISOString();
    }

    try {
      // Endpoint conforme manual Tacweb (ajustar conforme documentação real)
      const response = await this.client.get("/api/consumo/utilizacao", { params });
      
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
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  normalize(item: any): any {
    return {
      tenant_id: this.context.tenantId,
      external_id: String(item.id || item.codigo || item.identificador),
      equipamento_id: item.equipamentoId || item.equipamento?.id,
      obra_id: item.obraId || item.obra?.id,
      periodo_inicio: item.periodoInicio ? new Date(item.periodoInicio) : null,
      periodo_fim: item.periodoFim ? new Date(item.periodoFim) : null,
      litros: parseFloat(item.litros || 0),
      horas_trabalhadas: parseFloat(item.horasTrabalhadas || item.horas || 0),
      consumo_por_hora: this.calculateConsumption(item),
      source_timestamp: item.atualizadoEm ? new Date(item.atualizadoEm) : new Date(),
      raw_data: JSON.stringify(item),
    };
  }

  private calculateConsumption(item: any): number {
    const litros = parseFloat(item.litros || 0);
    const horas = parseFloat(item.horasTrabalhadas || item.horas || 0);
    
    if (horas > 0) {
      return litros / horas;
    }
    
    return 0;
  }

  async upsert(normalized: any): Promise<boolean> {
    try {
      const repo = AppDataSource.getRepository(FuelUsageUtilization);
      
      await repo.upsert(normalized, {
        conflictPaths: ["tenant_id", "external_id"],
        skipUpdateIfNoValuesChanged: true,
      });
      
      return true;
    } catch (error: any) {
      logger.error("Error upserting fuel usage utilization", {
        error: error.message,
        data: normalized,
      });
      return false;
    }
  }
}
