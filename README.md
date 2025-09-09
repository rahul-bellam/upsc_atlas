# UPSC Atlas AI Final

This project uses OpenStreetMap + Leaflet, Google Earth Engine for thematic tiles, and supports both OpenAI and DeepSeek for AI enrichment.

Set the following environment variables in Vercel (or .env.local for local testing):
- OPENAI_API_KEY
- DEEPSEEK_API_KEY (optional)
- DEEPSEEK_BASE_URL (optional)
- AI_PROVIDER (openai or deepseek) - optional
- GEE_SERVICE_ACCOUNT
- GEE_PRIVATE_KEY (one-line with \n)
- GEE_PROJECT_ID
- NEWS_KEY (optional)

Deploy to Vercel with build command `npm run build`.
