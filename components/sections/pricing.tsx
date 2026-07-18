"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small businesses testing chatbot automation.",
    price: "$499",
    period: "one-time",
    features: [
      "1 custom chatbot or Telegram bot",
      "Up to 3 conversation flows",
      "Basic FAQ & lead capture",
      "1 integration (e.g. email, CRM)",
      "7-day delivery",
      "30 days support",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Business",
    description: "For teams that need advanced automation and integrations.",
    price: "$1,299",
    period: "one-time",
    features: [
      "Up to 3 bots (website, Telegram, WhatsApp)",
      "Unlimited conversation flows",
      "AI-powered responses",
      "Up to 5 integrations",
      "User authentication & handoff",
      "5-7 day delivery",
      "90 days support",
    ],
    cta: "Most popular",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions with dedicated support and maintenance.",
    price: "Custom",
    period: "",
    features: [
      "Unlimited bots & channels",
      "Custom AI model training",
      "Advanced analytics dashboard",
      "SLA & priority support",
      "Ongoing maintenance plan",
      "Dedicated account manager",
    ],
    cta: "Contact us",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One-time builds with optional maintenance. No hidden fees.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`h-full flex flex-col ${
                  plan.popular
                    ? "border-primary ring-1 ring-primary shadow-lg"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-2">
                        / {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="#contact">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
