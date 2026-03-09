import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "pg";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_TXT_PATH = path.resolve(__dirname, "..", "..", "db.txt");

function parseDbTxt(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const config = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      if (!config.connectionString) config.connectionString = trimmed;
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!value) continue;

    if (key === "database_url" || key === "connection_string") {
      config.connectionString = value;
    } else if (key === "user") {
      config.user = value;
    } else if (key === "password") {
      config.password = value;
    } else if (key === "host") {
      config.host = value;
    } else if (key === "port") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) config.port = parsed;
    } else if (key === "database" || key === "dbname") {
      config.database = value;
    } else if (key === "ssl") {
      config.ssl = value === "true" ? { rejectUnauthorized: false } : false;
    }
  }

  return config;
}

function buildPoolConfig() {
  const txtConfig = parseDbTxt(DB_TXT_PATH);
  const envUrl = process.env.DATABASE_URL;

  const connectionString = envUrl || txtConfig.connectionString;
  if (connectionString) {
    return {
      connectionString,
      ssl: txtConfig.ssl ?? false,
    };
  }

  const config = {
    user: process.env.PGUSER || txtConfig.user,
    password: process.env.PGPASSWORD || txtConfig.password,
    host: process.env.PGHOST || txtConfig.host || "localhost",
    port: Number(process.env.PGPORT || txtConfig.port || 5432),
    database: process.env.PGDATABASE || txtConfig.database,
    ssl: txtConfig.ssl ?? false,
  };

  if (!config.database) {
    throw new Error(
      "PostgreSQL config is missing. Fill db.txt (DATABASE_URL or database/user/password/host/port)."
    );
  }

  return config;
}

export const pool = new Pool(buildPoolConfig());

export async function testDbConnection() {
  await pool.query("SELECT 1");
}