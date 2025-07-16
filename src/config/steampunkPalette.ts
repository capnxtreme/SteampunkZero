/**
 * Steampunk Color Palette Configuration
 * Based on the Steampunk Visual Enhancement Plan
 */

export interface SteampunkColor {
  hex: string;
  rgb: [number, number, number];
  name: string;
}

export interface SteampunkPalette {
  metallic: {
    brass: SteampunkColor[];
    copper: SteampunkColor[];
    iron: SteampunkColor[];
    gold: SteampunkColor[];
  };
  victorian: {
    browns: SteampunkColor[];
    burgundy: SteampunkColor[];
    greens: SteampunkColor[];
    blues: SteampunkColor[];
  };
  atmospheric: {
    steam: SteampunkColor[];
    soot: SteampunkColor[];
    oil: SteampunkColor[];
    rust: SteampunkColor[];
  };
  gradients: {
    sky: string[];
    track: string[];
    brass: string[];
    copper: string[];
  };
}

export const STEAMPUNK_PALETTE: SteampunkPalette = {
  metallic: {
    brass: [
      { hex: '#B8860B', rgb: [184, 134, 11], name: 'Dark Goldenrod' },
      { hex: '#CD7F32', rgb: [205, 127, 50], name: 'Bronze' },
      { hex: '#B87333', rgb: [184, 115, 51], name: 'Copper' },
      { hex: '#8B6914', rgb: [139, 105, 20], name: 'Goldenrod' },
    ],
    copper: [
      { hex: '#B87333', rgb: [184, 115, 51], name: 'Copper' },
      { hex: '#DA8A67', rgb: [218, 138, 103], name: 'Copper Rose' },
      { hex: '#CB6D51', rgb: [203, 109, 81], name: 'Copper Red' },
      { hex: '#C17135', rgb: [193, 113, 53], name: 'Patina' },
    ],
    iron: [
      { hex: '#434343', rgb: [67, 67, 67], name: 'Charcoal' },
      { hex: '#71797E', rgb: [113, 121, 126], name: 'Gunmetal' },
      { hex: '#848482', rgb: [132, 132, 130], name: 'Battleship Grey' },
      { hex: '#36454F', rgb: [54, 69, 79], name: 'Charcoal Blue' },
    ],
    gold: [
      { hex: '#FFD700', rgb: [255, 215, 0], name: 'Gold' },
      { hex: '#FFC125', rgb: [255, 193, 37], name: 'Goldenrod' },
      { hex: '#DAA520', rgb: [218, 165, 32], name: 'Goldenrod Yellow' },
      { hex: '#F0E68C', rgb: [240, 230, 140], name: 'Khaki' },
    ],
  },
  victorian: {
    browns: [
      { hex: '#654321', rgb: [101, 67, 33], name: 'Dark Brown' },
      { hex: '#3B2F2F', rgb: [59, 47, 47], name: 'Dark Coffee' },
      { hex: '#8B4513', rgb: [139, 69, 19], name: 'Saddle Brown' },
      { hex: '#704214', rgb: [112, 66, 20], name: 'Sepia' },
    ],
    burgundy: [
      { hex: '#800020', rgb: [128, 0, 32], name: 'Burgundy' },
      { hex: '#722F37', rgb: [114, 47, 55], name: 'Wine' },
      { hex: '#8B0000', rgb: [139, 0, 0], name: 'Dark Red' },
      { hex: '#660000', rgb: [102, 0, 0], name: 'Blood Red' },
    ],
    greens: [
      { hex: '#228B22', rgb: [34, 139, 34], name: 'Forest Green' },
      { hex: '#355E3B', rgb: [53, 94, 59], name: 'Hunter Green' },
      { hex: '#2F4F2F', rgb: [47, 79, 47], name: 'Dark Green' },
      { hex: '#013220', rgb: [1, 50, 32], name: 'Dark Green' },
    ],
    blues: [
      { hex: '#191970', rgb: [25, 25, 112], name: 'Midnight Blue' },
      { hex: '#002FA7', rgb: [0, 47, 167], name: 'Royal Blue' },
      { hex: '#1C1C3D', rgb: [28, 28, 61], name: 'Dark Navy' },
      { hex: '#2C3E50', rgb: [44, 62, 80], name: 'Wet Asphalt' },
    ],
  },
  atmospheric: {
    steam: [
      { hex: '#F5F5F5', rgb: [245, 245, 245], name: 'White Smoke' },
      { hex: '#FFFAFA', rgb: [255, 250, 250], name: 'Snow' },
      { hex: '#F0F8FF', rgb: [240, 248, 255], name: 'Alice Blue' },
      { hex: '#E6E6FA', rgb: [230, 230, 250], name: 'Lavender' },
    ],
    soot: [
      { hex: '#1C1C1C', rgb: [28, 28, 28], name: 'Eerie Black' },
      { hex: '#2F2F2F', rgb: [47, 47, 47], name: 'Jet' },
      { hex: '#36454F', rgb: [54, 69, 79], name: 'Charcoal' },
      { hex: '#333333', rgb: [51, 51, 51], name: 'Dark Charcoal' },
    ],
    oil: [
      { hex: '#3B3131', rgb: [59, 49, 49], name: 'Black Coffee' },
      { hex: '#4B3621', rgb: [75, 54, 33], name: 'Cafe Noir' },
      { hex: '#463E3F', rgb: [70, 62, 63], name: 'Black Olive' },
      { hex: '#3D2B1F', rgb: [61, 43, 31], name: 'Bistre' },
    ],
    rust: [
      { hex: '#B7410E', rgb: [183, 65, 14], name: 'Rust' },
      { hex: '#CC5500', rgb: [204, 85, 0], name: 'Burnt Orange' },
      { hex: '#CD5C5C', rgb: [205, 92, 92], name: 'Indian Red' },
      { hex: '#A0522D', rgb: [160, 82, 45], name: 'Sienna' },
    ],
  },
  gradients: {
    sky: ['#708090', '#B0C4DE', '#FFB347', '#CD853F'],
    track: ['#696969', '#808080', '#A9A9A9', '#C0C0C0'],
    brass: ['#8B6914', '#CD7F32', '#FFD700', '#CD7F32', '#8B6914'],
    copper: ['#B87333', '#DA8A67', '#CB6D51', '#DA8A67', '#B87333'],
  },
};

// Helper functions
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * factor);
  const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * factor);
  const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * factor);
  
  return rgbToHex(r, g, b);
}

export function createGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  const step = 1 / (colors.length - 1);
  
  colors.forEach((color, index) => {
    gradient.addColorStop(index * step, color);
  });
  
  return gradient;
}