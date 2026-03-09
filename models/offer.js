import { pool } from "../server/db.js";

const OFFERS_TABLE = process.env.OFFERS_TABLE || "offers";
const DETAILS_TABLE = process.env.DETAILS_TABLE || "offer_details";

function assertSafeIdentifier(value, envName) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe SQL identifier in ${envName}: ${value}`);
  }
  return value;
}

const SAFE_OFFERS = assertSafeIdentifier(OFFERS_TABLE, "OFFERS_TABLE");
const SAFE_DETAILS = assertSafeIdentifier(DETAILS_TABLE, "DETAILS_TABLE");

export async function getOffers() {
  const query = `
    SELECT
      o.id,
      o.title,
      o.tag,
      o.image_url  AS "imageUrl",
      o.meta,
      d.description,
      d.price,
      d.address
    FROM ${SAFE_OFFERS} o
    LEFT JOIN ${SAFE_DETAILS} d ON d.offer_id = o.id
    WHERE o.active = true
    ORDER BY o.sort_order ASC, o.id ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
}