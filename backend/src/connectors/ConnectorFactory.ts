import { BaseConnector, TenantContext } from "./BaseConnector";
import { FuelUsageUtilizationConnector } from "./FuelUsageUtilizationConnector";
import { FuelUsageEquipmentConnector } from "./FuelUsageEquipmentConnector";
import { FuelUsageRefuelingConnector } from "./FuelUsageRefuelingConnector";
import { FuelUsagePeriodConnector } from "./FuelUsagePeriodConnector";
import { FuelUsageWorksiteConnector } from "./FuelUsageWorksiteConnector";
import { FuelUsageCostCenterConnector } from "./FuelUsageCostCenterConnector";
import { FuelUsageEquipmentTypeConnector } from "./FuelUsageEquipmentTypeConnector";
import { FuelUsageEquipmentGroupConnector } from "./FuelUsageEquipmentGroupConnector";
import { FuelUsageCompanyConnector } from "./FuelUsageCompanyConnector";
import { FuelUsageConsolidatedConnector } from "./FuelUsageConsolidatedConnector";
import { FuelUsageDriverConnector } from "./FuelUsageDriverConnector";
import { FuelUsageVehicleConnector } from "./FuelUsageVehicleConnector";
import { FuelUsageFleetConnector } from "./FuelUsageFleetConnector";
import { EquipmentConfigurationConnector } from "./EquipmentConfigurationConnector";

export class ConnectorFactory {
  static create(endpointName: string, context: TenantContext): BaseConnector {
    switch (endpointName) {
      case "fuel_usage_utilization":
        return new FuelUsageUtilizationConnector(context);
      
      case "fuel_usage_equipment":
        return new FuelUsageEquipmentConnector(context);
      
      case "fuel_usage_refueling":
        return new FuelUsageRefuelingConnector(context);
      
      case "fuel_usage_period":
        return new FuelUsagePeriodConnector(context);
      
      case "fuel_usage_worksite":
        return new FuelUsageWorksiteConnector(context);
      
      case "fuel_usage_cost_center":
        return new FuelUsageCostCenterConnector(context);
      
      case "fuel_usage_equipment_type":
        return new FuelUsageEquipmentTypeConnector(context);
      
      case "fuel_usage_equipment_group":
        return new FuelUsageEquipmentGroupConnector(context);
      
      case "fuel_usage_company":
        return new FuelUsageCompanyConnector(context);
      
      case "fuel_usage_consolidated":
        return new FuelUsageConsolidatedConnector(context);
      
      case "fuel_usage_driver":
        return new FuelUsageDriverConnector(context);
      
      case "fuel_usage_vehicle":
        return new FuelUsageVehicleConnector(context);
      
      case "fuel_usage_fleet":
        return new FuelUsageFleetConnector(context);
      
      case "equipment_configuration":
        return new EquipmentConfigurationConnector(context);
      
      default:
        throw new Error(`Unknown endpoint: ${endpointName}`);
    }
  }
}

export default ConnectorFactory;
