require('dotenv').config();
const app = require('./src/app');
const db = require('./src/database/knex');

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  try {
    console.log('[CampusAUM Database] Testing PostgreSQL connection & running Knex migrations...');
    await db.migrate.latest({
      directory: './src/database/migrations',
    });
    console.log('[CampusAUM Database] PostgreSQL migrations completed successfully.');

    // Check if seeded
    const [{ count }] = await db('organizations').count('id as count');
    if (parseInt(count, 10) === 0) {
      console.log('[CampusAUM Database] Seeding initial institutional multi-tenant data...');
      await db.seed.run({
        directory: './src/database/seeds',
      });
      console.log('[CampusAUM Database] Initial seeding completed.');
    } else {
      console.log('[CampusAUM Database] PostgreSQL seed data already exists.');
    }

    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 CampusAUM SaaS Server running on http://localhost:${PORT}`);
      console.log(`🏛️ Database: PostgreSQL / NeonDB Connection Active`);
      console.log(`🏛️ Architecture: Multi-Tenant Modular Monolith`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('\n⚠️ [CampusAUM Database Notice]:', err.message);
    console.log('ℹ️ Ensure your PostgreSQL or NeonDB DATABASE_URL is updated in server/.env\n');
    
    // Start HTTP app so endpoints respond with clear DB setup status if database URL is pending
    app.listen(PORT, () => {
      console.log(`🚀 CampusAUM Server running on http://localhost:${PORT} (Waiting for valid NeonDB DATABASE_URL in server/.env)`);
    });
  }
}

bootstrap();
