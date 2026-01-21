import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsageConsolidated } from '../entities/FuelUsageConsolidated';

export class FuelUsageConsolidatedConnector extends BaseConnector {
  protected endpoint = '/consumo/consolidado';

  async fetch(page: number = 1): Promise<any> {
    const response = await this.client.get(this.endpoint, { params: { page, per_page: 25 } });
    return response.data;
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    return dataArray.map((item: any) => ({
      external_id: String(item.id || `cons_${Date.now()}_${Math.random()}`),
      group_by_type: item.agrupar_por || item.tipo_agrupamento || 'equipamento',
      group_by_value: item.valor_agrupamento || item.nome,
      period_start: item.data_inicio || item.periodo_inicio,
      period_end: item.data_fim || item.periodo_fim,
      total_liters: parseFloat(item.total_litros || 0),
      total_cost: parseFloat(item.custo_total || 0),
      total_hours: parseFloat(item.total_horas || 0),
      average_consumption_per_hour: parseFloat(item.consumo_medio_hora || 0),
      record_count: parseInt(item.quantidade_registros || 0)
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsageConsolidated);
    for (const data of normalizedData) {
      const dataHash = this.generateHash(data);
      const existing = await repository.findOne({ where: { tenant_id: this.context.tenantId, external_id: data.external_id } });
      if (existing && existing.data_hash !== dataHash) {
        await repository.update(existing.id, { ...data, data_hash: dataHash, tenant_id: this.context.tenantId });
      } else if (!existing) {
        await repository.save({ ...data, data_hash: dataHash, tenant_id: this.context.tenantId });
      }
    }
  }
}
