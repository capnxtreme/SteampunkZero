import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrackRenderer } from './TrackRenderer';
import { Track } from './Track';
import { Mode7Renderer } from '../rendering/Mode7Renderer';

describe('TrackRenderer', () => {
  let canvas: HTMLCanvasElement;
  let mode7Renderer: Mode7Renderer;
  let trackRenderer: TrackRenderer;
  let track: Track;

  beforeEach(() => {
    // Create mock canvas
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    // Create Mode7Renderer
    mode7Renderer = new Mode7Renderer(canvas);
    
    // Create TrackRenderer
    trackRenderer = new TrackRenderer(mode7Renderer);
    
    // Create a simple test track
    track = Track.createStraightTrack(1000, 200);
  });

  describe('constructor', () => {
    it('should initialize with Mode7Renderer', () => {
      expect(trackRenderer).toBeDefined();
    });
  });

  describe('render', () => {
    it('should render track without errors', () => {
      expect(() => {
        trackRenderer.render(track, 0);
      }).not.toThrow();
    });

    it('should render with custom options', () => {
      const options = {
        roadColor: '#333333',
        borderColor: '#ff0000',
        centerLineColor: '#00ff00',
        borderWidth: 5,
        showCenterLine: false
      };
      
      expect(() => {
        trackRenderer.render(track, 0, options);
      }).not.toThrow();
    });

    it('should handle camera at different distances', () => {
      expect(() => {
        trackRenderer.render(track, 0);
        trackRenderer.render(track, 500);
        trackRenderer.render(track, 900);
      }).not.toThrow();
    });

    it('should render oval track', () => {
      const ovalTrack = Track.createOvalTrack(1000, 500, 200);
      expect(() => {
        trackRenderer.render(ovalTrack, 0);
      }).not.toThrow();
    });
  });

  describe('renderDebugBoundaries', () => {
    it('should render debug boundaries without errors', () => {
      expect(() => {
        trackRenderer.renderDebugBoundaries(track, 0);
      }).not.toThrow();
    });
  });

  describe('integration with Mode7Renderer', () => {
    it('should use Mode7Renderer worldToScreen transformation', () => {
      const worldToScreenSpy = vi.spyOn(mode7Renderer, 'worldToScreen');
      
      trackRenderer.render(track, 0);
      
      expect(worldToScreenSpy).toHaveBeenCalled();
      worldToScreenSpy.mockRestore();
    });

    it('should respect camera position', () => {
      mode7Renderer.setCameraPosition(100, 200);
      mode7Renderer.setCameraAngle(Math.PI / 4);
      
      expect(() => {
        trackRenderer.render(track, 0);
      }).not.toThrow();
    });
  });
});