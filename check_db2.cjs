const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'favorites';").then(res => { console.log("Favorites indexes:", res.rows); pool.end(); }).catch(e => { console.error(e); pool.end(); });
