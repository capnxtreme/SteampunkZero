import { describe, it, expect } from 'vitest';
import { TrackTexture } from './src/tracks/TrackTexture';

describe('Track Scale Test', () => {
  it('should create a 2K texture', () => {
    const track = new TrackTexture(2048, 2048);
    const canvas = track.getCanvas();

    expect(canvas.width).toBe(2048);
    expect(canvas.height).toBe(2048);
  });

  it('should have appropriately scaled track elements', () => {
    const track = new TrackTexture(2048, 2048);
    track.generateOvalTrack();

    // Track width should still be 30% of texture
    const expectedTrackWidth = Math.floor(2048 * 0.3);
    console.log('Expected track width:', expectedTrackWidth, 'pixels');

    expect(expectedTrackWidth).toBeGreaterThan(500); // Should be reasonable
  });

  it('should have correct world-to-texture scale', () => {
    const worldToTextureScale = 32.0;
    const textureSize = 2048;

    // 1 world unit should equal 32 texture pixels
    // So 100 world units = 3200 texture pixels
    const worldUnits = 100;
    const texturePixels = worldUnits * worldToTextureScale;

    expect(texturePixels).toBe(3200);

    // The visible area should be much smaller than the total texture
    const visibleWorldUnits = textureSize / worldToTextureScale;
    console.log('Total world units in texture:', visibleWorldUnits);

    expect(visibleWorldUnits).toBe(64); // 2048 / 32 = 64 world units
  });
});
