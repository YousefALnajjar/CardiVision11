import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const mapFields = `
        id: row.id,
        titleAr: row.title_ar,
        titleEn: row.title_en,
        summaryAr: row.summary_ar,
        summaryEn: row.summary_en,
        descriptionAr: row.description_ar,
        descriptionEn: row.description_en,
        detailsAr: row.details_ar,
        detailsEn: row.details_en,
        category: row.category,
        projectTypeAr: row.project_type_ar,
        projectTypeEn: row.project_type_en,
        difficultyLevel: row.difficulty_level,
        priceSyp: row.price_syp,
        priceUsd: row.price_usd,
        price: row.price_syp, // Fallback for frontend
        durationAr: row.duration_ar,
        durationEn: row.duration_en,
        universityAr: row.university_ar,
        universityEn: row.university_en,
        featuresAr: Array.isArray(row.features_ar) ? row.features_ar : (typeof row.features_ar === 'string' ? JSON.parse(row.features_ar) : []),
        featuresEn: Array.isArray(row.features_en) ? row.features_en : (typeof row.features_en === 'string' ? JSON.parse(row.features_en) : []),
        componentsAr: Array.isArray(row.components_ar) ? row.components_ar : (typeof row.components_ar === 'string' ? JSON.parse(row.components_ar) : []),
        componentsEn: Array.isArray(row.components_en) ? row.components_en : (typeof row.components_en === 'string' ? JSON.parse(row.components_en) : []),
        softwareAr: Array.isArray(row.software_ar) ? row.software_ar : (typeof row.software_ar === 'string' ? JSON.parse(row.software_ar) : []),
        softwareEn: Array.isArray(row.software_en) ? row.software_en : (typeof row.software_en === 'string' ? JSON.parse(row.software_en) : []),
        imageUrl: row.image_url || (Array.isArray(row.images) ? row.images[0] : (typeof row.images === 'string' ? JSON.parse(row.images)[0] : '')),
        projectFileUrl: row.project_file_url,
`;

code = code.replace(/id: row\.id,[\s\S]*?videoUrl: row\.video_url,/g, (match) => {
  return mapFields + `        images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
        videoUrl: row.video_url,`;
});

const putQueryRegex = /app\.put\("\/api\/projects\/:id",[\s\S]*?WHERE id = \$19`,[\s\S]*?id\n\s*\]\n\s*\);/;

const newPutQuery = `app.put("/api/projects/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const p = req.body;
      
      const check = await pool.query("SELECT id FROM projects WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ success: false, error: "المشروع غير موجود" });
      }

      await pool.query(
        \`UPDATE projects SET 
          title_ar = $1, title_en = $2, summary_ar = $3, summary_en = $4, 
          description_ar = $5, description_en = $6, category = $7, difficulty_level = $8, 
          price_syp = $9, price_usd = $10, images = $11, video_url = $12, 
          software_used = $13, hardware_components = $14, tags = $15, 
          is_best_seller = $16, is_featured = $17, download_url = $18,
          details_ar = $20, details_en = $21, duration_ar = $22, duration_en = $23,
          university_ar = $24, university_en = $25, project_type_ar = $26, project_type_en = $27,
          features_ar = $28, features_en = $29, components_ar = $30, components_en = $31,
          software_ar = $32, software_en = $33, image_url = $34, project_file_url = $35
        WHERE id = $19\`,
        [
          sanitizeInput(p.titleAr),
          sanitizeInput(p.titleEn),
          sanitizeInput(p.summaryAr || p.detailsAr),
          sanitizeInput(p.summaryEn || p.detailsEn),
          sanitizeInput(p.descriptionAr),
          sanitizeInput(p.descriptionEn),
          p.category || "biomedical",
          p.difficultyLevel || "medium",
          p.priceSyp || p.price || 0,
          p.priceUsd || 0,
          JSON.stringify(p.images || []),
          p.videoUrl || "",
          JSON.stringify(p.softwareUsed || []),
          JSON.stringify(p.hardwareComponents || []),
          JSON.stringify(p.tags || []),
          Boolean(p.isBestSeller),
          Boolean(p.isFeatured),
          p.downloadUrl || p.projectFileUrl || "",
          id,
          sanitizeInput(p.detailsAr),
          sanitizeInput(p.detailsEn),
          sanitizeInput(p.durationAr),
          sanitizeInput(p.durationEn),
          sanitizeInput(p.universityAr),
          sanitizeInput(p.universityEn),
          sanitizeInput(p.projectTypeAr),
          sanitizeInput(p.projectTypeEn),
          JSON.stringify(p.featuresAr || []),
          JSON.stringify(p.featuresEn || []),
          JSON.stringify(p.componentsAr || []),
          JSON.stringify(p.componentsEn || []),
          JSON.stringify(p.softwareAr || []),
          JSON.stringify(p.softwareEn || []),
          p.imageUrl || "",
          p.projectFileUrl || ""
        ]
      );`;

code = code.replace(putQueryRegex, newPutQuery);

fs.writeFileSync('server.ts', code);
console.log("Replaced successfully.");
