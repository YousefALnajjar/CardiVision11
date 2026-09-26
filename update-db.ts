import { getPool } from "./src/db/index.js";
async function run() {
  const pool = getPool();
  try {
    await pool.query(`
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS details_ar TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS details_en TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS features_ar JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS features_en JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS components_ar JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS components_en JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS software_ar JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS software_en JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration_ar TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration_en TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS university_ar TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS university_en TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_file_url TEXT;
    `);
    console.log("Success");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
