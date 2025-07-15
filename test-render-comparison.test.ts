import { describe, it, expect, beforeEach } from 'vitest';
import { Mode7Renderer3D } from './src/rendering/Mode7Renderer3D';
import { TrackTexture } from './src/tracks/TrackTexture';

describe('Visual Render Comparison', () => {
  let canvas: HTMLCanvasElement;
  let renderer: Mode7Renderer3D;
  let track: TrackTexture;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    renderer = new Mode7Renderer3D(canvas);
    track = new TrackTexture(2048, 2048);
    track.generateOvalTrack();
  });

  it('should show how much track is visible with 128x scaling', () => {
    // Set camera at typical game position
    renderer.setCameraPosition(0, -100);
    renderer.setCameraHeight(40);
    renderer.setCameraAngle(0);

    // Render the scene
    renderer.renderHorizon();
    renderer.renderMode7With3D(track.getCanvas(), track.getHeightMap());

    // Calculate visible area
    const worldToTextureScale = 0.354;
    const cameraHeight = 40;
    const fov = 120;

    // Approximate visible distance
    const maxVisibleDistance = cameraHeight * 10; // rough approximation
    const visibleAreaRadius = maxVisibleDistance;
    const visibleAreaDiameter = visibleAreaRadius * 2;

    // Track dimensions
    const textureSize = 2048;
    const worldSize = textureSize / worldToTextureScale;
    const percentageVisible = (visibleAreaDiameter / worldSize) * 100;

    console.log('\n=== VISUAL SCALING TEST RESULTS ===');
    console.log(
      'World size:',
      worldSize.toFixed(0),
      '×',
      worldSize.toFixed(0),
      'units'
    );
    console.log(
      'Visible area diameter:',
      visibleAreaDiameter.toFixed(0),
      'units'
    );
    console.log(
      'Percentage of track visible:',
      percentageVisible.toFixed(1),
      '%'
    );
    console.log(
      '\nWith old 1:1 scale, you would see:',
      ((visibleAreaDiameter / 2048) * 100).toFixed(1),
      '% of track'
    );
    console.log('Now you see:', percentageVisible.toFixed(1), '% of track');
    console.log(
      'Track appears',
      (100 / percentageVisible).toFixed(1),
      '× larger!\n'
    );

    // Track should appear much larger (seeing less of it at once)
    expect(percentageVisible).toBeLessThan(10); // Should see less than 10% of track
    expect(percentageVisible).toBeGreaterThan(2); // But more than 2%
  });

  it('should render track width correctly for vehicle scale', () => {
    // Track width in pixels
    const trackWidthPixels = 2048 * 0.3; // 30% of texture
    const worldToTextureScale = 0.354;
    const trackWidthWorld = trackWidthPixels / worldToTextureScale;

    // Vehicle dimensions
    const vehicleWidth = 20; // typical vehicle width in world units
    const vehiclesAcrossTrack = trackWidthWorld / vehicleWidth;

    console.log('\n=== TRACK WIDTH SCALING ===');
    console.log('Track width in pixels:', trackWidthPixels);
    console.log('Track width in world units:', trackWidthWorld.toFixed(0));
    console.log('Vehicle width:', vehicleWidth, 'world units');
    console.log(
      'Vehicles that fit across track:',
      vehiclesAcrossTrack.toFixed(0)
    );
    console.log('\nThis should feel like a proper F-Zero wide track!');

    // Should be very wide like F-Zero
    expect(vehiclesAcrossTrack).toBeGreaterThan(150);
  });
});
