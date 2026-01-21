import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsageCostCenter } from '../entities/FuelUsageCostCenter';

export class FuelUsageCostCenterConnector extends BaseConnector {
  protected endpoint = '/consumo/centro-custo';

  async fetch(page: number = 1): Promise<any> {
    const response = await this.client.get(this.endpoint, { params: { page, per_page: 25 } });
    return response.data;
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    return dataArray.map((item: any) => ({
      external_id: String(item.id || item.centro_custo_id || `cc_${Date.now()}_${Math.random()}`),
      cost_center_code: item.codigo_centro_custo || item.codigo,
      cost_center_name: item.nome_centro_custo || item.centro_custo,
      period_start: item.data_inicio || item.periodo_inicio,
      period_end: item.data_fim || item.periodo_fim,
      total_liters: parseFloat(item.total_litros || 0),
      total_cost: parseFloat(item.custo_total || 0),
      total_hours: parseFloat(item.total_horas || 0),
      average_consumption_per_hour: parseFloat(item.consumo_medio_hora || 0),
      equipment_count: parseInt(item.quantidade_equipamentos || 0)
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsageCostCenter);
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
