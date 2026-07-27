# Architecture

Phase 1 is a single Next.js App Router application. Demo catalog data lives in typed fixtures and is intentionally separated from provider integrations. Future persistence belongs behind server repositories and Supabase RLS, never in client components.
