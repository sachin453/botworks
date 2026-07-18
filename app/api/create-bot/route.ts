import { NextRequest, NextResponse } from "next/server";

// In-memory storage. Replace with a database in production.
export const BOT_STORAGE = new Map<
  string,
  {
    token: string;
    businessName: string;
    policy: string;
    instructions: string;
    username: string;
    webhookUrl: string;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const businessName = formData.get("businessName") as string;
    const instructions = (formData.get("instructions") as string) || "";
    const policyFile = formData.get("policy") as File | null;

    if (!token || !businessName || !policyFile) {
      return NextResponse.json(
        { error: "Token, business name, and policy file are required." },
        { status: 400 }
      );
    }

    if (policyFile.size > 500 * 1024) {
      return NextResponse.json(
        { error: "Policy file must be smaller than 500 KB." },
        { status: 400 }
      );
    }

    const policy = await policyFile.text();

    // Validate token with Telegram
    const meResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = (await meResponse.json()) as {
      ok: boolean;
      result?: { username: string };
      description?: string;
    };

    if (!meData.ok || !meData.result?.username) {
      return NextResponse.json(
        { error: `Invalid Telegram bot token: ${meData.description || "unknown error"}` },
        { status: 400 }
      );
    }

    const username = meData.result.username;

    // Build public webhook URL from request
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const webhookUrl = `${protocol}://${host}/api/bot-webhook/${username}`;

    // Set webhook on Telegram
    const webhookResponse = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"],
        }),
      }
    );

    const webhookData = (await webhookResponse.json()) as {
      ok: boolean;
      description?: string;
    };

    if (!webhookData.ok) {
      return NextResponse.json(
        { error: `Failed to set webhook: ${webhookData.description || "unknown error"}` },
        { status: 500 }
      );
    }

    // Store bot config in memory (replace with database in production)
    BOT_STORAGE.set(username, {
      token,
      businessName,
      policy,
      instructions,
      username,
      webhookUrl,
    });

    return NextResponse.json({
      success: true,
      botUsername: username,
      webhookUrl,
      instructions: "Your bot is live. Customers can message it on Telegram now.",
    });
  } catch (error) {
    console.error("Create bot error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export function getBotConfig(username: string) {
  return BOT_STORAGE.get(username);
}
