import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SteampunkRacer } from './SteampunkRacer';

describe('SteampunkRacer', () => {
  let canvas: HTMLCanvasElement;
  let game: SteampunkRacer;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    game = new SteampunkRacer(canvas);
  });

  describe('initialization', () => {
    it('should create a game instance', () => {
      expect(game).toBeDefined();
    });

    it('should start in stopped state', () => {
      expect(game['state'].isRunning).toBe(false);
      expect(game['state'].isPaused).toBe(false);
    });

    it('should initialize with random-1 track', () => {
      expect(game['state'].currentTrack).toBe('random-1');
    });
  });

  describe('game control', () => {
    it('should start the game', async () => {
      // Mock the async methods
      vi.spyOn(game['assetLoader'], 'loadInitialAssets').mockResolvedValue();
      vi.spyOn(game['audioManager'], 'initialize').mockResolvedValue();
      vi.spyOn(game['audioManager'], 'playBackgroundMusic').mockImplementation(
        () => {}
      );

      await game.start();
      expect(game['state'].isRunning).toBe(true);
    });

    it('should stop the game', () => {
      game.start();
      game.stop();
      expect(game['state'].isRunning).toBe(false);
    });

    it('should toggle pause state', () => {
      game.start();
      expect(game['state'].isPaused).toBe(false);

      game.pause();
      expect(game['state'].isPaused).toBe(true);

      game.pause();
      expect(game['state'].isPaused).toBe(false);
    });
  });

  describe('track switching', () => {
    it('should switch between random tracks and oval', () => {
      expect(game['state'].currentTrack).toBe('random-1');

      game.switchTrack();
      expect(game['state'].currentTrack).toBe('random-2');

      game.switchTrack();
      expect(game['state'].currentTrack).toBe('random-3');

      game.switchTrack();
      expect(game['state'].currentTrack).toBe('oval');

      game.switchTrack();
      expect(game['state'].currentTrack).toBe('random-1');
    });

    it('should reset vehicle position when switching tracks', () => {
      const initialX = game['vehicle'].position.x;
      const initialY = game['vehicle'].position.y;

      // Move vehicle
      game['vehicle'].position.x += 100;
      game['vehicle'].position.y += 100;

      game.switchTrack();

      // Vehicle should be reset to start position
      expect(game['vehicle'].position.x).not.toBe(initialX + 100);
      expect(game['vehicle'].position.y).not.toBe(initialY + 100);
      expect(game['vehicle'].speed).toBe(0);
    });
  });

  describe('keyboard controls', () => {
    it('should pause on P key', () => {
      game.start();
      game.handleKeyPress('p');
      expect(game['state'].isPaused).toBe(true);
    });

    it('should switch track on T key', () => {
      const initialTrack = game['state'].currentTrack;
      game.handleKeyPress('t');
      expect(game['state'].currentTrack).not.toBe(initialTrack);
    });

    it('should handle uppercase keys', () => {
      game.start();
      game.handleKeyPress('P');
      expect(game['state'].isPaused).toBe(true);
    });
  });
});
