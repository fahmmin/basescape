# Culture RPG v1

## What Works
- Dynamic culture drops from MongoDB database
- Real-time scoring system with rarity-based points
- Progress persistence (localStorage)
- Local leaderboard with top 50 scores
- Multiple difficulty levels (Easy/Medium/Hard)
- Dynamic box positioning based on map tiles
- In-game UI with progress bar, timer, and score
- Rarity system with color-coded boxes:
  - 🔴 Red = Super Rare (SR) - High hype places
  - 🔵 Teal = Rare (R) - Popular destinations  
  - 🔵 Blue = Uncommon (U) - Hidden gems
  - 🟡 Orange = Common (C) - Well-known spots

## Game Features
- **API Integration**: Fetches real culture drops from `/api/game/drops`
- **Difficulty Modes**: 
  - Easy: 6 drops (popular places only)
  - Medium: 8 drops (mix of popular and hidden gems)
  - Hard: 12 drops (all places including rare finds)
- **Scoring System**: Points based on rarity and popularity
- **Progress Tracking**: Automatic save/load of game state
- **Leaderboard**: Local storage with completion times and scores
- **Game UI**: Real-time progress bar, timer, and score display

## Technical Implementation
- **Game State Management**: `gameState.js` handles persistence and scoring
- **Dynamic Positioning**: Algorithm places boxes on walkable tiles
- **API Fallback**: Graceful degradation if database is unavailable
- **Session Management**: Unique session IDs for tracking

## Still Hardcoded (v2+)
1. World map - static tiles (procedural generation planned)
2. Player sprite - basic rectangle (custom avatar planned)
3. Sound effects - none yet (audio system planned)
4. Multiplayer - single player only (co-op planned)

## Future (v2+)
- Procedural world generation
- Custom player avatars
- Sound effects and music
- Multiplayer co-op mode
- Blockchain integration for NFT rewards
- Global leaderboards
- Achievement system
