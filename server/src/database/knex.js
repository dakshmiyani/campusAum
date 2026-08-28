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
  connection: async () => {
    let resolvedHost = hostname;
    try {
      // Resolve IPv4 address using public DNS resolvers if local DNS lookup is restricted
      const resolver = new (require('dns').Resolver)();
      resolver.setServers(['8.8.8.8', '1.1.1.1']);
      const addresses = await new Promise((resolve, reject) => {
        resolver.resolve4(hostname, (err, addrs) => (err ? reject(err) : resolve(addrs)));
      });
      if (addresses && addresses.length > 0) {
        resolvedHost = addresses[0];
      }
    } catch (err) {
      console.warn('[CampusAUM DNS Notice]: Connecting via hostname', hostname);
    }

    return {
      host: resolvedHost,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false, servername: hostname },
    };
  },
  pool: { min: 1, max: 10 },
});

module.exports = db;
