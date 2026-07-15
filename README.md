# UPSC Atlas Explorer

A **global geography study tool with an India-impact lens** for PSC/UPSC revision. Search any city, river, mountain range, protected area, border region, island, or district; inspect it on physical and political maps; then open an exam-oriented geography dossier.

The dossier combines:

- global physical geography — relief, drainage, climate, ecology, resources, and hazards;
- political and administrative geography — regional setting, boundaries, connectivity, and strategic context;
- historical context and durable contemporary relevance;
- recent developments at the searched place, synthesized only from linked NewsAPI records;
- how those developments can directly or indirectly affect India;
- Prelims map facts, Mains-answer angles, and linked English-language articles from the **previous six months**.

> The dossier is an AI-assisted revision aid, not an authoritative source. Verify boundaries, statistics, designations, and time-sensitive facts using official sources before relying on them in an exam answer.

## How it works

1. Open `/explore` and enter a specific place name.
2. The map uses Nominatim/OpenStreetMap to find up to five verifiable matches. Select the correct one when a term is ambiguous; the selected map match is passed to the dossier for disambiguation.
3. Switch between:
   - **Physical** — a topographic basemap; and
   - **Political** — a full basemap with an administrative-boundary/label overlay.
4. Open the **Geography dossier** for the searched place.
5. The dossier retrieves limited background records from OpenStreetMap/Nominatim and Wikipedia, then asks the configured AI provider for a structured global-geography study synthesis and an India-relevance analysis.
6. The app separately queries NewsAPI for linked articles published from six months ago through today. The AI may summarize developments only from those supplied records; linked publisher articles remain the source of record.

## Prerequisites

- Node.js `20.9` through `22.x`
- npm
- An OpenAI or DeepSeek API key for AI dossiers
- A NewsAPI key **with six-month historical-search access** for place news

The typical free NewsAPI developer plan may not permit the requested historical window. The UI explains this clearly when the provider rejects the query.

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add the credentials you intend to use.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Never commit `.env.local`, private keys, or provider credentials. They are ignored by Git.

## Environment variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `AI_PROVIDER` | AI dossiers | `openai` (default) or `deepseek` |
| `OPENAI_API_KEY` | OpenAI dossier generation | Server-side only |
| `DEEPSEEK_API_KEY` | DeepSeek dossier generation | Server-side only |
| `DEEPSEEK_BASE_URL` | Optional DeepSeek-compatible endpoint | Defaults to `https://api.deepseek.com` |
| `NEWS_KEY` | Place-related six-month news | Requires a plan that permits historical `/v2/everything` requests |
| `NOMINATIM_USER_AGENT` | Public Nominatim geocoding | Use a descriptive identifier with a contact URL/email |
| `UPSTASH_REDIS_REST_URL` | Optional production rate limiting | Use with the token below for a shared serverless/distributed limiter |
| `UPSTASH_REDIS_REST_TOKEN` | Optional production rate limiting | Server-side Upstash Redis REST token |

## Commands

```bash
npm run dev        # Start the development server on port 3000
npm run lint       # Run ESLint
npm run typecheck  # Run strict TypeScript checking
npm run test       # Run utility/unit tests
npm run build      # Create a production build
npm run verify     # Lint, type-check, test, and build
npm audit --omit=dev
```

## Application routes

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/explore` | Searchable physical/political maps |
| `/insights?topic=…` | Place geography dossier and six-month news |
| `/api/ai/geocode?q=…` | Validated, throttled Nominatim place lookup |
| `/api/ai/summarize?q=…` | Structured, cached AI place dossier |
| `/api/news?q=…` | Exact-place NewsAPI query from six months ago through today |

## Reliability and safety measures

- Queries are normalized and limited to 120 characters.
- Public API routes use a shared Upstash Redis rate limiter when configured, with a bounded in-memory fallback for local development.
- External requests use explicit timeouts and safe failure messages.
- The map uses Nominatim first and does **not** invent location coordinates with an AI fallback.
- AI responses must conform to a structured JSON shape before they reach the interface.
- News articles retain their original publisher links and publication dates.
- The app distinguishes background references, AI synthesis, sourced current-affairs articles, and India-impact inferences.

> For a horizontally scaled/serverless deployment, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Without them, the app deliberately falls back to a bounded per-process limiter suitable only for local development and low-traffic deployments.

## Project layout

```text
app/                 Pages, global CSS, and API routes
components/          Client-side map controls and Leaflet helpers
lib/                 Shared types, validation, cache, timeout, and rate-limit utilities
public/leaflet/      Leaflet marker assets
```
