import { NextRequest, NextResponse } from "next/server";
import {
  getBotByUsername,
  getConversationHistory,
  saveConversationMessage,
  logUsage,
} from "@/lib/db";

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

  await saveConversationMessage({
    botUsername: username,
    chatId,
    role: "user",
    content: text,
  });

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
    const history = await getConversationHistory(username, chatId, 10);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user", content: text },
    ];

    const isOpenRouter = llmApiUrl.includes("openrouter.ai");
    const provider = isOpenRouter ? "openrouter" : llmApiUrl.includes("openai.com") ? "openai" : "llama.cpp";

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
        messages,
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
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
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
      await saveConversationMessage({
        botUsername: username,
        chatId,
        role: "assistant",
        content: answer,
      });

      const usage = data.usage;
      const inputTokens = usage?.prompt_tokens ?? 0;
      const outputTokens = usage?.completion_tokens ?? 0;
      const totalTokens = usage?.total_tokens ?? inputTokens + outputTokens;

      await logUsage({
        botUsername: username,
        model: llmModel,
        provider,
        inputTokens,
        outputTokens,
        totalTokens,
        costUsd: estimateCost(llmModel, inputTokens, outputTokens),
      });
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

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Very rough cost estimates in USD per 1M tokens
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-4o": { input: 5, output: 15 },
  };

  let matched = pricing[model];
  if (!matched && model.includes("gemma")) matched = { input: 0.1, output: 0.2 };
  if (!matched && model.includes("llama")) matched = { input: 0.2, output: 0.4 };
  if (!matched && model.includes("deepseek")) matched = { input: 0.14, output: 0.28 };
  if (!matched) matched = { input: 0.5, output: 1.5 };

  return (inputTokens * matched.input + outputTokens * matched.output) / 1_000_000;
}
