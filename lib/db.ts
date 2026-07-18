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
  ownerEmail?: string;
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
  })();

  return setupPromise;
}

export async function createBot(config: BotConfig): Promise<void> {
  await setupDatabase();
  const sql = getSql();
  await sql`
    INSERT INTO bots (username, token, business_name, policy, instructions, webhook_url, owner_email)
    VALUES (
      ${config.username},
      ${config.token},
      ${config.businessName},
      ${config.policy},
      ${config.instructions},
      ${config.webhookUrl},
      ${config.ownerEmail ?? null}
    )
    ON CONFLICT (username)
    DO UPDATE SET
      token = EXCLUDED.token,
      business_name = EXCLUDED.business_name,
      policy = EXCLUDED.policy,
      instructions = EXCLUDED.instructions,
      webhook_url = EXCLUDED.webhook_url,
      owner_email = EXCLUDED.owner_email;
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
      webhook_url AS "webhookUrl",
      owner_email AS "ownerEmail"
    FROM bots
    WHERE username = ${username}
    LIMIT 1;
  `;

  if (rows.length === 0) return null;

  return rows[0] as BotConfig;
}

export async function createPayment(params: {
  email: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerOrderId?: string;
}): Promise<void> {
  await setupDatabase();
  const sql = getSql();
  await sql`
    INSERT INTO payments (email, amount, currency, status, provider, provider_order_id)
    VALUES (
      ${params.email},
      ${params.amount},
      ${params.currency},
      ${params.status},
      ${params.provider},
      ${params.providerOrderId ?? null}
    );
  `;
}

export async function hasSuccessfulPayment(email: string): Promise<boolean> {
  await setupDatabase();
  const sql = getSql();
  const rows = await sql`
    SELECT 1 FROM payments
    WHERE email = ${email} AND status = 'captured'
    LIMIT 1;
  `;
  return rows.length > 0;
}

export async function logUsage(params: {
  botUsername: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}): Promise<void> {
  await setupDatabase();
  const sql = getSql();
  await sql`
    INSERT INTO usage_logs (
      bot_username, model, provider, input_tokens, output_tokens, total_tokens, cost_usd
    )
    VALUES (
      ${params.botUsername},
      ${params.model},
      ${params.provider},
      ${params.inputTokens},
      ${params.outputTokens},
      ${params.totalTokens},
      ${params.costUsd}
    );
  `;
}

export async function saveConversationMessage(params: {
  botUsername: string;
  chatId: number;
  role: string;
  content: string;
}): Promise<void> {
  await setupDatabase();
  const sql = getSql();
  await sql`
    INSERT INTO conversations (bot_username, chat_id, role, content)
    VALUES (
      ${params.botUsername},
      ${params.chatId},
      ${params.role},
      ${params.content}
    );
  `;
}

export async function getConversationHistory(
  botUsername: string,
  chatId: number,
  limit = 10
): Promise<Array<{ role: string; content: string }>> {
  await setupDatabase();
  const sql = getSql();
  const rows = await sql`
    SELECT role, content
    FROM conversations
    WHERE bot_username = ${botUsername} AND chat_id = ${chatId}
    ORDER BY created_at ASC
    LIMIT ${limit};
  `;
  return rows as Array<{ role: string; content: string }>;
}

export async function getAdminStats(): Promise<{
  totalRevenue: number;
  totalBots: number;
  totalUsageCost: number;
  totalBotsValue: number;
}> {
  await setupDatabase();
  const sql = getSql();

  const revenueRows = await sql`
    SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'captured';
  `;
  const botRows = await sql`SELECT COUNT(*) AS total FROM bots;`;
  const usageRows = await sql`
    SELECT COALESCE(SUM(cost_usd), 0) AS total FROM usage_logs;
  `;

  return {
    totalRevenue: Number(revenueRows[0]?.total ?? 0),
    totalBots: Number(botRows[0]?.total ?? 0),
    totalUsageCost: Number(usageRows[0]?.total ?? 0),
    totalBotsValue: Number(revenueRows[0]?.total ?? 0),
  };
}

export async function getAllBots(): Promise<
  Array<{
    username: string;
    businessName: string;
    ownerEmail: string | null;
    createdAt: string;
  }>
> {
  await setupDatabase();
  const sql = getSql();
  const rows = await sql`
    SELECT
      username,
      business_name AS "businessName",
      owner_email AS "ownerEmail",
      created_at AS "createdAt"
    FROM bots
    ORDER BY created_at DESC;
  `;
  return rows as Array<{
    username: string;
    businessName: string;
    ownerEmail: string | null;
    createdAt: string;
  }>;
}

export async function getBotUsage(botUsername: string): Promise<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}> {
  await setupDatabase();
  const sql = getSql();
  const rows = await sql`
    SELECT
      COALESCE(SUM(input_tokens), 0) AS "inputTokens",
      COALESCE(SUM(output_tokens), 0) AS "outputTokens",
      COALESCE(SUM(total_tokens), 0) AS "totalTokens",
      COALESCE(SUM(cost_usd), 0) AS "costUsd"
    FROM usage_logs
    WHERE bot_username = ${botUsername};
  `;
  return rows[0] as {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

export async function getRecentPayments(limit = 20): Promise<
  Array<{
    id: number;
    email: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>
> {
  await setupDatabase();
  const sql = getSql();
  const rows = await sql`
    SELECT
      id,
      email,
      amount,
      currency,
      status,
      created_at AS "createdAt"
    FROM payments
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
  return rows as Array<{
    id: number;
    email: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
}

export async function getBotConversation(
  botUsername: string,
  chatId: number,
  limit = 50
): Promise<Array<{ role: string; content: string; createdAt: string }>> {
  await setupDatabase();
  const sql = getSql();
  const rows = await sql`
    SELECT role, content, created_at AS "createdAt"
    FROM conversations
    WHERE bot_username = ${botUsername} AND chat_id = ${chatId}
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
  return rows as Array<{ role: string; content: string; createdAt: string }>;
}
