import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class AddAllFuelUsageTables1704532000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabela: fuel_usage_refueling (Item 05)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_refueling",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "refueling_date", type: "date", isNullable: false },
          { name: "equipment_id", type: "varchar", length: "255", isNullable: true },
          { name: "equipment_name", type: "varchar", length: "500", isNullable: true },
          { name: "driver_name", type: "varchar", length: "255", isNullable: true },
          { name: "fuel_type", type: "varchar", length: "100", isNullable: true },
          { name: "liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "price_per_liter", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "odometer", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "hour_meter", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "supplier", type: "varchar", length: "500", isNullable: true },
          { name: "location", type: "varchar", length: "500", isNullable: true },
          { name: "notes", type: "text", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_refueling", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_refueling", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_refueling", new TableIndex({ columnNames: ["tenant_id", "refueling_date"] }));

    // Tabela: fuel_usage_period (Item 06)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_period",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "period_type", type: "varchar", length: "50", isNullable: false },
          { name: "period_start", type: "date", isNullable: false },
          { name: "period_end", type: "date", isNullable: false },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "equipment_count", type: "integer", isNullable: true },
          { name: "refueling_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_period", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_period", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_period", new TableIndex({ columnNames: ["tenant_id", "period_type", "period_start"] }));

    // Tabela: fuel_usage_worksite (Item 08)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_worksite",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "worksite_code", type: "varchar", length: "255", isNullable: true },
          { name: "worksite_name", type: "varchar", length: "500", isNullable: false },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "equipment_count", type: "integer", isNullable: true },
          { name: "location", type: "varchar", length: "500", isNullable: true },
          { name: "status", type: "varchar", length: "100", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_worksite", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_worksite", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_worksite", new TableIndex({ columnNames: ["tenant_id", "worksite_code"] }));

    // Tabela: fuel_usage_cost_center (Item 09)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_cost_center",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "cost_center_code", type: "varchar", length: "255", isNullable: true },
          { name: "cost_center_name", type: "varchar", length: "500", isNullable: false },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "equipment_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_cost_center", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_cost_center", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_cost_center", new TableIndex({ columnNames: ["tenant_id", "cost_center_code"] }));

    // Tabela: fuel_usage_equipment_type (Item 10)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_equipment_type",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "type_code", type: "varchar", length: "255", isNullable: true },
          { name: "type_name", type: "varchar", length: "500", isNullable: false },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "equipment_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_equipment_type", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_equipment_type", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_equipment_type", new TableIndex({ columnNames: ["tenant_id", "type_code"] }));

    // Tabela: fuel_usage_equipment_group (Item 11)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_equipment_group",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "group_code", type: "varchar", length: "255", isNullable: true },
          { name: "group_name", type: "varchar", length: "500", isNullable: false },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "equipment_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_equipment_group", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_equipment_group", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_equipment_group", new TableIndex({ columnNames: ["tenant_id", "group_code"] }));

    // Tabela: fuel_usage_company (Item 12)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_company",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "company_code", type: "varchar", length: "255", isNullable: true },
          { name: "company_name", type: "varchar", length: "500", isNullable: false },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "equipment_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_company", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_company", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_company", new TableIndex({ columnNames: ["tenant_id", "company_code"] }));

    // Tabela: fuel_usage_consolidated (Item 13)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_consolidated",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "group_by_type", type: "varchar", length: "100", isNullable: false },
          { name: "group_by_value", type: "varchar", length: "500", isNullable: true },
          { name: "period_start", type: "date", isNullable: false },
          { name: "period_end", type: "date", isNullable: false },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "record_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_consolidated", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_consolidated", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_consolidated", new TableIndex({ columnNames: ["tenant_id", "group_by_type", "period_start"] }));

    // Tabela: fuel_usage_driver (Item 14)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_driver",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "driver_code", type: "varchar", length: "255", isNullable: true },
          { name: "driver_name", type: "varchar", length: "500", isNullable: false },
          { name: "license_number", type: "varchar", length: "50", isNullable: true },
          { name: "license_category", type: "varchar", length: "50", isNullable: true },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_hours", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_hour", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "trips_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_driver", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_driver", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_driver", new TableIndex({ columnNames: ["tenant_id", "driver_code"] }));

    // Tabela: fuel_usage_vehicle (Item 15)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_vehicle",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "license_plate", type: "varchar", length: "50", isNullable: true },
          { name: "vehicle_name", type: "varchar", length: "500", isNullable: false },
          { name: "brand", type: "varchar", length: "255", isNullable: true },
          { name: "model", type: "varchar", length: "255", isNullable: true },
          { name: "year", type: "integer", isNullable: true },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_kilometers", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_km", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "refueling_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_vehicle", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_vehicle", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_vehicle", new TableIndex({ columnNames: ["tenant_id", "license_plate"] }));

    // Tabela: fuel_usage_fleet (Item 16)
    await queryRunner.createTable(
      new Table({
        name: "fuel_usage_fleet",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "fleet_code", type: "varchar", length: "255", isNullable: true },
          { name: "fleet_name", type: "varchar", length: "500", isNullable: false },
          { name: "period_start", type: "date", isNullable: true },
          { name: "period_end", type: "date", isNullable: true },
          { name: "total_liters", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_cost", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "total_kilometers", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "average_consumption_per_km", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "vehicle_count", type: "integer", isNullable: true },
          { name: "refueling_count", type: "integer", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("fuel_usage_fleet", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("fuel_usage_fleet", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("fuel_usage_fleet", new TableIndex({ columnNames: ["tenant_id", "fleet_code"] }));

    // Tabela: equipment_configuration (Item 17)
    await queryRunner.createTable(
      new Table({
        name: "equipment_configuration",
        columns: [
          { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tenant_id", type: "integer", isNullable: false },
          { name: "external_id", type: "varchar", length: "255", isNullable: false },
          { name: "equipment_code", type: "varchar", length: "255", isNullable: true },
          { name: "equipment_name", type: "varchar", length: "500", isNullable: false },
          { name: "equipment_type", type: "varchar", length: "255", isNullable: true },
          { name: "equipment_group", type: "varchar", length: "255", isNullable: true },
          { name: "manufacturer", type: "varchar", length: "255", isNullable: true },
          { name: "model", type: "varchar", length: "255", isNullable: true },
          { name: "manufacturing_year", type: "integer", isNullable: true },
          { name: "serial_number", type: "varchar", length: "255", isNullable: true },
          { name: "tank_capacity", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "expected_average_consumption", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "current_hour_meter", type: "decimal", precision: 10, scale: 2, isNullable: true },
          { name: "is_active", type: "boolean", default: true },
          { name: "acquisition_date", type: "date", isNullable: true },
          { name: "acquisition_value", type: "decimal", precision: 15, scale: 2, isNullable: true },
          { name: "worksite", type: "varchar", length: "255", isNullable: true },
          { name: "cost_center", type: "varchar", length: "255", isNullable: true },
          { name: "notes", type: "text", isNullable: true },
          { name: "data_hash", type: "varchar", length: "64", isNullable: true },
          { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true
    );

    await queryRunner.createIndex("equipment_configuration", new TableIndex({ columnNames: ["tenant_id"] }));
    await queryRunner.createIndex("equipment_configuration", new TableIndex({ columnNames: ["tenant_id", "external_id"], isUnique: true }));
    await queryRunner.createIndex("equipment_configuration", new TableIndex({ columnNames: ["tenant_id", "equipment_code"] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("equipment_configuration");
    await queryRunner.dropTable("fuel_usage_fleet");
    await queryRunner.dropTable("fuel_usage_vehicle");
    await queryRunner.dropTable("fuel_usage_driver");
    await queryRunner.dropTable("fuel_usage_consolidated");
    await queryRunner.dropTable("fuel_usage_company");
    await queryRunner.dropTable("fuel_usage_equipment_group");
    await queryRunner.dropTable("fuel_usage_equipment_type");
    await queryRunner.dropTable("fuel_usage_cost_center");
    await queryRunner.dropTable("fuel_usage_worksite");
    await queryRunner.dropTable("fuel_usage_period");
    await queryRunner.dropTable("fuel_usage_refueling");
  }
}
