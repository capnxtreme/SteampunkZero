import { describe, it, expect, beforeEach } from 'vitest';
import { Mode7Renderer } from './Mode7Renderer';

describe('Mode7Renderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: Mode7Renderer;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    renderer = new Mode7Renderer(canvas);
  });

  describe('initialization', () => {
    it('should create a renderer with canvas context', () => {
      expect(renderer).toBeDefined();
      expect(renderer.getContext()).toBeDefined();
    });

    it('should initialize with default camera position', () => {
      const camera = renderer.getCamera();
      expect(camera.x).toBe(0);
      expect(camera.y).toBe(0);
      expect(camera.angle).toBe(0);
      expect(camera.height).toBe(100);
    });
  });

  describe('perspective transformation', () => {
    it('should transform world coordinates to screen space', () => {
      const worldPoint = { x: 100, y: 100 };
      const screenPoint = renderer.worldToScreen(worldPoint);
      
      expect(screenPoint).toBeDefined();
      expect(screenPoint.x).toBeTypeOf('number');
      expect(screenPoint.y).toBeTypeOf('number');
    });

    it('should apply Mode 7 perspective scaling based on Y position', () => {
      const nearPoint = renderer.worldToScreen({ x: 0, y: 50 });
      const farPoint = renderer.worldToScreen({ x: 0, y: 200 });
      
      // Points further away should appear higher on screen (lower y value)
      expect(farPoint.y).toBeLessThan(nearPoint.y);
    });
  });

  describe('rendering', () => {
    it('should clear the canvas', () => {
      renderer.clear();
      const ctx = renderer.getContext();
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Check that canvas is cleared (all pixels are transparent black)
      const isCleared = imageData.data.every((value, index) => {
        return index % 4 === 3 ? value === 0 : value === 0;
      });
      
      expect(isCleared).toBe(true);
    });

    it('should render a horizon line', () => {
      renderer.renderHorizon();
      const ctx = renderer.getContext();
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Check that some pixels have been drawn
      const hasDrawnPixels = imageData.data.some((value, index) => {
        return index % 4 === 3 ? value > 0 : false;
      });
      
      expect(hasDrawnPixels).toBe(true);
    });
  });

  describe('camera controls', () => {
    it('should update camera position', () => {
      renderer.setCameraPosition(50, 100);
      const camera = renderer.getCamera();
      
      expect(camera.x).toBe(50);
      expect(camera.y).toBe(100);
    });

    it('should update camera angle', () => {
      renderer.setCameraAngle(Math.PI / 4);
      const camera = renderer.getCamera();
      
      expect(camera.angle).toBe(Math.PI / 4);
    });

    it('should update camera height', () => {
      renderer.setCameraHeight(150);
      const camera = renderer.getCamera();
      
      expect(camera.height).toBe(150);
    });
  });
});