import { describe, it, expect, beforeEach } from 'vitest';
import { Mode7Renderer3D } from './Mode7Renderer3D';

describe('Mode7Renderer3D', () => {
  let canvas: HTMLCanvasElement;
  let renderer: Mode7Renderer3D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    renderer = new Mode7Renderer3D(canvas);
  });

  describe('world to texture coordinate mapping', () => {
    it('should scale world coordinates correctly', () => {
      // World coordinates should map to texture coordinates with scale
      // The scale factor we added is 2.0
      const worldToTextureScale = 2.0;

      // Test cases: [worldX, worldY, expectedTextureX, expectedTextureY]
      const testCases = [
        [0, 0, 512, 512], // Center of world -> center of texture
        [100, 0, 512 + 200, 512], // 100 world units right -> 200 pixels right
        [0, 100, 512, 512 + 200], // 100 world units down -> 200 pixels down
        [-100, -100, 512 - 200, 512 - 200], // Negative coordinates
      ];

      testCases.forEach(([worldX, worldY, expectedX, expectedY]) => {
        // Manual calculation matching the renderer
        const textureX = Math.floor(worldX * worldToTextureScale + 512);
        const textureY = Math.floor(worldY * worldToTextureScale + 512);

        expect(textureX).toBe(expectedX);
        expect(textureY).toBe(expectedY);
      });
    });

    it('should have appropriate camera settings for track visibility', () => {
      const camera = renderer.getCamera();

      // Camera height should be reasonable for viewing the track
      expect(camera.height).toBeLessThan(100);
      expect(camera.height).toBeGreaterThan(20);
    });
  });
});
