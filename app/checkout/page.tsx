"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: 4900, currency: "INR" }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      if (orderData.mock) {
        // Mock payment: simulate success immediately
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            orderId: orderData.orderId,
            paymentId: `mock_payment_${Date.now()}`,
            amount: orderData.amount,
            currency: orderData.currency,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || "Payment verification failed");
        }

        localStorage.setItem("botworks_paid_email", email);
        router.push("/create-bot");
        return;
      }

      // Real Razorpay flow
      const Razorpay = (window as unknown as { Razorpay: unknown }).Razorpay as
        (new (options: Record<string, unknown>) => { open: () => void }) | undefined;

      if (!Razorpay) {
        throw new Error("Razorpay script not loaded");
      }

      const rzp = new Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BotWorks",
        description: "Customer Support Bot Setup",
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: orderData.amount,
              currency: orderData.currency,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyData.error || "Payment verification failed");
            return;
          }

          localStorage.setItem("botworks_paid_email", email);
          router.push("/create-bot");
        },
        prefill: { email },
        theme: { color: "#0ea5e9" },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create Your Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center">
            One-time setup fee of ₹49 per bot.
          </p>

          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Pay ₹49"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Mock mode active. No real money will be charged.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
