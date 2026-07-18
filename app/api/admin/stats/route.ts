import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAdminStats,
  getAllBots,
  getBotUsage,
  getRecentPayments,
  getBotConversation,
} from "@/lib/db";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("admin_session")?.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const botUsername = searchParams.get("botUsername");
    const chatId = searchParams.get("chatId");

    if (botUsername && chatId) {
      const conversation = await getBotConversation(
        botUsername,
        Number(chatId)
      );
      return NextResponse.json({ conversation });
    }

    const stats = await getAdminStats();
    const bots = await getAllBots();
    const payments = await getRecentPayments();

    const botsWithUsage = await Promise.all(
      bots.map(async (bot) => {
        const usage = await getBotUsage(bot.username);
        return {
          ...bot,
          usage: {
            inputTokens: Number(usage.inputTokens ?? 0),
            outputTokens: Number(usage.outputTokens ?? 0),
            totalTokens: Number(usage.totalTokens ?? 0),
            costUsd: Number(usage.costUsd ?? 0),
          },
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalRevenue: Number(stats.totalRevenue ?? 0),
        totalBots: Number(stats.totalBots ?? 0),
        totalUsageCost: Number(stats.totalUsageCost ?? 0),
        totalBotsValue: Number(stats.totalBotsValue ?? 0),
      },
      bots: botsWithUsage,
      payments: payments.map((p) => ({
        ...p,
        amount: Number(p.amount ?? 0),
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
