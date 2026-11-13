# TCG Market

An interactive Pokémon and Yu-Gi-Oh! trading-card marketplace prototype. The demo includes card discovery, card details, cart, selling, and profile screens. Catalogue information comes from public card APIs; cart and profile settings are stored in the visitor's browser. It does not process real orders or payments.

## Run locally

Requirements: Node.js 22 or newer and npm.

```sh
./start.sh
```

Open [http://localhost:8080](http://localhost:8080). The script installs frontend dependencies on first run, builds the app, and starts the local server. You can set `PORT` to use a different port.

For frontend development with Vite:

```sh
npm --prefix "Prototype frontend" ci
npm --prefix "Prototype frontend" run dev
```

## Deploy to Vercel

The repository includes `vercel.json` and a Vercel Function for the optional CardTrader proxy. To enable push-to-deploy:

1. Import this repository into Vercel and select the repository root as the project root.
2. Keep the build settings from `vercel.json` (the frontend install/build commands and output directory are configured there).
3. Add `CARDTRADER_TOKEN` as a Vercel environment variable only if you use the CardTrader proxy. The rest of the demo works without it.
4. Deploy once. Vercel then builds and deploys future pushes to the connected repository; pushes to the configured production branch update production.

The local Node server remains available through `./start.sh`; it serves the same frontend build and reads an optional `CARDTRADER_TOKEN` from `.env`. Never commit `.env` or put secrets in frontend code.

## Project structure

- `Prototype frontend/src/` — React welcome screen and Vite entry point.
- `Prototype frontend/public/api-playground/` — marketplace pages, styles, scripts, and the local assets used by those pages.
- `api/cardtrader/` — optional server-side CardTrader proxy for Vercel.
- `server.mjs` and `start.sh` — local production-style server workflow.

The marketplace is a prototype rather than a production trading service: there is no shared account system, persistent inventory, order backend, or payment integration.
