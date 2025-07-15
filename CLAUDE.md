# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SteampunkZero is a steampunk-themed Mode 7 style racing game inspired by F-Zero for SNES. The project uses TypeScript, Canvas API, and follows Test-Driven Development (TDD) principles.

## Technology Stack

- **Language**: TypeScript with strict mode
- **Rendering**: HTML5 Canvas API with custom Mode 7 renderer
- **Build Tool**: Vite
- **Testing**: Vitest with jsdom and canvas mocking
- **Architecture**: Entity-Component-System (ECS) pattern

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Type-check and build for production
npm run preview      # Preview production build

# Testing
npm test             # Run all tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Check code with ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run typecheck    # Type-check without building
```

## Project Architecture

### Core Systems

1. **Mode7Renderer** (`src/rendering/Mode7Renderer.ts`)
   - Implements SNES-style Mode 7 perspective transformation
   - Camera system with position, angle, and height
   - World-to-screen coordinate transformation

2. **Vehicle System** (`src/entities/Vehicle.ts`)
   - Physics-based movement with acceleration and friction
   - Rotation-based steering
   - VehicleController for input handling
   - VehicleSprite for rendering

3. **Track System** (`src/track/Track.ts`)
   - Segment-based track representation
   - Boundary collision detection
   - TrackRenderer for Mode 7 rendering
   - Factory methods for common track types

4. **Main Game** (`src/SteampunkRacer.ts`)
   - Game state management
   - Fixed timestep game loop (60 FPS physics)
   - Camera follows player vehicle
   - HUD with speed and time display

### Key Design Patterns

- **ECS Architecture**: Entities, Components, and Systems are separated
- **Fixed Timestep**: Physics runs at consistent 60 FPS with interpolation
- **TDD Approach**: All components have comprehensive test coverage

## Testing Approach

- Unit tests for all core components
- Canvas mocking setup in `tests/setup.ts`
- Run specific tests: `npx vitest run path/to/test.ts`
- Watch mode: `npx vitest --watch`

## Common Development Tasks

1. **Adding a new game entity**:
   - Create entity class in `src/entities/`
   - Write tests first following TDD
   - Implement physics component if needed
   - Add rendering logic

2. **Creating new track types**:
   - Extend Track class or use factory methods
   - Define track segments with curves
   - Test collision detection

3. **Modifying Mode 7 effect**:
   - Adjust perspective in `Mode7Renderer.worldToScreen()`
   - Modify horizon position and FOV
   - Test visual output with different camera heights

## Current Features

- ✅ Mode 7 perspective rendering
- ✅ Player vehicle with physics
- ✅ Keyboard controls (Arrow keys)
- ✅ Track system with boundaries
- ✅ Collision detection
- ✅ Game state management
- ✅ Pause functionality
- ✅ Track switching (straight/oval)