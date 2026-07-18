"use client";

import { motion } from "framer-motion";
import {
  Bot,
  MessageCircle,
  Headphones,
  Workflow,
  Zap,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    icon: Bot,
    title: "Custom Website Chatbots",
    description:
      "AI assistants embedded on your site that answer questions, collect leads, and guide visitors 24/7.",
  },
  {
    icon: MessageCircle,
    title: "Telegram Bots",
    description:
      "Smart Telegram bots for communities, customer support, notifications, and automated workflows.",
  },
  {
    icon: Headphones,
    title: "Customer Support Automation",
    description:
      "Deflect repetitive tickets, provide instant answers, and hand off to humans when it matters.",
  },
  {
    icon: Workflow,
    title: "Integrations",
    description:
      "Connect your bot to CRMs, helpdesks, email tools, payment systems, and databases.",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description:
      "Most bots are designed, built, tested, and deployed within 5-7 business days.",
  },
  {
    icon: Shield,
    title: "Reliable & Secure",
    description:
      "Production-ready code, clear data handling, and ongoing maintenance options.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to automate conversations
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From custom website chatbots to Telegram integrations, we build bots that actually work for your business.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div key={service.title} variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <service.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
