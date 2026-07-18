import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createPayment } from "@/lib/db";

const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
const isMockMode = !keySecret || keySecret === "placeholder_secret";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      orderId?: string;
      paymentId?: string;
      signature?: string;
      amount?: number;
      currency?: string;
    };

    const email = body.email?.trim();
    const orderId = body.orderId;
    const paymentId = body.paymentId;
    const signature = body.signature;
    const amount = body.amount ?? 4900;
    const currency = body.currency?.toUpperCase() ?? "INR";

    if (!email || !orderId || !paymentId) {
      return NextResponse.json(
        { error: "Email, orderId, and paymentId are required" },
        { status: 400 }
      );
    }

    if (!isMockMode && signature) {
      const expected = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (expected !== signature) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    await createPayment({
      email,
      amount,
      currency,
      status: "captured",
      provider: isMockMode ? "mock" : "razorpay",
      providerOrderId: orderId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
