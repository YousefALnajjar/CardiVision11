import fs from 'fs';
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

const replacement = `
  detailsAr: text("details_ar"),
  detailsEn: text("details_en"),
  durationAr: text("duration_ar"),
  durationEn: text("duration_en"),
  universityAr: text("university_ar"),
  universityEn: text("university_en"),
  imageUrl: text("image_url"),
  projectFileUrl: text("project_file_url"),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  featuresEn: jsonb("features_en").$type<string[]>().default([]),
  componentsAr: jsonb("components_ar").$type<string[]>().default([]),
  componentsEn: jsonb("components_en").$type<string[]>().default([]),
  softwareAr: jsonb("software_ar").$type<string[]>().default([]),
  softwareEn: jsonb("software_en").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
`;

code = code.replace(/createdAt: timestamp\("created_at"\).defaultNow\(\).notNull\(\),/g, replacement);
fs.writeFileSync('src/db/schema.ts', code);
console.log("Schema updated.");
