import { Router } from "express";
import { getOffers } from "../models/offer.js";

const router = Router();

router.get("/offers", async (req, res) => {
  try {
    const offers = await getOffers();
    res.json(offers);
  } catch (error) {
    console.error("getOffers error:", error.message);
    res.status(500).json({ error: "Failed to load offers" });
  }
});

export default router;