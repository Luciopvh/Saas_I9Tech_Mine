import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { EquipmentConfiguration } from '../entities/EquipmentConfiguration';

export class EquipmentConfigurationConnector extends BaseConnector {
  protected endpoint = '/configuracao/equipamento';

  async fetch(page: number = 1): Promise<any> {
    const response = await this.client.get(this.endpoint, { params: { page, per_page: 25 } });
    return response.data;
  }

  async normalize(rawData: any): Promise<any[]> {
    const dataArray = Array.isArray(rawData.data) ? rawData.data : [rawData];
    return dataArray.map((item: any) => ({
      external_id: String(item.id || item.equipamento_id || `equip_${Date.now()}_${Math.random()}`),
      equipment_code: item.codigo || item.codigo_equipamento,
      equipment_name: item.nome || item.nome_equipamento,
      equipment_type: item.tipo || item.tipo_equipamento,
      equipment_group: item.grupo || item.grupo_equipamento,
      manufacturer: item.fabricante,
      model: item.modelo,
      manufacturing_year: parseInt(item.ano_fabricacao || item.ano || 0),
      serial_number: item.numero_serie || item.serie,
      tank_capacity: parseFloat(item.capacidade_tanque || 0),
      expected_average_consumption: parseFloat(item.consumo_medio_esperado || item.consumo_esperado || 0),
      current_hour_meter: parseFloat(item.horimetro_atual || item.horimetro || 0),
      is_active: item.ativo !== undefined ? item.ativo : true,
      acquisition_date: item.data_aquisicao,
      acquisition_value: parseFloat(item.valor_aquisicao || 0),
      worksite: item.obra,
      cost_center: item.centro_custo,
      notes: item.observacoes || item.notas
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(EquipmentConfiguration);
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
