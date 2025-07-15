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

## Debug Bridge

The project includes a debug bridge that captures console output and errors from the browser:
- Debug client code in `src/debug-client.ts` automatically initializes when running locally
- Intercepts all console.log, console.error, console.warn calls
- Captures unhandled errors and promise rejections
- Can send logs to a WebSocket server on port 8889 (if running)
- Check browser console for debug bridge connection status
- **Integration Test Requirement**: 
  - Ensure JavaScript debug bridge is running and used for integration tests

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

## Development Guidelines

- Always test everything before asking the user to test

## CRITICAL RULES - MUST FOLLOW

### Test-Driven Development (TDD) - MANDATORY
1. **ALWAYS write tests FIRST** before implementing any new functionality
2. **Red-Green-Refactor cycle**:
   - RED: Write a failing test that defines the expected behavior
   - GREEN: Write minimal code to make the test pass
   - REFACTOR: Clean up the code while keeping tests green
3. **Never skip tests** - If adding a feature, write its test first
4. **Run tests frequently** - After every change, verify tests still pass
5. **Integration tests** - Use debug bridge for browser-based testing

### Debug Bridge Testing - REQUIRED
1. **Always check console output** via debug bridge when testing in browser
2. **Zero tolerance for errors** - No console errors, warnings, or uncaught exceptions
3. **Monitor performance** - Watch for frame drops or stuttering
4. **Test like a player** - You're Mario Andretti expecting a flawless, fun racing experience
5. **Full integration testing checklist**:
   - Start dev server and open game
   - Check debug bridge connection (port 8889)
   - Monitor ALL console output for errors
   - Test all controls thoroughly
   - Verify smooth 60 FPS gameplay
   - Check collision detection accuracy
   - Ensure responsive steering and acceleration
   - Validate track boundaries work correctly
   - Test pause/resume functionality
   - Verify no memory leaks during extended play

### Context Awareness
1. **Read existing code patterns** before making changes
2. **Check imports and dependencies** before assuming library availability
3. **Follow existing conventions** in the codebase (naming, structure, patterns)
4. **Review related files** to understand context before modifications

### Before Making ANY Changes
1. **Plan with TodoWrite** - Break down tasks into testable units
2. **Write the test** - Define expected behavior
3. **Run existing tests** - Ensure nothing is broken
4. **Implement minimally** - Just enough to pass the test
5. **Run all tests** - Verify your change doesn't break anything
6. **Run lint and typecheck** - `npm run lint` and `npm run typecheck`
7. **Run full integration test** - Start game, check debug bridge, play test

### Common Pitfalls to Avoid
- ❌ Writing code before tests
- ❌ Making assumptions about available libraries
- ❌ Ignoring existing patterns and conventions
- ❌ Forgetting to run tests after changes
- ❌ Skipping lint and typecheck before completion
- ❌ Not checking browser console via debug bridge
- ❌ Accepting any console errors or warnings
- ❌ Not testing actual gameplay experience

### Test File Locations
- Component tests: Same directory as component, with `.test.ts` extension
- Integration tests: Use `.integration.test.ts` extension
- Test utilities: `tests/` directory

### Remember
- This is a TDD project - NO EXCEPTIONS to test-first development
- When in doubt, write a test that clarifies the expected behavior
- Tests are documentation - they show how components should work
- The game must be FUN and FLAWLESS - test it like you're the player
- Debug bridge is your window into the game's health - use it always

## Next Development Steps

### Immediate (Blocking Issue)
1. **Fix Texture Size** - Current 4096x4096 (16MB) textures cause slow loading
   - Reduce to 2048x2048 or 1024x1024
   - Update all hardcoded 4096 references
   - Fix tests using 16384x16384 textures

### Phase 1: Core Racing Fun
2. **AI Opponents**
   - Simple path-following AI
   - Rubber-band difficulty
   - Multiple racing lines
   - Collision between vehicles

3. **Power-up System**
   - Item boxes on track
   - Speed boosts
   - Oil slicks
   - Steam clouds (obscure vision)
   - Magnetic grapple (pull forward)
   - Shield bubble

### Phase 2: Visual Polish
4. **Particle Effects**
   - Steam exhaust from vehicles
   - Dust clouds on dirt
   - Sparks on collision
   - Boost trail effects

5. **Jump Mechanics**
   - Ramp detection
   - Airborne physics
   - Landing effects

### Phase 3: Gameplay Depth
6. **Drift Mechanics**
   - Drift initiation on sharp turns
   - Drift boost on exit
   - Visual tire smoke

7. **Race Management**
   - Position tracking
   - Lap validation
   - Race countdown
   - Victory conditions

### Phase 4: Extended Features
8. **Game Modes**
   - Time Trial with ghosts
   - Championship series
   - Battle arena mode

9. **Customization**
   - Vehicle stats (speed/handling)
   - Visual customization
   - Unlockable content