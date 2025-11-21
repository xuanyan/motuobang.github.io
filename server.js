import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

let supabaseAdmin;
let supabasePublic;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}
if (supabaseUrl && supabaseAnonKey) {
  supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/config.js", (req, res) => {
  const anonKey = process.env.SUPABASE_ANON_KEY || "";
  res.type("application/javascript").send(
    `window.__CONFIG__ = { SUPABASE_URL: ${JSON.stringify(supabaseUrl)}, SUPABASE_ANON_KEY: ${JSON.stringify(anonKey)} };`
  );
});

async function requireAdmin(req, res, next) {
  if (!supabasePublic) {
    return res.status(503).json({ error: "not_configured" });
  }
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { data, error } = await supabasePublic.auth.getUser(token);
  if (error || !data?.user?.email) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const email = data.user.email;
  req.adminEmail = email;
  next();
}

app.post("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ ok: true, email: req.adminEmail });
});


app.listen(port, () => {});
const __dirname = path.dirname(fileURLToPath(import.meta.url));