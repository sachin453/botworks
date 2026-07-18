"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Bot, MessageSquare, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="size-3.5 text-primary" />
              AI-powered chatbots for modern businesses
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Automate support. Capture leads. Save hours.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              We build custom chatbots and Telegram bots that handle customer support,
              qualify leads, and integrate with your tools — while you focus on growth.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="lg" asChild>
                <Link href="#pricing">
                  See pricing <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#contact">Book a free call</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required. Typical delivery in 5-7 business days.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-md lg:max-w-full"
          >
            <div className="relative rounded-2xl border bg-card p-2 shadow-2xl">
              <div className="rounded-xl bg-muted/50 p-6">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Support Bot</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      U
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-background px-4 py-2.5 text-sm shadow-sm">
                      Do you offer WhatsApp and Telegram bots?
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                      Yes! We build bots for websites, WhatsApp, Telegram, and more.
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground text-xs font-bold">
                      B
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                      Want me to connect you with the team?
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground text-xs font-bold">
                      B
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground">
                  <MessageSquare className="size-4" />
                  Type a message...
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
