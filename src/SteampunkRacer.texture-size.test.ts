import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SteampunkRacer } from './SteampunkRacer';

describe('SteampunkRacer Texture Size', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      createPattern: vi.fn().mockReturnValue(null),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      }),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
    } as any;

    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 800,
      height: 600,
      style: {},
    } as any;
  });

  it('should use reasonable texture size for performance', () => {
    const game = new SteampunkRacer(mockCanvas);
    const texture = game['trackTexture'];

    // Texture should be 2048x2048 or smaller for good performance
    expect(texture.canvas.width).toBeLessThanOrEqual(2048);
    expect(texture.canvas.height).toBeLessThanOrEqual(2048);

    // But not too small - we want decent quality
    expect(texture.canvas.width).toBeGreaterThanOrEqual(1024);
    expect(texture.canvas.height).toBeGreaterThanOrEqual(1024);
  });
});
