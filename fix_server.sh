sed -i -e '/app.post("\/api\/admin\/projects", requireAdmin, async (req: AuthRequest, res) => {/,+35c\
  // Admin Create Project in PostgreSQL\
  app.post(["/api/projects", "/api/projects/"], requireAdmin, async (req: AuthRequest, res) => {\
    try {\
      const p = req.body;\
      const id = "proj_" + crypto.randomBytes(6).toString("hex");\
      await pool.query(\
        `INSERT INTO projects (\
          id, title_ar, title_en, summary_ar, summary_en, description_ar, description_en,\
          category, difficulty_level, price_syp, price_usd, images, video_url,\
          software_used, hardware_components, tags, is_best_seller, is_featured, download_url\
        ) VALUES (\
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19\
        )`,\
        [\
          id,\
          sanitizeInput(p.titleAr),\
          sanitizeInput(p.titleEn),\
          sanitizeInput(p.summaryAr),\
          sanitizeInput(p.summaryEn),\
          sanitizeInput(p.descriptionAr),\
          sanitizeInput(p.descriptionEn),\
          p.category || "biomedical",\
          p.difficultyLevel || "medium",\
          p.priceSyp || 0,\
          p.priceUsd || 0,\
          JSON.stringify(p.images || []),\
          p.videoUrl || "",\
          JSON.stringify(p.softwareUsed || []),\
          JSON.stringify(p.hardwareComponents || []),\
          JSON.stringify(p.tags || []),\
          Boolean(p.isBestSeller),\
          Boolean(p.isFeatured),\
          p.downloadUrl || ""\
        ]\
      );\
      const newProject = { ...p, id };\
      res.status(201).json({ success: true, project: newProject, message: "تم إضافة المشروع بنجاح لقاعدة البيانات", projectId: id });\
    } catch (e: any) {\
      res.status(500).json({ success: false, error: e.message });\
    }\
  });' server.ts
