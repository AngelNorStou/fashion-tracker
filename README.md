# Fashion Tracker

A full-stack wardrobe app where you catalog your clothes, build outfits visually, and preview them on yourself with AI.

**Live demo:** https://fashion-tracker.vercel.app

---

## Features

### Wardrobe
- Upload clothing items with a photo (required), brand, color, size, gender, category and tags
- Hierarchical categories (60+ subcategories) with search and filtering by category, color and tag
- Paginated grid, edit and delete

### Outfit builder
- Zone-based builder (hat, top, belt, bottom, shoes, bag, accessories) driven by the category hierarchy
- Layering for tops (e.g. t-shirt under a hoodie), with reorderable layer order
- Dresses and full-body items are mutually exclusive with tops, belts and bottoms
- Intimates are excluded from outfit building
- Read-only outfit detail page, plus a reusable builder for create and edit
- Responsive across desktop, tablet and mobile

### AI outfit generation
- Generates an image of an outfit being worn by composing the user's own clothing photos (top, bottom, optional belt and shoes) with Google Gemini's multimodal image API
- Per-user rate limit (5 generations per 24 hours) to control API cost
- Generation history with search by outfit name, filters (outfit, gender, date range), pagination and delete
- Generated images stored in a dedicated Supabase Storage bucket

### Authentication and account security
- Registration with email verification (24-hour link) and email domain validation (MX record lookup plus a blocklist of fake/disposable domains)
- Opt-in two-factor authentication via emailed one-time code
- Device trust: a successfully verified device skips 2FA for 30 days
- Forgot / reset password flow; resetting a password revokes all trusted devices
- Change password and change email (the new address must be confirmed before it takes effect)
- Rate limiting on login, 2FA verification/resend and password reset; generic responses on password reset to prevent user enumeration
- Show/hide toggle on password fields

---

## Tech stack

| Layer | Technology                                                                                           |
|---|------------------------------------------------------------------------------------------------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS                                                       |
| Backend | Java 21, Spring Boot 4.1, Spring Security (OAuth2 resource server, JWT), Spring Data JPA / Hibernate |
| Database | PostgreSQL (Supabase), Flyway migrations                                                             |
| Storage | Supabase Storage (clothing images and generated images)                                              |
| Email | EmailJS (server-side REST API)                                                                       |
| AI | Google Gemini API (called directly via `HttpClient`)                                                 |
| Hosting | Vercel (frontend), Railway (backend) (to be changed)                                                 |

---

## Architecture

```
Browser (Next.js on Vercel)
        |  HTTPS + JWT (Authorization: Bearer ...)
        v
Spring Boot REST API (Railway)
   |-- Controllers -> Services -> Repositories (JPA)
   |-- Global exception handler -> consistent JSON errors
   |-- Rate limiting service (in-memory sliding window)
   |
   |-- PostgreSQL (Supabase, pooled connection)
   |-- Supabase Storage (clothing-images, outfit-generations)
   |-- EmailJS API (verification, 2FA, reset, email change)
   `-- Gemini API (outfit image generation)
```

Notes:
- Zone mapping (which category belongs in which body zone) is derived on the frontend from the category hierarchy returned by `/api/categories`, so new subcategories inherit their parent's zone automatically.
- The in-memory rate limiter is fine for a single backend instance; running multiple instances would need a shared store such as Redis.

---

## Project structure

```
frontend/   Next.js app (App Router)
backend/    Spring Boot API
```

---

## Running locally

### Prerequisites
- Node.js 20+
- Java 21 and Maven
- A Supabase project (Postgres and two public storage buckets: `clothing-images` and `outfit-generations`)
- An EmailJS account with one generic template (variables: `to_email`, `subject`, `message`)
- A Gemini API key with billing enabled (the free tier has no quota for image models)

### Backend

Set these environment variables (names only; never commit real values):

| Variable | Purpose |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Postgres connection (Supabase) |
| `JWT_SECRET` | Base64-encoded HMAC secret for signing JWTs |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Storage access |
| `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY` | Transactional email |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Image generation |
| `FRONTEND_URL` | Used to build links in emails (default `http://localhost:3000`) |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin(s) (default `http://localhost:3000`) |

```bash
cd backend
mvn spring-boot:run
```

Flyway runs the migrations in `src/main/resources/db/migration` on startup.

### Frontend

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
```

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

- **Backend:** Railway, deploying the Spring Boot service, with the environment variables above. Uses Supabase's pooled connection string (port 6543).
- **Frontend:** Vercel with the Root Directory set to `frontend` and the Framework Preset set to Next.js. `NEXT_PUBLIC_*` variables are baked in at build time, so redeploy after changing them.
- Outbound SMTP is blocked on Railway's lower plans, which is why email goes through an HTTPS API (EmailJS) instead of SMTP.

---

## Known limitations

- **No automated tests yet.** This is the biggest gap and the next thing planned.
- **Edge's built-in PDF viewer:** links opened from inside a PDF in Microsoft Edge load in a restricted context that blocks `localStorage`, so login can't work there. The app fails gracefully, and opening the link in a normal tab works.
- **Sessions last 15 minutes** with no refresh-token mechanism, so users re-authenticate fairly often.
- **AI generation scope:** requires an outfit with a top and a bottom (dresses are not supported). When a top is layered, the outermost one is used. Generated image quality varies, and failed attempts are retried manually to keep API cost predictable.
- Email sending relies on a personal mailbox via EmailJS (200 emails/month on the free tier), which suits a small user base.

---

## Roadmap

- Automated tests (JUnit / MockMvc on the backend, component tests on the frontend) and a CI pipeline
- Client-side background removal for clothing photos
- Refresh tokens
- Recommendations and analytics