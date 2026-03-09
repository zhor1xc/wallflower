import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { testDbConnection } from "./db.js";
import offerRoutes from "../routes/offer.routes.js";
import formRoutes from "../routes/form.routes.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

app.use(express.json());
app.use("/api", offerRoutes);
app.use("/api", formRoutes);

app.use("/images", express.static(path.join(ROOT_DIR, "images")));
app.use(express.static(path.join(ROOT_DIR, "app")));

app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "app", "index.html"));
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await testDbConnection();
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});