import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsagePeriod } from '../entities/FuelUsagePeriod';

export class FuelUsagePeriodConnector extends BaseConnector {
  protected endpoint = '/consumo/periodo';

  async fetch(page: number = 1): Promise<any> {
    try {
      const response = await this.client.get(this.endpoint, {
        params: { page, per_page: 25 }
      });
      return response.data;
    } catch (error: any) {
      this.logger.error('Erro ao buscar dados de período', {
        endpoint: this.endpoint,
        page,
        error: error.message
      });
      throw error;
    }
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    
    return dataArray.map((item: any) => ({
      external_id: String(item.id || item.periodo_id || `per_${Date.now()}_${Math.random()}`),
      period_type: item.tipo_periodo || item.periodo || 'daily',
      period_start: item.data_inicio || item.periodo_inicio,
      period_end: item.data_fim || item.periodo_fim,
      total_liters: parseFloat(item.total_litros || item.consumo_total || 0),
      total_cost: parseFloat(item.custo_total || item.valor_total || 0),
      total_hours: parseFloat(item.total_horas || item.horas_trabalhadas || 0),
      average_consumption_per_hour: parseFloat(item.consumo_medio_hora || item.media_hora || 0),
      equipment_count: parseInt(item.quantidade_equipamentos || item.total_equipamentos || 0),
      refueling_count: parseInt(item.quantidade_abastecimentos || item.total_abastecimentos || 0)
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsagePeriod);

    for (const data of normalizedData) {
      const dataHash = this.generateHash(data);
      
      const existing = await repository.findOne({
        where: {
          tenant_id: this.context.tenantId,
          external_id: data.external_id
        }
      });

      if (existing) {
        if (existing.data_hash !== dataHash) {
          await repository.update(existing.id, {
            ...data,
            data_hash: dataHash,
            tenant_id: this.context.tenantId
          });
          this.logger.info('Registro de período atualizado', {
            id: existing.id,
            external_id: data.external_id
          });
        }
      } else {
        await repository.save({
          ...data,
          data_hash: dataHash,
          tenant_id: this.context.tenantId
        });
        this.logger.info('Novo registro de período criado', {
          external_id: data.external_id
        });
      }
    }
  }
}
