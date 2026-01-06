import { BaseConnector, TenantContext } from "./BaseConnector";
import { FuelUsageUtilizationConnector } from "./FuelUsageUtilizationConnector";
import { FuelUsageEquipmentConnector } from "./FuelUsageEquipmentConnector";

export class ConnectorFactory {
  static create(endpointName: string, context: TenantContext): BaseConnector {
    switch (endpointName) {
      case "fuel_usage_utilization":
        return new FuelUsageUtilizationConnector(context);
      
      case "fuel_usage_equipment":
        return new FuelUsageEquipmentConnector(context);
      
      // TODO: Implementar os outros 11 conectores
      case "fuel_usage_refueling":
      case "fuel_usage_period":
      case "fuel_usage_worksite":
      case "fuel_usage_cost_center":
      case "fuel_usage_equipment_type":
      case "fuel_usage_equipment_group":
      case "fuel_usage_company":
      case "fuel_usage_consolidated":
      case "fuel_usage_driver":
      case "fuel_usage_vehicle":
      case "fuel_usage_fleet":
      case "equipment_configuration":
        throw new Error(`Connector for ${endpointName} not implemented yet`);
      
      default:
        throw new Error(`Unknown endpoint: ${endpointName}`);
    }
  }
}

export default ConnectorFactory;
