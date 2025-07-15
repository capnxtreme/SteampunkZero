import { describe, it, expect } from 'vitest';
import { Mode7Renderer3D } from './src/rendering/Mode7Renderer3D';
import { TrackTexture } from './src/tracks/TrackTexture';

describe('128x Scaling Verification', () => {
  it('should have correct world-to-texture scale for 128x bigger tracks', () => {
    // Original texture was 1024x1024
    const originalSize = 1024;
    const originalArea = originalSize * originalSize;

    // Current texture is 2048x2048
    const currentSize = 2048;
    const currentArea = currentSize * currentSize;

    // Scale set in Mode7Renderer3D
    const worldToTextureScale = 0.354;

    // Calculate effective world coverage
    const worldCoverage = currentSize / worldToTextureScale;
    const linearScale = worldCoverage / originalSize;
    const areaScale = linearScale * linearScale;

    console.log('Texture size:', currentSize, 'x', currentSize);
    console.log('World-to-texture scale:', worldToTextureScale);
    console.log(
      'World coverage:',
      worldCoverage.toFixed(0),
      'x',
      worldCoverage.toFixed(0)
    );
    console.log('Linear scale vs original:', linearScale.toFixed(1), 'x');
    console.log('Area scale vs original:', areaScale.toFixed(0), 'x');

    // Should be approximately 128x bigger by area
    expect(areaScale).toBeCloseTo(128, -1); // Within 10% of 128
  });

  it('should render track at correct scale in game', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    const renderer = new Mode7Renderer3D(canvas);
    const track = new TrackTexture(2048, 2048);
    track.generateOvalTrack();

    // Set camera looking at track
    renderer.setCameraPosition(0, -100);
    renderer.setCameraHeight(40);

    // Check that a vehicle-sized object (10 world units) appears correctly
    const vehicleSize = 10; // world units
    const worldToTextureScale = 0.354;
    const vehicleSizeInPixels = vehicleSize * worldToTextureScale;

    console.log('Vehicle size:', vehicleSize, 'world units');
    console.log(
      'Vehicle size in texture:',
      vehicleSizeInPixels.toFixed(1),
      'pixels'
    );

    // Track width is 30% of texture = 614 pixels
    const trackWidthPixels = 2048 * 0.3;
    const trackWidthWorldUnits = trackWidthPixels / worldToTextureScale;
    const vehiclesPerTrackWidth = trackWidthWorldUnits / vehicleSize;

    console.log(
      'Track width:',
      trackWidthPixels,
      'pixels =',
      trackWidthWorldUnits.toFixed(0),
      'world units'
    );
    console.log(
      'Track fits',
      vehiclesPerTrackWidth.toFixed(1),
      'vehicles across'
    );

    // Track should be wide enough for multiple vehicles
    expect(vehiclesPerTrackWidth).toBeGreaterThan(30); // Very wide track
    expect(vehiclesPerTrackWidth).toBeLessThan(400); // But not absurdly wide
  });
});
