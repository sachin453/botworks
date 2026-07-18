import { NextRequest, NextResponse } from "next/server";
import { getBotByUsername } from "@/lib/db";

interface TelegramMessage {
  message?: {
    chat?: { id: number };
    text?: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const config = await getBotByUsername(username);

  if (!config) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  const update = (await request.json()) as TelegramMessage;
  const chatId = update.message?.chat?.id;
  const text = update.message?.text;

  if (!chatId || !text) {
    return NextResponse.json({ ok: true });
  }

  // Simple command handling
  if (text === "/start") {
    await sendTelegramMessage(
      config.token,
      chatId,
      `Welcome to ${config.businessName}! I can answer questions based on our policies. How can I help you?`
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/human") {
    await sendTelegramMessage(
      config.token,
      chatId,
      "I understand. I'm connecting you with a human from our team. They will reply as soon as possible."
    );
    return NextResponse.json({ ok: true });
  }

  // Generate answer using the LLM
  try {
    const llmApiUrl = process.env.LLM_API_URL || "http://localhost:8080/v1/chat/completions";
    const llmApiKey = process.env.LLM_API_KEY || "";
    const llmModel = process.env.LLM_MODEL || "gemma-4-4b-it";
    const siteUrl = process.env.SITE_URL || "https://botworks.onrender.com";

    const systemPrompt = buildSystemPrompt(config.businessName, config.policy, config.instructions);

    const isOpenRouter = llmApiUrl.includes("openrouter.ai");

    const response = await fetch(llmApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(llmApiKey ? { Authorization: `Bearer ${llmApiKey}` } : {}),
        ...(isOpenRouter
          ? {
              "HTTP-Referer": siteUrl,
              "X-Title": "BotWorks",
            }
          : {}),
      },
      body: JSON.stringify({
        model: llmModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM error:", errorText);
      await sendTelegramMessage(
        config.token,
        chatId,
        "Sorry, I'm having trouble thinking right now. Please try again later."
      );
      return NextResponse.json({ ok: true });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message: string };
    };

    if (data.error) {
      console.error("LLM API error:", data.error.message);
      await sendTelegramMessage(
        config.token,
        chatId,
        "Sorry, I'm having trouble thinking right now. Please try again later."
      );
      return NextResponse.json({ ok: true });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();

    if (answer) {
      await sendTelegramMessage(config.token, chatId, answer);
    } else {
      await sendTelegramMessage(
        config.token,
        chatId,
        "Sorry, I couldn't generate a reply. Please try rephrasing your question."
      );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    await sendTelegramMessage(
      config.token,
      chatId,
      "Sorry, something went wrong. Please try again later."
    );
  }

  return NextResponse.json({ ok: true });
}

function buildSystemPrompt(
  businessName: string,
  policy: string,
  instructions: string
): string {
  return `You are a helpful customer support assistant for ${businessName}.

Answer the user's question based ONLY on the following policy document. If the answer is not in the policy, politely say you don't have that information and offer to connect them with a human.

Keep replies concise, friendly, and professional. Do not make up information that is not in the policy.

${instructions ? `Additional instructions: ${instructions}\n\n` : ""}POLICY DOCUMENT:
${policy}
`;
}

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
}
