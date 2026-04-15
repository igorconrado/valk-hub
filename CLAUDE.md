@AGENTS.md

# VALK Hub — Internal Management System

## Project
Internal management app for VALK, a venture builder that creates SaaS products. Used by 4 partners + future team members.

## Stack
- Next.js 14+ (App Router) with TypeScript
- Tailwind CSS + shadcn/ui (dark theme)
- Supabase (Postgres, Auth with magic link, RLS)
- Framer Motion for animations
- Vercel for deployment

## Design Direction
Premium craft inspired by Linear, Vercel, and Raycast. Dark mode only. No generic AI aesthetics.

### Color Palette (CSS Variables)
- Background: #0A0A0A | Foreground: #F7F6F3
- Primary (red): #E24B4A | Primary hover: #C73E3D
- Card: #111111 | Muted: #1A1A1A
- Border: #1F1F1F | Border hover: #2A2A2A
- Muted foreground: #888888

### Typography (CDN-loaded, no next/font)
- Display: Clash Display (font-display) — headings, titles, logos, project names, page titles, greeting
- Sans: General Sans (font-sans, default body font) — navigation, body text, labels, descriptions, badges, buttons, form fields, metadata
- Mono: Geist Mono (font-mono) — version numbers, metric values, numeric data, code
- Labels: text-xs, font-weight 500/600, uppercase, tracking-wider, color #888

### UI Patterns
- Cards: bg #111, border #1F1F1F, rounded-xl, hover border #2A2A2A + translateY -1px
- Buttons primary: bg #E24B4A, hover #C73E3D, rounded-lg
- Buttons ghost: transparent, border #2A2A2A, hover bg #1A1A1A
- Inputs: bg #0A0A0A, border #1F1F1F, focus border #E24B4A
- Transitions: 150-200ms ease
- Animations: framer-motion fade-in + translateY, staggered delays

## Auth & Roles
3 roles: admin, operator, stakeholder
- Admin (Igor): full access
- Operator (Felipe + future devs): operational access, no user management
- Stakeholder (Marquinhos, Waltinho): read-only dashboards and reports

## File Structure
src/
├── app/
│   ├── login/page.tsx
│   ├── auth/callback/route.ts
│   └── (dashboard)/
│       ├── layout.tsx (sidebar + topbar)
│       ├── page.tsx (dashboard home)
│       └── projects/
│           ├── page.tsx (listing)
│           └── [id]/page.tsx (detail)
├── components/
│   ├── role-gate.tsx
│   └── page-header.tsx
└── lib/
    ├── supabase/ (client.ts, server.ts, middleware.ts)
    └── hooks/ (use-user.ts, use-role.ts)

## Conventions
- Server components by default, client components only when needed (interactivity, hooks)
- Server Actions for mutations
- All UI text in Portuguese (pt-BR)
- Date formatting with date-fns pt-BR locale
- Supabase RLS enforced — never bypass with service role key in frontend
