import { describe, it, expect, beforeEach } from 'vitest';
import { Mode7Renderer3D } from './src/rendering/Mode7Renderer3D';
import { TrackTexture } from './src/tracks/TrackTexture';

describe('Wall Rendering Test', () => {
  let canvas: HTMLCanvasElement;
  let renderer: Mode7Renderer3D;
  let track: TrackTexture;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    renderer = new Mode7Renderer3D(canvas);
    track = new TrackTexture(1024, 1024); // Use smaller size for test
  });

  it('should detect walls in the rendering area', () => {
    // Generate track with walls
    track.generateOvalTrack();

    // Set camera position looking at track
    renderer.setCameraPosition(0, -100);
    renderer.setCameraAngle(0);
    renderer.setCameraHeight(40);

    // Get height map
    const heightMap = track.getHeightMap();
    const trackCanvas = track.getCanvas();
    const ctx = trackCanvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, 1024, 1024);

    // Count walls in height map
    let wallsInHeightMap = 0;
    for (let i = 0; i < heightMap.length; i++) {
      if (heightMap[i] > 0) wallsInHeightMap++;
    }

    console.log('Walls in height map:', wallsInHeightMap);

    // Check what the renderer would see
    const camera = renderer.getCamera();
    const horizonY = renderer.getHorizonY();
    console.log('Camera:', camera);
    console.log('Horizon Y:', horizonY);

    // Simulate what renderer sees
    let visibleWalls = 0;
    const fov = 120;
    const near = 10;
    const far = 1000;

    // Check the visible area
    for (let screenY = horizonY; screenY < canvas.height; screenY++) {
      const relativeY = screenY - horizonY;
      const distance = (camera.height * canvas.height) / (relativeY + 1);

      if (distance > far) continue;

      const fovRadians = (fov * Math.PI) / 180;
      const horizScale =
        (Math.tan(fovRadians / 2) * distance) / (canvas.width / 2);

      for (let screenX = 0; screenX < canvas.width; screenX += 10) {
        // Sample every 10 pixels
        const relativeX = screenX - canvas.width / 2;
        const worldX = camera.x + relativeX * horizScale;
        const worldY = camera.y + distance;

        // Apply camera rotation
        const cos = Math.cos(camera.angle);
        const sin = Math.sin(camera.angle);
        const rotatedX =
          (worldX - camera.x) * cos - (worldY - camera.y) * sin + camera.x;
        const rotatedY =
          (worldX - camera.x) * sin + (worldY - camera.y) * cos + camera.y;

        // Convert to texture coordinates (1:1 scale as in renderer)
        const textureX = Math.floor(rotatedX + 512);
        const textureY = Math.floor(rotatedY + 512);

        if (
          textureX >= 0 &&
          textureX < 1024 &&
          textureY >= 0 &&
          textureY < 1024
        ) {
          const heightIndex = textureY * 1024 + textureX;
          if (heightMap[heightIndex] > 0) {
            visibleWalls++;
          }
        }
      }
    }

    console.log('Visible walls in rendering area:', visibleWalls);

    // The renderer should see some walls
    expect(wallsInHeightMap).toBeGreaterThan(0);
    expect(visibleWalls).toBeGreaterThan(0);

    // Test actual rendering
    const originalLog = console.log;
    let wallColumnsLogged = -1;
    console.log = (...args) => {
      if (args[0] === 'Wall columns to render:') {
        wallColumnsLogged = args[1];
      }
      originalLog(...args);
    };

    // Render
    renderer.renderMode7With3D(trackCanvas, heightMap);

    // Restore console.log
    console.log = originalLog;

    console.log('Wall columns rendered:', wallColumnsLogged);
    expect(wallColumnsLogged).toBeGreaterThan(0);
  });
});
