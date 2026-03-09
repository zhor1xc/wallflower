import { Router } from "express";
import { createLead } from "../models/lead.js";

const router = Router();

function validateLead(body) {
  const name    = String(body?.name    || "").trim();
  const phone   = String(body?.phone   || "").trim();
  const email   = String(body?.email   || "").trim();
  const comment = String(body?.comment || "").trim();
  const type    = String(body?.type    || "").trim();

  if (!name || !phone || !type || !email) {
    return { ok: false, error: "name, phone, type are required" };
  }

  return { ok: true, value: { name, phone, email, comment, type } };
}

router.post("/leads", async (req, res) => {
  const validated = validateLead(req.body);
  if (!validated.ok) {
    return res.status(400).json({ error: validated.error });
  }

  try {
    const lead = await createLead(validated.value);
    return res.status(201).json({ ok: true, lead });
  } catch (error) {
    console.error("createLead error:", error.message);
    return res.status(500).json({ error: "Failed to save lead" });
  }
});

export default router;