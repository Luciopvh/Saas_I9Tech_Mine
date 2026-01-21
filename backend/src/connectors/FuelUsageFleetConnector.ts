import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsageFleet } from '../entities/FuelUsageFleet';

export class FuelUsageFleetConnector extends BaseConnector {
  protected endpoint = '/consumo/frota';

  async fetch(page: number = 1): Promise<any> {
    const response = await this.client.get(this.endpoint, { params: { page, per_page: 25 } });
    return response.data;
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    return dataArray.map((item: any) => ({
      external_id: String(item.id || item.frota_id || `frota_${Date.now()}_${Math.random()}`),
      fleet_code: item.codigo_frota || item.codigo,
      fleet_name: item.nome_frota || item.frota,
      period_start: item.data_inicio,
      period_end: item.data_fim,
      total_liters: parseFloat(item.total_litros || 0),
      total_cost: parseFloat(item.custo_total || 0),
      total_kilometers: parseFloat(item.total_km || 0),
      average_consumption_per_km: parseFloat(item.consumo_medio_km || 0),
      vehicle_count: parseInt(item.quantidade_veiculos || 0),
      refueling_count: parseInt(item.quantidade_abastecimentos || 0)
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsageFleet);
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
