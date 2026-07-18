"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, Bot, Upload } from "lucide-react";

export default function CreateBotPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<{
    botUsername?: string;
    webhookUrl?: string;
    instructions?: string;
  }>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/create-bot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create bot");
      }

      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Create your support bot
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your policy document and connect a Telegram bot. Your customers
            get instant answers based on your own content.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="size-5 text-primary" />
                Bot configuration
              </CardTitle>
              <CardDescription>
                Need a bot token? Message{" "}
                <a
                  href="https://t.me/botfather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  @BotFather
                </a>{" "}
                on Telegram and send /newbot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token">Telegram bot token</Label>
                  <Input
                    id="token"
                    name="token"
                    type="password"
                    placeholder="123456:ABC-DEF..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicUrl">
                    Public webhook URL{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="publicUrl"
                    name="publicUrl"
                    placeholder="https://your-app.ngrok-free.app"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for local testing. Use an HTTPS tunnel like ngrok.
                    In production this is detected automatically.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy">Policy document (.txt)</Label>
                  <div className="rounded-lg border border-dashed border-input p-6">
                    <label
                      htmlFor="policy"
                      className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground"
                    >
                      <Upload className="size-6" />
                      <span className="text-sm">Click to upload a .txt file</span>
                      <span className="text-xs">
                        Max size 500 KB. Plain text only.
                      </span>
                    </label>
                    <Input
                      id="policy"
                      name="policy"
                      type="file"
                      accept=".txt,text/plain"
                      required
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Extra instructions (optional)</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    placeholder="E.g., always ask for an email before escalating to a human."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === "loading" || status === "success"}
                >
                  {status === "loading" && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {status === "success" ? (
                    <>
                      <CheckCircle2 className="mr-2 size-4" /> Bot created
                    </>
                  ) : (
                    "Create bot"
                  )}
                </Button>

                {status === "error" && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </form>

              {status === "success" && result.botUsername && (
                <div className="mt-6 rounded-lg bg-muted p-4 text-sm space-y-2">
                  <p>
                    <strong>Bot:</strong>{" "}
                    <a
                      href={`https://t.me/${result.botUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      @{result.botUsername}
                    </a>
                  </p>
                  <p>
                    <strong>Webhook:</strong>{" "}
                    <span className="text-muted-foreground">
                      {result.webhookUrl}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {result.instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
