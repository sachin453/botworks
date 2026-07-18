import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (name.length < 2 || message.length < 10) {
      return NextResponse.json(
        { error: "Message is too short. Please provide more details." },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Email service is not configured yet. Please contact the site owner." },
        { status: 503 }
      );
    }

    const fromEmail = process.env.FROM_EMAIL;
    const toEmail = process.env.TO_EMAIL;

    if (!fromEmail || !toEmail) {
      return NextResponse.json(
        { error: "Email configuration is missing. Please contact the site owner." },
        { status: 500 }
      );
    }

    let emailResult;
    try {
      emailResult = await resend.emails.send({
        from: `BotWorks <${fromEmail}>`,
        to: [toEmail],
        replyTo: email,
        subject: `New contact form message from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
        text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });
    } catch (sendError: any) {
      const message = sendError?.message || String(sendError);
      console.error("Resend send exception:", message, sendError);
      return NextResponse.json(
        { error: `Failed to send email: ${message}` },
        { status: 500 }
      );
    }

    const { data, error } = emailResult;

    if (error) {
      console.error("Resend error:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Failed to send email: ${error.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
