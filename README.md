# Apfelkomplott UI

Frontend for the **Apfelkomplott** digital board game prototype. This project is part of a master's thesis and implements the browser-based user interface for an orchard management game with strategy, scoring, market cards, and phase-based gameplay.

The application is built with **React + Vite** and communicates with a **Java Spring Boot** backend.

---

## Overview

Apfelkomplott models orchard management decisions across multiple rounds. Players choose a farming strategy, progress through game phases, invest in production, react to market events, and balance three main outcome dimensions:

* Economy
* Environment
* Health

The UI currently includes:

* Landing page and mode selection
* Game board with production, transport, and sales areas
* Round and phase tracking
* Score and money display
* Investment actions
* Production card market with card effects
* Card images and QR code support
* Event handling
* End-of-round scoring
* Sell-result popups

---

## Tech Stack

* React 19
* Vite
* Framer Motion
* `qrcode.react`
* Java Spring Boot backend API

---

## Project Structure

```text
src/
  api/
    gameApi.js
  components/
    BoardLayout.jsx
    Market.jsx
    RoundTrack.jsx
    ScoreBoard.jsx
    ...
  pages/
    StartScreen.jsx
    ModeSelection.jsx
    GamePage.jsx
```

---

## Prerequisites

Before running the frontend, make sure you have:

* Node.js 18+
* npm
* The Spring Boot backend running

---

## Environment Configuration

The frontend reads the backend base URL from:

```text
VITE_API_BASE_URL
```

### Development

`.env.development`

```env
VITE_API_BASE_URL=http://localhost:8081
```

### Production

The production backend URL depends on the deployment target.

For the Vercel + Render deployment:

```env
VITE_API_BASE_URL=https://apfelkomplott-backend.onrender.com
```

For the Hochschule Fulda VM deployment:

```env
VITE_API_BASE_URL=http://193.174.29.11
```

After DNS and SSL setup on the Hochschule Fulda VM:

```env
VITE_API_BASE_URL=https://apfelkomplott.cs.hs-fulda.de
```

---

## Installation

Install dependencies:

```bash
npm install
```

---

## Running the Project Locally

Start the Vite development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint.

---

## Backend Integration

The frontend communicates with the backend through:

```text
src/api/gameApi.js
```

Implemented API interactions include:

* `POST /game/start?mode=...`
* `POST /game/start-demo`
* `GET /game/state`
* `GET /game/help`
* `GET /game/help/current-phase`
* `POST /game/next-phase`
* `POST /game/invest`
* `POST /game/invest/production`
* `GET /game/market`

---

## Gameplay Flow

1. Open the landing page.
2. Go to the mode selection screen.
3. Choose either `CONVENTIONAL` or `ORGANIC`.
4. Start a new game.
5. Progress through the game phases.
6. Make investments.
7. Buy production cards.
8. React to market events.
9. Monitor economy, environment, and health scores.
10. Reach the final game state and review the result.

---

## Production Deployment on Hochschule Fulda VM

The frontend is deployed on a Hochschule Fulda virtual machine and served through Nginx.

### Production Environment

* Ubuntu Server 26.04 LTS
* Nginx
* React + Vite frontend
* Spring Boot backend running on port `8081`

### Build

```bash
npm install
npm run build
```

The generated files are located in:

```text
dist/
```

### Deploy Build to Nginx

Copy the generated build files to the Nginx web directory:

```bash
sudo rm -rf /var/www/apfelkomplott/*
sudo cp -r dist/* /var/www/apfelkomplott/
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

---

## Server Routing

On the Hochschule Fulda VM, Nginx serves the frontend and forwards backend-related requests to the Spring Boot backend.

Frontend:

```text
/
```

Backend API:

```text
/game/*
```

Card images:

```text
/cards/*
```

The `/cards/*` route is needed because card images are stored in the backend under:

```text
src/main/resources/static/cards
```

---

## Current Deployment URLs

Vercel deployment:

```text
Frontend hosted on Vercel
Backend hosted on Render
```

Hochschule Fulda VM deployment:

```text
http://193.174.29.11
```

Planned Hochschule Fulda DNS deployment:

```text
https://apfelkomplott.cs.hs-fulda.de
```

---

## Notes

* The frontend currently uses local component state for screen transitions.
* React Router is not currently used.
* The frontend reads the backend base URL from `VITE_API_BASE_URL`.
* Local development uses `.env.development`.
* Vercel/Render deployment uses `.env.production`.
* The Hochschule Fulda VM deployment may require changing the production environment variable before building.
* Card images are served through the backend under `/cards/*`.
* The UI is designed for a thesis/demo workflow and can be extended further for production-style routing, improved deployment automation, and broader evaluation use.

---

## Suggested Future Improvements

* Add React Router for real browser navigation
* Improve error handling and loading states
* Add tests for key components and flows
* Improve mobile responsiveness
* Add deployment automation
* Extend multiplayer support
* Align UI copy more closely with final thesis terminology

---

## License

No license has been added yet. Add one if this project will be shared publicly.
