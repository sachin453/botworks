import Link from "next/link";
import { Bot, Mail, Phone, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <Bot className="size-6 text-primary" />
              <span>BotWorks</span>
            </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Custom AI chatbots and Telegram bots that automate support, capture leads, and grow your business.
          </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Quick links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <span>hello@chatbotagency.example</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <span>+1 (555) 000-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4 text-primary" />
                <span>WhatsApp available</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} BotWorks. All rights reserved.</p>
          <p>Placeholder branding — replace when ready.</p>
        </div>
      </div>
    </footer>
  );
}
