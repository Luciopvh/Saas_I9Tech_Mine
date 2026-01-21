import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsageVehicle } from '../entities/FuelUsageVehicle';

export class FuelUsageVehicleConnector extends BaseConnector {
  protected endpoint = '/consumo/veiculo';

  async fetch(page: number = 1): Promise<any> {
    const response = await this.client.get(this.endpoint, { params: { page, per_page: 25 } });
    return response.data;
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    return dataArray.map((item: any) => ({
      external_id: String(item.id || item.veiculo_id || `veic_${Date.now()}_${Math.random()}`),
      license_plate: item.placa,
      vehicle_name: item.nome_veiculo || item.veiculo,
      brand: item.marca,
      model: item.modelo,
      year: parseInt(item.ano || 0),
      period_start: item.data_inicio,
      period_end: item.data_fim,
      total_liters: parseFloat(item.total_litros || 0),
      total_cost: parseFloat(item.custo_total || 0),
      total_kilometers: parseFloat(item.total_km || item.quilometragem || 0),
      average_consumption_per_km: parseFloat(item.consumo_medio_km || 0),
      refueling_count: parseInt(item.quantidade_abastecimentos || 0)
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsageVehicle);
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
