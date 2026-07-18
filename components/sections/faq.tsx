"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What types of chatbots do you build?",
    answer:
      "We build custom chatbots for websites, Telegram, and WhatsApp. They can handle customer support, lead capture, FAQs, booking, and integrations with your existing tools.",
  },
  {
    question: "How long does it take to build a chatbot?",
    answer:
      "Most projects are delivered within 5-7 business days. More complex enterprise solutions with custom integrations may take 2-3 weeks.",
  },
  {
    question: "Do I need technical knowledge to use the chatbot?",
    answer:
      "Not at all. We handle the setup, deployment, and training. You get a simple dashboard or documentation to manage responses and view leads.",
  },
  {
    question: "Can the chatbot integrate with my CRM or helpdesk?",
    answer:
      "Yes. We can integrate with popular tools like HubSpot, Salesforce, Zendesk, Freshdesk, Slack, Google Sheets, email services, and more.",
  },
  {
    question: "Is there ongoing support after launch?",
    answer:
      "Yes. Starter plans include 30 days of support, Business plans include 90 days, and Enterprise plans include ongoing maintenance options.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Pricing is a one-time project fee based on the plan you choose. Enterprise pricing is custom depending on your requirements.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
