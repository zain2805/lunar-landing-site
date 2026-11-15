# API integration reference

## Project endpoints
- `GET /api/health` — backend and AI-key configuration status.
- `GET /api/nasa/sources` — NASA/JPL lunar research source catalogue.
- `GET /api/nasa/horizons?start=YYYY-MM-DD&stop=YYYY-MM-DD&step=1h` — NASA/JPL Horizons ephemeris query.
- `POST /api/ai/chat` — OpenAI if `OPENAI_API_KEY` exists; otherwise Gemini if `GEMINI_API_KEY` exists.
- `POST /api/gemini/chat` — Gemini-only endpoint.

## External official services
- NASA/JPL Horizons API documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- NASA API portal: https://api.nasa.gov/
- NASA Planetary Data System: https://pds.nasa.gov/
- NASA Moon Trek: https://trek.nasa.gov/moon/
- LOLA data products: https://pgda.gsfc.nasa.gov/products/78
- NAIF SPICE data: https://naif.jpl.nasa.gov/naif/data_generic.html
- OpenAI API documentation: https://platform.openai.com/docs/api-reference/responses
- Google Gemini API documentation: https://ai.google.dev/gemini-api/docs

NASA/JPL Horizons is a public service and does not require a NASA API key. The AI providers require their own API key and may charge according to the provider's current pricing.
