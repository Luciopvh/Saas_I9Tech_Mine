import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsageWorksite } from '../entities/FuelUsageWorksite';

export class FuelUsageWorksiteConnector extends BaseConnector {
  protected endpoint = '/consumo/obra';

  async fetch(page: number = 1): Promise<any> {
    const response = await this.client.get(this.endpoint, { params: { page, per_page: 25 } });
    return response.data;
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    return dataArray.map((item: any) => ({
      external_id: String(item.id || item.obra_id || `obra_${Date.now()}_${Math.random()}`),
      worksite_code: item.codigo_obra || item.codigo,
      worksite_name: item.nome_obra || item.obra,
      period_start: item.data_inicio || item.periodo_inicio,
      period_end: item.data_fim || item.periodo_fim,
      total_liters: parseFloat(item.total_litros || 0),
      total_cost: parseFloat(item.custo_total || 0),
      total_hours: parseFloat(item.total_horas || 0),
      average_consumption_per_hour: parseFloat(item.consumo_medio_hora || 0),
      equipment_count: parseInt(item.quantidade_equipamentos || 0),
      location: item.localizacao || item.local,
      status: item.status || 'ativa'
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsageWorksite);
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
