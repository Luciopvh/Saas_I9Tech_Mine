import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

// Suporte para PostgreSQL e SQL Server
const getDataSourceOptions = (): DataSourceOptions => {
  const dbType = (process.env.DB_TYPE || "postgres") as "postgres" | "mssql";
  
  const baseOptions = {
    synchronize: process.env.NODE_ENV === "development", // Apenas em dev
    logging: process.env.NODE_ENV === "development",
    entities: [path.join(__dirname, "entities", "*.{ts,js}")],
    migrations: [path.join(__dirname, "migrations", "*.{ts,js}")],
    subscribers: [path.join(__dirname, "subscribers", "*.{ts,js}")],
  };

  if (dbType === "postgres") {
    return {
      ...baseOptions,
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_DATABASE || "tacweb_integration",
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    } as DataSourceOptions;
  }

  // SQL Server
  return {
    ...baseOptions,
    type: "mssql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USERNAME || "sa",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "tacweb_integration",
    options: {
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate: true,
    },
  } as DataSourceOptions;
};

export const AppDataSource = new DataSource(getDataSourceOptions());

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established successfully");
    return AppDataSource;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};
