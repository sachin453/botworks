import { neon } from "@neondatabase/serverless";

function getSql() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return neon(DATABASE_URL);
}

export interface BotConfig {
  username: string;
  token: string;
  businessName: string;
  policy: string;
  instructions: string;
  webhookUrl: string;
}

let setupPromise: Promise<void> | null = null;

export async function setupDatabase(): Promise<void> {
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS bots (
        username TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        business_name TEXT NOT NULL,
        policy TEXT NOT NULL,
        instructions TEXT NOT NULL DEFAULT '',
        webhook_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
  })();

  return setupPromise;
}

export async function createBot(config: BotConfig): Promise<void> {
  await setupDatabase();
  const sql = getSql();
  await sql`
    INSERT INTO bots (username, token, business_name, policy, instructions, webhook_url)
    VALUES (
      ${config.username},
      ${config.token},
      ${config.businessName},
      ${config.policy},
      ${config.instructions},
      ${config.webhookUrl}
    )
    ON CONFLICT (username)
    DO UPDATE SET
      token = EXCLUDED.token,
      business_name = EXCLUDED.business_name,
      policy = EXCLUDED.policy,
      instructions = EXCLUDED.instructions,
      webhook_url = EXCLUDED.webhook_url;
  `;
}

export async function getBotByUsername(
  username: string
): Promise<BotConfig | null> {
  await setupDatabase();

  const sql = getSql();
  const rows = await sql`
    SELECT
      username,
      token,
      business_name AS "businessName",
      policy,
      instructions,
      webhook_url AS "webhookUrl"
    FROM bots
    WHERE username = ${username}
    LIMIT 1;
  `;

  if (rows.length === 0) return null;

  return rows[0] as BotConfig;
}
