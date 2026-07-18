import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

const isMockMode = !keyId || !keySecret || keyId.startsWith("rzp_test_placeholder");

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; amount?: number; currency?: string };
    const email = body.email?.trim();
    const amount = body.amount ?? 4900; // ₹49 in paise
    const currency = body.currency?.toUpperCase() ?? "INR";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (isMockMode) {
      return NextResponse.json({
        orderId: `mock_order_${Date.now()}`,
        amount,
        currency,
        keyId: "mock_key",
        mock: true,
      });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { email },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      mock: false,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
