import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SteampunkRacer } from './SteampunkRacer';

describe('SteampunkRacer Minimap', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let game: SteampunkRacer;

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
      createImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(800 * 600 * 4),
        width: 800,
        height: 600,
      }),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
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

    game = new SteampunkRacer(mockCanvas);
  });

  it('should render minimap even when debug mode is off', () => {
    // Ensure debug mode is off
    game['debugMode'] = false;

    // Render a frame
    game['render']();

    // Check that minimap elements are rendered
    // Should draw minimap background
    expect(mockContext.fillRect).toHaveBeenCalledWith(
      expect.any(Number), // miniMapX - 5
      expect.any(Number), // miniMapY - 5
      160, // miniMapSize + 10
      160 // miniMapSize + 10
    );

    // Should draw the track texture on minimap
    expect(mockContext.drawImage).toHaveBeenCalledWith(
      game['trackTexture'].getCanvas(),
      0,
      0
    );

    // Should draw vehicle position indicator
    expect(mockContext.arc).toHaveBeenCalled();
  });

  it('should position minimap in top right corner', () => {
    game['render']();

    // Minimap should be positioned at canvas.width - 160 (150 + 10 margin)
    const expectedX = 800 - 150 - 10;
    const expectedY = 10;

    // Check translate call for minimap positioning
    expect(mockContext.translate).toHaveBeenCalledWith(expectedX, expectedY);
  });
});
