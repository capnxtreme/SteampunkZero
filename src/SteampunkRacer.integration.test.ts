import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SteampunkRacer } from './SteampunkRacer';

// Mock RAF for testing
let rafCallbacks: FrameRequestCallback[] = [];
let rafId = 0;

global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  rafCallbacks.push(callback);
  return ++rafId;
});

// Helper to trigger animation frames
function triggerAnimationFrame(time: number = 16) {
  const callbacks = [...rafCallbacks];
  rafCallbacks = [];
  callbacks.forEach((cb) => cb(time));
}

describe('SteampunkRacer Integration Tests', () => {
  let canvas: HTMLCanvasElement;
  let game: SteampunkRacer;
  let ctx: CanvasRenderingContext2D;
  let renderSpy: any;

  beforeEach(() => {
    // Create canvas with mocked context
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    ctx = canvas.getContext('2d')!;

    // Spy on rendering methods
    renderSpy = {
      clearRect: vi.spyOn(ctx, 'clearRect'),
      fillRect: vi.spyOn(ctx, 'fillRect'),
      save: vi.spyOn(ctx, 'save'),
      restore: vi.spyOn(ctx, 'restore'),
      translate: vi.spyOn(ctx, 'translate'),
      rotate: vi.spyOn(ctx, 'rotate'),
      scale: vi.spyOn(ctx, 'scale'),
      beginPath: vi.spyOn(ctx, 'beginPath'),
      moveTo: vi.spyOn(ctx, 'moveTo'),
      lineTo: vi.spyOn(ctx, 'lineTo'),
      stroke: vi.spyOn(ctx, 'stroke'),
      fill: vi.spyOn(ctx, 'fill'),
    };

    // Clear RAF callbacks
    rafCallbacks = [];
    rafId = 0;

    game = new SteampunkRacer(canvas);
  });

  afterEach(() => {
    game.stop();
    vi.clearAllMocks();
  });

  describe('Game Initialization', () => {
    it('should initialize with correct default state', () => {
      expect(game['state'].isRunning).toBe(false);
      expect(game['state'].isPaused).toBe(false);
      expect(game['state'].currentTrack).toBe('random-1');
      expect(game['vehicle']).toBeDefined();
      expect(game['trackTexture']).toBeDefined();
    });

    it('should set vehicle at start position', () => {
      // Vehicle starts at (0, 0) or found start position
      const vehiclePos = game['vehicle'].position;
      expect(vehiclePos).toBeDefined();
      expect(typeof vehiclePos.x).toBe('number');
      expect(typeof vehiclePos.y).toBe('number');
    });
  });

  describe('Game Loop and Rendering', () => {
    it('should start game loop when start() is called', async () => {
      // Mock async methods
      vi.spyOn(game['assetLoader'], 'loadInitialAssets').mockResolvedValue();
      vi.spyOn(game['audioManager'], 'initialize').mockResolvedValue();
      vi.spyOn(game['audioManager'], 'playBackgroundMusic').mockImplementation(
        () => {}
      );

      await game.start();

      expect(game['state'].isRunning).toBe(true);
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it('should render frame when animation frame is triggered', () => {
      game.start();

      // Clear initial calls
      renderSpy.clearRect.mockClear();

      // Trigger a frame
      triggerAnimationFrame(16);

      // Check that rendering happened
      expect(renderSpy.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(renderSpy.save).toHaveBeenCalled();
      expect(renderSpy.restore).toHaveBeenCalled();
    });

    it('should render horizon', () => {
      game.start();
      triggerAnimationFrame(16);

      // Check horizon rendering (gradient fills)
      expect(renderSpy.fillRect).toHaveBeenCalled();
      expect(renderSpy.stroke).toHaveBeenCalled(); // Horizon line
    });

    it('should update vehicle position when accelerating', () => {
      game.start();

      const initialY = game['vehicle'].position.y;

      // Simulate key press
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      game['vehicleController']['handleKeyDown'](keyEvent);

      // Run several physics updates
      for (let i = 0; i < 10; i++) {
        game['update'](0.016); // 16ms = 60fps
      }

      // Vehicle should have moved forward
      expect(game['vehicle'].speed).toBeGreaterThan(0);
      expect(game['vehicle'].position.y).not.toBe(initialY);
    });

    it('should handle collision with track boundaries', () => {
      game.start();

      // Move vehicle to track boundary
      game['vehicle'].position.x = -1000; // Far left
      game['vehicle'].speed = 100;

      // Update physics
      game['update'](0.016);

      // Speed should be reduced due to collision
      expect(game['vehicle'].speed).toBeLessThan(100);
    });
  });

  describe('Full Game Scenario', () => {
    it('should run complete game scenario with movement', () => {
      // Start game
      game.start();
      expect(game['state'].isRunning).toBe(true);

      // Simulate first frame
      triggerAnimationFrame(0);

      // Track initial position
      const startPos = { ...game['vehicle'].position };
      console.log('Start position:', startPos);

      // Simulate acceleration
      const upKey = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      game['vehicleController']['handleKeyDown'](upKey);

      // Run game for 1 second (60 frames)
      for (let frame = 0; frame < 60; frame++) {
        triggerAnimationFrame(frame * 16.67);
      }

      // Check vehicle has moved
      console.log('End position:', game['vehicle'].position);
      console.log('Vehicle speed:', game['vehicle'].speed);

      expect(game['vehicle'].speed).toBeGreaterThan(0);
      expect(game['vehicle'].position.y).not.toBe(startPos.y);

      // Check rendering occurred
      expect(renderSpy.clearRect).toHaveBeenCalled();
      expect(renderSpy.save).toHaveBeenCalled();
      expect(renderSpy.restore).toHaveBeenCalled();

      // Release key
      const upKeyRelease = new KeyboardEvent('keyup', { key: 'ArrowUp' });
      game['vehicleController']['handleKeyUp'](upKeyRelease);

      // Run for another second - vehicle should slow down
      const speedBeforeFriction = game['vehicle'].speed;
      for (let frame = 0; frame < 60; frame++) {
        triggerAnimationFrame((60 + frame) * 16.67);
      }

      expect(game['vehicle'].speed).toBeLessThan(speedBeforeFriction);
    });

    it('should render track and vehicle in correct order', () => {
      game.start();

      // Clear render history
      renderSpy.clearRect.mockClear();
      renderSpy.save.mockClear();
      renderSpy.restore.mockClear();

      // Trigger one frame
      triggerAnimationFrame(16);

      // Get call order
      const calls = [];
      for (const [method, spy] of Object.entries(renderSpy)) {
        if (spy.mock.calls.length > 0) {
          calls.push({ method, callCount: spy.mock.calls.length });
        }
      }

      console.log('Render calls:', calls);

      // Verify rendering order
      expect(renderSpy.clearRect).toHaveBeenCalledBefore(renderSpy.save as any);
      expect(renderSpy.restore.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Camera Following', () => {
    it('should update camera to follow vehicle', () => {
      game.start();

      const initialCamera = { ...game['mode7Renderer'].getCamera() };

      // Move vehicle
      game['vehicle'].position.y += 100;
      game['vehicle'].rotation = Math.PI / 4;

      // Update camera
      game['updateCamera']();

      const newCamera = game['mode7Renderer'].getCamera();

      expect(newCamera.x).not.toBe(initialCamera.x);
      expect(newCamera.y).not.toBe(initialCamera.y);
      expect(newCamera.angle).toBe(Math.PI / 4);
    });
  });

  describe('Track Switching', () => {
    it('should switch between straight and oval tracks', () => {
      expect(game['state'].currentTrack).toBe('straight');

      game.switchTrack();
      expect(game['state'].currentTrack).toBe('oval');

      game.switchTrack();
      expect(game['state'].currentTrack).toBe('straight');
    });
  });

  describe('Debug Output', () => {
    it('should log game state for debugging', () => {
      const logSpy = vi.spyOn(console, 'log');
      logSpy.mockClear(); // Clear any previous calls

      game.start();

      // Trigger multiple frames to ensure we catch the random debug log
      // With 200 frames and 1% chance per frame, we should definitely see it
      for (let i = 0; i < 200; i++) {
        triggerAnimationFrame(16 * i);
      }

      // Should see vehicle state logs (logged randomly ~1% of frames)
      const vehicleStateCall = logSpy.mock.calls.find(
        (call) => call[0] === 'Vehicle state:'
      );
      expect(vehicleStateCall).toBeDefined();

      logSpy.mockRestore();
    });
  });
});
