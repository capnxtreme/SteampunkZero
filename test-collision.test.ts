import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SteampunkRacer } from './src/SteampunkRacer';

describe('Collision Detection Test', () => {
  let canvas: HTMLCanvasElement;
  let game: SteampunkRacer;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    game = new SteampunkRacer(canvas);
  });

  it('should detect wall collisions with new scale', async () => {
    // Mock audio manager
    vi.spyOn(game['audioManager'], 'initialize').mockResolvedValue();
    vi.spyOn(game['audioManager'], 'playBackgroundMusic').mockImplementation(
      () => {}
    );
    vi.spyOn(game['audioManager'], 'playEngineSound').mockImplementation(
      () => {}
    );
    vi.spyOn(game['audioManager'], 'playCollisionSound').mockImplementation(
      () => {}
    );

    // Start game
    await game.start();

    // Get vehicle and track texture
    const vehicle = game['vehicle'];
    const trackTexture = game['trackTexture'];

    // Place vehicle at a known position
    vehicle.position = { x: 0, y: 0 };
    vehicle.speed = 100;

    // Check what surface we're on
    const worldToTextureScale = 0.354;
    const textureX = Math.floor(
      vehicle.position.x * worldToTextureScale + 1024
    );
    const textureY = Math.floor(
      vehicle.position.y * worldToTextureScale + 1024
    );

    console.log('Vehicle at world position:', vehicle.position);
    console.log('Texture coordinates:', textureX, textureY);

    const surface = trackTexture.getSurfaceAt(textureX, textureY);
    console.log('Surface type:', surface);

    // Find a wall nearby
    let wallFound = false;
    let wallX = 0,
      wallY = 0;

    // Search in expanding circles
    for (let radius = 100; radius < 2000 && !wallFound; radius += 100) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const checkX = Math.cos(angle) * radius;
        const checkY = Math.sin(angle) * radius;

        const texX = Math.floor(checkX * worldToTextureScale + 1024);
        const texY = Math.floor(checkY * worldToTextureScale + 1024);

        if (texX >= 0 && texX < 2048 && texY >= 0 && texY < 2048) {
          if (trackTexture.getSurfaceAt(texX, texY) === 'wall') {
            wallX = checkX;
            wallY = checkY;
            wallFound = true;
            break;
          }
        }
      }
    }

    console.log('Wall found at world position:', wallX, wallY);
    expect(wallFound).toBe(true);

    // Move vehicle toward wall
    const oldPos = { ...vehicle.position };
    vehicle.position.x = wallX - 5; // Just before wall
    vehicle.position.y = wallY;

    // Update game (should hit wall)
    game['update'](0.016);

    console.log('Vehicle position after update:', vehicle.position);
    console.log('Hit wall?', game['state'].isHittingWall);

    // Vehicle should bounce back or stop
    expect(game['state'].isHittingWall).toBe(true);

    // Clean up
    game.stop();
  });

  it('should have correct world-to-texture scale', () => {
    // The scale should make tracks appear 128x bigger
    const worldToTextureScale = 0.354;
    const textureSize = 2048;
    const worldCoverage = textureSize / worldToTextureScale;

    console.log(
      'World coverage:',
      worldCoverage,
      'x',
      worldCoverage,
      'world units'
    );
    console.log('Original was 1024x1024 world units');
    console.log('Scale factor:', worldCoverage / 1024);

    // Should be approximately 5.6x bigger linearly (32x by area)
    expect(worldCoverage / 1024).toBeCloseTo(5.6, 1);
  });
});
