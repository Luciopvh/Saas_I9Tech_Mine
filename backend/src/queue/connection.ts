import { Redis } from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisConnection.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

export default redisConnection;
