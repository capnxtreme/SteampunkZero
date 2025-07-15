import { beforeAll, afterEach } from 'vitest';

// Setup canvas mock for tests
beforeAll(() => {
  // Mock canvas getContext if not available (for Node.js environment)
  if (!HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = function (contextType: string) {
      if (contextType === '2d') {
        return {
          clearRect: () => {},
          fillRect: () => {},
          getImageData: () => ({
            data: new Uint8ClampedArray(4 * this.width * this.height),
          }),
          createLinearGradient: () => ({
            addColorStop: () => {},
          }),
          save: () => {},
          restore: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
        };
      }
      return null;
    };
  }
});

// Clean up after each test
afterEach(() => {
  // Any cleanup needed
});
