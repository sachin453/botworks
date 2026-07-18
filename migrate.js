require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS bots (
      username TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      business_name TEXT NOT NULL,
      policy TEXT NOT NULL,
      instructions TEXT NOT NULL DEFAULT '',
      webhook_url TEXT NOT NULL,
      owner_email TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'pending',
      provider TEXT NOT NULL DEFAULT 'razorpay',
      provider_order_id TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id SERIAL PRIMARY KEY,
      bot_username TEXT NOT NULL,
      model TEXT,
      provider TEXT,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      cost_usd NUMERIC(12, 6) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      bot_username TEXT NOT NULL,
      chat_id BIGINT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Add owner_email if upgrading from older schema
  await sql`ALTER TABLE bots ADD COLUMN IF NOT EXISTS owner_email TEXT;`;

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
