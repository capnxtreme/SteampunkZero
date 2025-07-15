import { describe, it, expect } from 'vitest';
import { TrackTexture } from './src/tracks/TrackTexture';

describe('Height Map Test', () => {
  it('should generate height map for walls', () => {
    const track = new TrackTexture(256, 256); // Small for testing
    track.generateOvalTrack();

    const heightMap = track.getHeightMap();
    const canvas = track.getCanvas();
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, 256, 256);

    // Count wall pixels in image
    let wallPixelCount = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      if (r <= 20 && g <= 20 && b <= 20) {
        wallPixelCount++;
      }
    }

    // Count height values > 0
    let heightCount = 0;
    for (let i = 0; i < heightMap.length; i++) {
      if (heightMap[i] > 0) {
        heightCount++;
      }
    }

    console.log('Wall pixels in image:', wallPixelCount);
    console.log('Height values > 0:', heightCount);
    console.log('First 10 height values:', Array.from(heightMap.slice(0, 10)));

    // Height map should have values where walls are
    expect(heightCount).toBeGreaterThan(0);
    expect(heightCount).toBe(wallPixelCount); // Should match
  });
});
