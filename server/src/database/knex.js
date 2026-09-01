require('dotenv').config();
const knex = require('knex');
const { URL } = require('url');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[CampusAUM Fatal Database Error]: DATABASE_URL is missing in server/.env file.');
  process.exit(1);
}

console.log('[CampusAUM Database] Connecting to PostgreSQL / NeonDB instance...');

const parsed = new URL(connectionString);
const hostname = parsed.hostname;
const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
const user = decodeURIComponent(parsed.username || '');
const password = decodeURIComponent(parsed.password || '');
const database = parsed.pathname ? parsed.pathname.replace('/', '') : 'neondb';

const db = knex({
  client: 'pg',
  connection: {
    connectionString,
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    min: 1,
    max: 15,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
});

module.exports = db;
