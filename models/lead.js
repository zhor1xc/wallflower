import { pool } from "../server/db.js";

const LEADS_TABLE = process.env.LEADS_TABLE || "leads";

function assertSafeIdentifier(value, envName) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe SQL identifier in ${envName}: ${value}`);
  }
  return value;
}

const SAFE_LEADS = assertSafeIdentifier(LEADS_TABLE, "LEADS_TABLE");

export async function createLead(data) {
  const query = `
    INSERT INTO ${SAFE_LEADS} (name, phone, email, comment, type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;

  const values = [
    data.name,
    data.phone,
    data.email  || null,
    data.comment || null,
    data.type,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}