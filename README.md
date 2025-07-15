# Steampunk Racing Game

A steampunk-themed racing game built with vanilla JavaScript and HTML5 Canvas.

## Project Structure

```
SteampunkZero/
├── index.html          # Main HTML file
├── package.json        # Project configuration
├── src/
│   ├── main.js        # Entry point
│   ├── config.js      # Game configuration
│   ├── core/          # Core game systems
│   │   ├── Game.js    # Main game loop
│   │   ├── AssetLoader.js
│   │   └── EntityManager.js
│   ├── systems/       # Game systems
│   │   ├── InputManager.js
│   │   ├── Renderer.js
│   │   └── PhysicsSystem.js
│   ├── components/    # ECS components
│   │   ├── Transform.js
│   │   └── Physics.js
│   └── utils/         # Utility classes
│       └── Vector2.js
├── tests/            # Test files
│   ├── Game.test.js
│   └── PhysicsSystem.test.js
└── public/           # Assets
    └── assets/
        ├── images/
        ├── audio/
        └── fonts/
```

## Getting Started

1. Install dependencies (when needed):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open http://localhost:8080 in your browser

## Architecture

The game uses an Entity-Component-System (ECS) architecture:
- **Entities**: Game objects managed by EntityManager
- **Components**: Data containers (Transform, Physics, Render, etc.)
- **Systems**: Logic processors (PhysicsSystem, Renderer, etc.)

## Development Plan

Following an incremental development approach with clear milestones:
1. Core engine setup ✓
2. Basic rendering system
3. Physics implementation
4. Player vehicle control
5. Track system
6. Game mechanics
7. Polish and optimization