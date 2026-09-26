const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'reviews';").then(res => { console.log("Reviews indexes:", res.rows); pool.end(); }).catch(e => { console.error(e); pool.end(); });
