import { describe, it, expect, beforeEach } from 'vitest';
import { TrackTexture } from './src/tracks/TrackTexture';

describe('Track Size Investigation', () => {
  let trackTexture: TrackTexture;

  beforeEach(() => {
    trackTexture = new TrackTexture(1024, 1024);
  });

  it('should generate oval track with correct dimensions', () => {
    trackTexture.generateOvalTrack();
    const canvas = trackTexture.getCanvas();

    // Get the image data
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, 1024, 1024);
    const pixels = imageData.data;

    // Count road pixels
    let roadPixelCount = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      // Check for road color (dark gray #404040)
      if (r >= 55 && r <= 85 && g >= 55 && g <= 85 && b >= 55 && b <= 85) {
        roadPixelCount++;
      }
    }

    // Track should be approximately 30% of texture width
    const totalPixels = 1024 * 1024;
    const roadPercentage = (roadPixelCount / totalPixels) * 100;

    console.log(
      `Road pixels: ${roadPixelCount} (${roadPercentage.toFixed(1)}% of texture)`
    );

    // Should be a significant portion of the texture
    expect(roadPercentage).toBeGreaterThan(15); // At least 15% should be road
    expect(roadPercentage).toBeLessThan(40); // But not more than 40%
  });

  it('should have correct track width', () => {
    trackTexture.generateOvalTrack();
    const canvas = trackTexture.getCanvas();
    const ctx = canvas.getContext('2d')!;

    // Sample horizontal line at center
    const centerY = 512;
    const imageData = ctx.getImageData(0, centerY, 1024, 1);
    const pixels = imageData.data;

    // Find road edges
    let firstRoadX = -1;
    let lastRoadX = -1;

    for (let x = 0; x < 1024; x++) {
      const i = x * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      if (r >= 55 && r <= 85 && g >= 55 && g <= 85 && b >= 55 && b <= 85) {
        if (firstRoadX === -1) firstRoadX = x;
        lastRoadX = x;
      }
    }

    const measuredWidth = lastRoadX - firstRoadX;
    const expectedWidth = Math.floor(1024 * 0.3); // 30% of texture

    console.log(
      `Measured track width: ${measuredWidth}px, Expected: ${expectedWidth}px`
    );

    expect(measuredWidth).toBeGreaterThan(250); // Should be wide
    expect(measuredWidth).toBeLessThan(350); // But not too wide
  });
});
