import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => cb(null, ["image/jpeg","image/png"].includes(file.mimetype))
});

app.use(express.static(path.join(__dirname, "public")));
app.get("/api/health", (_req,res) => res.json({ok:true, service:"HerbaScan API", taxonomySources:["GBIF","iNaturalist"], identificationConfigured:Boolean(process.env.PLANTNET_API_KEY)}));

// Open taxonomy lookup: GBIF provides scientific-name matching; iNaturalist provides taxon suggestions.
// These services enrich/verify names; they do NOT identify an uploaded photo by themselves.
app.get("/api/taxa/search", async (req,res) => {
  const q = String(req.query.q || "").trim().slice(0,120);
  if (q.length < 2) return res.status(400).json({error:"Nhập ít nhất 2 ký tự để tra cứu."});
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const enc = encodeURIComponent(q);
    const [gbifResp, inatResp] = await Promise.allSettled([
      fetch(`https://api.gbif.org/v1/species/match?name=${enc}&verbose=true`, {signal:controller.signal, headers:{accept:"application/json"}}),
      fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${enc}&per_page=8`, {signal:controller.signal, headers:{accept:"application/json"}})
    ]);
    let gbif = null, inat = [];
    if (gbifResp.status === "fulfilled" && gbifResp.value.ok) {
      const d = await gbifResp.value.json();
      if (d.scientificName || d.canonicalName) gbif = {scientificName:d.scientificName || d.canonicalName, rank:d.rank || null, family:d.family || null, genus:d.genus || null, confidence:d.confidence ?? null, status:d.status || null, source:"GBIF"};
    }
    if (inatResp.status === "fulfilled" && inatResp.value.ok) {
      const d = await inatResp.value.json();
      inat = (d.results || []).slice(0,8).map(t => ({id:t.id, name:t.name, preferredCommonName:t.preferred_common_name || null, rank:t.rank || null, iconicTaxonName:t.iconic_taxon_name || null, observationsCount:t.observations_count ?? null, source:"iNaturalist"}));
    }
    res.set("Cache-Control","public, max-age=300").json({query:q, sources:{gbif:gbifResp.status === "fulfilled" ? "queried" : "unavailable", iNaturalist:inatResp.status === "fulfilled" ? "queried" : "unavailable"}, gbif, iNaturalist:inat, note:"Dữ liệu phân loại để đối chiếu tên; không phải kết quả xác nhận loài hoặc xác nhận an toàn thực phẩm."});
  } catch (e) {
    res.status(502).json({error:"Không truy cập được nguồn dữ liệu phân loại lúc này. Vui lòng thử lại.", detail:e.name === "AbortError" ? "timeout" : undefined});
  } finally { clearTimeout(timer); }
});

app.post("/api/identify", upload.array("images",5), async (req,res) => {
  try {
    const key = process.env.PLANTNET_API_KEY;
    if (!key) return res.status(503).json({error:"Máy chủ chưa cấu hình PLANTNET_API_KEY. Tạo API key Pl@ntNet rồi thêm vào file .env."});
    if (!req.files?.length) return res.status(400).json({error:"Vui lòng tải lên ít nhất một ảnh JPG hoặc PNG."});
    const form = new FormData();
    for (const f of req.files) {
      const blob = new Blob([f.buffer], {type:f.mimetype});
      form.append("images", blob, f.originalname || "plant.jpg");
      form.append("organs", "auto");
    }
    const url = new URL("https://my-api.plantnet.org/v2/identify/all");
    url.searchParams.set("api-key",key);
    url.searchParams.set("lang","vi");
    url.searchParams.set("nb-results","5");
    url.searchParams.set("include-related-images","false");
    const upstream = await fetch(url,{method:"POST",body:form});
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({error:data?.message || data?.error || `Pl@ntNet trả về lỗi HTTP ${upstream.status}`, detail:data});
    res.json(data);
  } catch (e) {
    res.status(500).json({error:"Lỗi xử lý nhận diện: "+e.message});
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`HerbaScan running on port ${port}`));
