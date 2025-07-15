import { describe, it, expect, beforeEach } from 'vitest';
import { Mode7Renderer3D } from './src/rendering/Mode7Renderer3D';
import { TrackTexture } from './src/tracks/TrackTexture';

describe('Visible Track Size Test', () => {
  let canvas: HTMLCanvasElement;
  let renderer: Mode7Renderer3D;
  let track: TrackTexture;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    renderer = new Mode7Renderer3D(canvas);
    track = new TrackTexture(2048, 2048);
  });

  it('should show how much of the track is visible on screen', () => {
    // With worldToTextureScale = 64, and camera at height 40
    const worldToTextureScale = 64.0;
    const textureSize = 2048;
    const cameraHeight = 40;

    // Calculate visible world units
    const worldUnitsInTexture = textureSize / worldToTextureScale;
    console.log('Total world units in texture:', worldUnitsInTexture);

    // At camera height 40 with FOV 120°, approximate visible distance
    const visibleDistance = cameraHeight * 10; // Rough estimate
    console.log(
      'Approximate visible distance:',
      visibleDistance,
      'world units'
    );

    // Track width in pixels
    const trackWidthPixels = Math.floor(2048 * 0.3);
    const trackWidthWorldUnits = trackWidthPixels / worldToTextureScale;
    console.log(
      'Track width:',
      trackWidthPixels,
      'pixels =',
      trackWidthWorldUnits,
      'world units'
    );

    // Vehicle size for comparison
    const vehicleSize = 10; // Typical vehicle is ~10 world units
    const tracksPerVehicle = trackWidthWorldUnits / vehicleSize;
    console.log('Track is', tracksPerVehicle, 'vehicle widths wide');

    // The track should be much wider than a vehicle
    expect(trackWidthWorldUnits).toBeGreaterThan(15); // At least 1.5x vehicle width
    expect(worldUnitsInTexture).toBe(32); // 2048 / 64 = 32 world units total
  });

  it('should render walls if they exist', () => {
    track.generateOvalTrack();
    renderer.setCameraPosition(0, -50);
    renderer.setCameraHeight(40);

    // Check if track has walls
    const heightMap = track.getHeightMap();
    let wallCount = 0;
    for (let i = 0; i < heightMap.length; i++) {
      if (heightMap[i] > 0) wallCount++;
    }

    console.log('Walls in heightmap:', wallCount);
    expect(wallCount).toBeGreaterThan(0);

    // The generateOvalTrack should create walls
    const canvas = track.getCanvas();
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(1024, 1024, 1, 1); // Center pixel
    console.log('Center pixel color:', Array.from(imageData.data));
  });
});
