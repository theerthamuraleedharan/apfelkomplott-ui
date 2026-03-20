# Apfelkomplott UI

Frontend for the **Apfelkomplott** digital board game prototype. This project is part of a master thesis and implements the browser-based user interface for an orchard management game with strategy, scoring, market cards, and phase-based gameplay.

The application is built with **React + Vite** and connects to a **Java Spring Boot** backend.

## Overview

Apfelkomplott models orchard management decisions across multiple rounds. Players choose a farming strategy, move through game phases, invest in production, react to market cards, and balance three main outcome dimensions:

- Economy
- Environment
- Health

The UI currently includes:

- A landing page and mode selection flow
- A game board with production, transport, and sales areas
- Round and phase tracking
- Score and money display
- Investment actions
- Production card market with card effects, images, and QR code support
- End-of-round scoring and sell-result popups

## Tech Stack

- React 19
- Vite
- Framer Motion
- `qrcode.react`
- Java Spring Boot backend API

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

## Prerequisites

Before running the frontend, make sure you have:

- Node.js 18+ installed
- npm installed
- The Spring Boot backend running locally on `http://localhost:8081`

This frontend expects the backend base URL through `VITE_API_BASE_URL`.

For local development:

```text
VITE_API_BASE_URL=http://localhost:8081
```

For production builds:

```text
VITE_API_BASE_URL=https://apfelkomplott-backend.onrender.com
```

## Installation

Install dependencies:

```bash
npm install
```

## Running the Project

Start the Vite development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally
- `npm run lint` runs ESLint

## Backend Integration

The frontend communicates with the backend through `src/api/gameApi.js`.

Implemented API interactions include:

- `POST /game/start?mode=...`
- `GET /game/state`
- `POST /game/next-phase`
- `GET /game/market`
- `POST /game/invest`
- `POST /game/invest/production`

## Gameplay Flow in the UI

1. Open the landing page.
2. Move to the mode selection screen.
3. Choose either `CONVENTIONAL` or `ORGANIC`.
4. Start the game and load the current game state from the backend.
5. Progress through phases and interact with investments, market cards, and board sections.
6. Review score changes, event cards, and game-over state.

## Notes

- This project uses local component state for screen transitions between landing, mode selection, and game screens.
- It does not currently use React Router.
- The frontend now reads the backend base URL from `VITE_API_BASE_URL`.
- Local development uses `.env.development` with `http://localhost:8081`.
- Production builds use `.env.production` with `https://apfelkomplott-backend.onrender.com`.
- The UI is designed for a thesis/demo workflow and can be extended further for production-style routing, environment configuration, and deployment.

## Suggested Next Improvements

- Add React Router for real browser navigation
- Improve error handling and loading states
- Add tests for key components and flows
- Align UI copy more closely with the thesis text

## License

No license has been added yet. Add one if this project will be shared publicly.
