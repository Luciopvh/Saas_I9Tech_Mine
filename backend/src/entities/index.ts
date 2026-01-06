// Core entities
export { Tenant } from "./Tenant";
export { TenantCredentials } from "./TenantCredentials";
export { TenantEndpointSettings } from "./TenantEndpointSettings";
export { IntegrationJob } from "./IntegrationJob";
export { IntegrationJobLog } from "./IntegrationJobLog";

// Fuel usage entities
export { FuelUsageUtilization } from "./FuelUsageUtilization";
export { FuelUsageEquipment } from "./FuelUsageEquipment";

// Nota: As outras 11 entidades de consumo seguem o mesmo padrão
// e podem ser criadas quando necessário:
// - FuelUsageByRefueling (Abastecimento)
// - FuelUsageByPeriod (Período)
// - FuelUsageByWorkSite (Obra)
// - FuelUsageByCostCenter (Centro de Custo)
// - FuelUsageByEquipmentType (Tipo de Equipamento)
// - FuelUsageByEquipmentGroup (Grupo de Equipamento)
// - FuelUsageByCompany (Empresa)
// - FuelUsageConsolidated (Consolidado)
// - FuelUsageByDriver (Motorista/Operador)
// - FuelUsageByVehicle (Veículo)
// - FuelUsageByFleet (Frota)
// - EquipmentConfiguration (Configuração de Equipamento)
