import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsageDriver } from '../entities/FuelUsageDriver';

export class FuelUsageDriverConnector extends BaseConnector {
  protected endpoint = '/consumo/motorista';

  async fetch(page: number = 1): Promise<any> {
    const response = await this.client.get(this.endpoint, { params: { page, per_page: 25 } });
    return response.data;
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    return dataArray.map((item: any) => ({
      external_id: String(item.id || item.motorista_id || `mot_${Date.now()}_${Math.random()}`),
      driver_code: item.codigo_motorista || item.codigo,
      driver_name: item.nome_motorista || item.motorista || item.operador,
      license_number: item.numero_cnh || item.cnh,
      license_category: item.categoria_cnh || item.categoria,
      period_start: item.data_inicio,
      period_end: item.data_fim,
      total_liters: parseFloat(item.total_litros || 0),
      total_cost: parseFloat(item.custo_total || 0),
      total_hours: parseFloat(item.total_horas || 0),
      average_consumption_per_hour: parseFloat(item.consumo_medio_hora || 0),
      trips_count: parseInt(item.quantidade_viagens || 0)
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsageDriver);
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
