"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "The chatbot handles 70% of our support questions instantly. Our team finally has time for complex issues.",
    author: "Priya Sharma",
    role: "Head of Support, ShopEase",
  },
  {
    quote:
      "We got a Telegram bot that qualifies leads and books demos automatically. Best ROI we've seen this year.",
    author: "Daniel Okonjo",
    role: "Founder, GrowthLoop",
  },
  {
    quote:
      "Professional, fast, and easy to work with. The bot was live within a week and our customers love it.",
    author: "Sarah Chen",
    role: "CEO, Finpath",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by growing teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our clients say about working with us.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <Quote className="size-8 text-primary/40" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-base text-muted-foreground">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <CardTitle className="text-sm">{testimonial.author}</CardTitle>
                    <CardDescription>{testimonial.role}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
