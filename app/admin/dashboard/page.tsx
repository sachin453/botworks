"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Bot {
  username: string;
  businessName: string;
  ownerEmail: string | null;
  createdAt: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUsd: number;
  };
}

interface Payment {
  id: number;
  email: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalBots: number;
    totalUsageCost: number;
  } | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [chatId, setChatId] = useState("");
  const [conversation, setConversation] = useState<
    Array<{ role: string; content: string; createdAt: string }>
  >([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setStats(data.stats);
          setBots(data.bots);
          setPayments(data.payments);
        }
        setLoading(false);
      });
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function viewConversation(botUsername: string, chatIdValue: string) {
    if (!chatIdValue.trim()) return;

    const res = await fetch(
      `/api/admin/stats?botUsername=${botUsername}&chatId=${chatIdValue}`
    );
    if (res.ok) {
      const data = await res.json();
      setSelectedBot(botUsername);
      setChatId(chatIdValue);
      setConversation(data.conversation ?? []);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-background">
        <p className="text-center text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-10 bg-background">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₹{((stats?.totalRevenue ?? 0) / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalBots ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Est. LLM Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${(stats?.totalUsageCost ?? 0).toFixed(4)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bots.length === 0 && (
              <p className="text-muted-foreground">No bots yet.</p>
            )}
            {bots.map((bot) => (
              <div key={bot.username} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">@{bot.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {bot.businessName} · {bot.ownerEmail ?? "no email"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Tokens: {bot.usage.totalTokens.toLocaleString()}</p>
                    <p>Cost: ${bot.usage.costUsd.toFixed(4)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Chat ID"
                    className="w-32 rounded border bg-background px-2 py-1 text-sm"
                    onChange={(e) => setChatId(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => viewConversation(bot.username, chatId)}
                  >
                    View Chat
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedBot && (conversation?.length ?? 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Conversation: @{selectedBot} · Chat {chatId}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 text-sm ${
                    msg.role === "user"
                      ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                      : "max-w-[80%] bg-muted"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase opacity-70">
                    {msg.role}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.length === 0 && (
              <p className="text-muted-foreground">No payments yet.</p>
            )}
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{payment.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₹{(payment.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
