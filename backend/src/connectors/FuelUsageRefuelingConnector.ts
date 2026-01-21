import { BaseConnector } from './BaseConnector';
import { AppDataSource } from '../data-source';
import { FuelUsageRefueling } from '../entities/FuelUsageRefueling';

export class FuelUsageRefuelingConnector extends BaseConnector {
  protected endpoint = '/consumo/abastecimento';

  async fetch(page: number = 1): Promise<any> {
    try {
      const response = await this.client.get(this.endpoint, {
        params: { page, per_page: 25 }
      });
      return response.data;
    } catch (error: any) {
      this.logger.error('Erro ao buscar dados de abastecimento', {
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
      external_id: String(item.id || item.abastecimento_id || `ref_${Date.now()}_${Math.random()}`),
      refueling_date: item.data || item.data_abastecimento,
      equipment_id: item.equipamento_id,
      equipment_name: item.equipamento_nome || item.equipamento,
      driver_name: item.motorista || item.operador,
      fuel_type: item.tipo_combustivel || 'diesel',
      liters: parseFloat(item.litros || item.quantidade || 0),
      price_per_liter: parseFloat(item.preco_litro || item.valor_litro || 0),
      total_cost: parseFloat(item.valor_total || item.custo_total || 0),
      odometer: parseFloat(item.odometro || item.km || 0),
      hour_meter: parseFloat(item.horimetro || 0),
      supplier: item.fornecedor || item.posto,
      location: item.local || item.localizacao,
      notes: item.observacoes || item.notas
    }));
  }

  async upsert(normalizedData: any[]): Promise<void> {
    const repository = AppDataSource.getRepository(FuelUsageRefueling);

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
          this.logger.info('Registro de abastecimento atualizado', {
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
        this.logger.info('Novo registro de abastecimento criado', {
          external_id: data.external_id
        });
      }
    }
  }
}
