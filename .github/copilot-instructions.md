# Copilot Instructions for Apfelkomplott UI

## Project Overview
Apfelkomplott is a React + Vite UI for a turn-based strategy game. The UI fetches game state from a backend API (`localhost:8080/game`) and displays game phases, player scores, and available production cards in a market.

## Tech Stack
- **Framework**: React 19 with Vite 7
- **Build Tool**: Vite (fast dev server with HMR)
- **Linting**: ESLint with React Hooks & Fast Refresh plugins
- **Styling**: CSS Modules (not configured; uses inline styles currently)
- **State Management**: React hooks (useState, useEffect)

## Architecture

### Key Data Flow
1. **Entry**: `main.jsx` → `App.jsx` → `GamesPage.jsx` (main game container)
2. **API Layer**: `api/gameApi.js` - Centralized fetch calls to `http://localhost:8080/game`
3. **Components**:
   - `GamesPage.jsx`: Orchestrates game state, market data, and UI updates
   - `ScoreBoard.jsx`: Displays player money and three scores (economy, environment, health)
   - `Market.jsx`: Shows production cards available for purchase (INVEST phase only)
   - `Controls.jsx`: Handles round progression and phase-dependent actions

### State Management Patterns
- **GamesPage** holds `gameState` and `market` as top-level state
- Use `setGameState`/`setMarket` directly; no Context API or Redux
- Refresh pattern: After API mutations (e.g., `nextRound()`), call both `refreshState()` and `refreshMarket()` to stay in sync
- Phase-aware rendering: Check `gameState.phase` before enabling UI (e.g., Market.jsx only allows buys in INVEST phase)

### Backend API Contract
All endpoints use base URL `http://localhost:8080/game`:
- `POST /start` - Initialize game, returns gameState object
- `GET /state` - Current game state (phase, player data, etc.)
- `POST /next-round` - Advance round, triggers phase changes
- `GET /market` - Array of production cards with `{name, description, cost}`
- `POST /invest/production` - Buy card, expects JSON body `{cardName}`

**Important**: API calls don't return updated state; manually refresh with `getGameState()` and `getMarket()`.

## Development Workflow

### Commands
```bash
npm run dev      # Start Vite dev server (HMR enabled)
npm run build    # Production build (vite build)
npm run lint     # ESLint check
npm run preview  # Preview built output locally
```

### Dev Server
- Runs on `http://localhost:5173` by default
- Hot Module Replacement active; edits refresh instantly without state loss
- Backend must be running on `localhost:8080` for API calls

## Critical Conventions

### Component Structure
- Functional components with React Hooks only
- Keep components focused; pass data down, callbacks up (prop drilling acceptable for this size)
- No class components

### Naming
- Components: PascalCase (e.g., `Market.jsx`)
- Files match component name exactly
- Functions/variables: camelCase

### Styling
- Currently using inline `style={{}}` objects (no CSS modules yet)
- Global styles in `index.css` and `App.css`
- Add responsive breakpoints if UI grows

### Error Handling
- Minimal currently; API failures silently occur
- Add try/catch to async handlers if implementing error states
- Network timeouts not handled; backend must be reliable

## Common Tasks

### Adding a New Game Feature
1. Add endpoint to API contract documentation in `gameApi.js`
2. Create fetch function in `gameApi.js` following existing pattern (no error handling needed yet)
3. Import in `GamesPage.jsx`, call in appropriate handler
4. Create or update component to display/interact with new data
5. Update `gameState` shape expectations in ScoreBoard/Market/Controls as needed

### Debugging State Issues
- Check `gameState` object shape matches backend expectations (see GamesPage useEffect)
- After mutations, verify both `refreshState()` and `refreshMarket()` are called
- Use React DevTools to inspect prop values in components

### Extending Market/ScoreBoard
- Market accepts `phase` prop to conditionally disable purchases
- ScoreBoard destructures `score` object; backend must provide `{economy, environment, health}`
- If score structure changes, update destructuring and display in ScoreBoard.jsx

## Integration Points
- **Backend Dependency**: Critical - all gameplay logic lives in backend; UI is thin display layer
- **Build Output**: `dist/` directory; serve with any static host
- **No External Deps**: React + Vite only; keep dependencies minimal to avoid bloat
