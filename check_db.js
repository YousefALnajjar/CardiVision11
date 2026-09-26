const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'reviews'::regclass AND contype = 'u';").then(res => { console.log("Reviews unique constraints:", res.rows); pool.end(); }).catch(console.error);
