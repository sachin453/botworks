# ChatBot Agency Website

A modern marketing website for a custom chatbot and Telegram bot agency.

## Tech stack

- **Framework:** Next.js 16 + App Router + TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui with Base UI (Nova preset)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Email:** Resend

## Getting started

```bash
cd /home/sachin/my_website/chatbot-agency
npm install
```

Create a `.env.local` file:

```env
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=your-verified@domain.com
TO_EMAIL=your-inbox@domain.com
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building for production

```bash
npm run build
npm start
```

## Contact form setup

The contact form uses [Resend](https://resend.com). To make it work:

1. Sign up at Resend and create an API key.
2. Add the API key to `.env.local` as `RESEND_API_KEY`.
3. Verify a domain or use `onboarding@resend.dev` as `FROM_EMAIL` for testing.
4. Set `TO_EMAIL` to the address where you want to receive messages.

> Note: When testing with `onboarding@resend.dev`, you can only send emails to your own verified email address.

## Customization

- Replace placeholder branding ("ChatBot Agency") in `components/navbar.tsx`, `components/footer.tsx`, and page sections.
- Update pricing, services, testimonials, and contact details to match your business.
- Swap colors in `app/globals.css` by editing the CSS variables.

## Project structure

```
app/
  api/contact/route.ts   # Contact form email API
  globals.css            # Global styles and theme
  layout.tsx             # Root layout with navbar/footer
  page.tsx               # Homepage with all sections
components/
  navbar.tsx             # Sticky navigation + mobile menu
  footer.tsx             # Site footer
  sections/              # Page sections
    hero.tsx
    services.tsx
    pricing.tsx
    testimonials.tsx
    faq.tsx
    cta.tsx
    contact.tsx
  ui/                    # shadcn/ui components
```
