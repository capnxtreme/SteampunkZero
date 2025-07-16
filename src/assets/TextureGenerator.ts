import { STEAMPUNK_PALETTE, createGradient } from '../config/steampunkPalette';

export class TextureGenerator {
  static generateCobblestoneTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Use steampunk track gradient colors
    const baseColor = STEAMPUNK_PALETTE.gradients.track[0];
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Add cobblestone pattern with brass inlays
    const stoneSize = 32;
    for (let y = 0; y < height; y += stoneSize) {
      for (let x = 0; x < width; x += stoneSize) {
        // Offset every other row
        const offset = (y / stoneSize) % 2 === 0 ? 0 : stoneSize / 2;
        const stoneX = x + offset;

        // Random variation in color from steampunk palette
        const colorIndex = Math.floor(Math.random() * STEAMPUNK_PALETTE.gradients.track.length);
        ctx.fillStyle = STEAMPUNK_PALETTE.gradients.track[colorIndex];

        // Draw stone with rounded corners
        ctx.beginPath();
        ctx.roundRect(
          stoneX - stoneSize * 0.45,
          y - stoneSize * 0.45,
          stoneSize * 0.9,
          stoneSize * 0.9,
          4
        );
        ctx.fill();

        // Add darker gaps between stones
        ctx.strokeStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Occasionally add brass strips
        if (Math.random() < 0.1) {
          ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Add steam vents
    for (let i = 0; i < 5; i++) {
      const ventX = Math.random() * width;
      const ventY = Math.random() * height;
      
      ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[2].hex;
      ctx.beginPath();
      ctx.arc(ventX, ventY, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[3].hex;
      ctx.beginPath();
      ctx.arc(ventX, ventY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add some noise/texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 20;
      data[i] += noise; // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas;
  }

  static generateBrassTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Brass gradient using steampunk palette
    const gradient = createGradient(
      ctx,
      STEAMPUNK_PALETTE.gradients.brass,
      0, 0, width, height
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add metallic sheen
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 20 + Math.random() * 40;

      const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radialGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
      radialGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = radialGradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    // Add patina and weathering
    ctx.fillStyle = 'rgba(46, 125, 50, 0.1)';
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 30;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add scratches and wear
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    return canvas;
  }

  static generateCopperTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Copper gradient
    const gradient = createGradient(
      ctx,
      STEAMPUNK_PALETTE.gradients.copper,
      0, 0, width, height
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add verdigris (green patina)
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 15 + Math.random() * 35;

      const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radialGradient.addColorStop(0, 'rgba(46, 125, 50, 0.4)');
      radialGradient.addColorStop(0.5, 'rgba(76, 175, 80, 0.2)');
      radialGradient.addColorStop(1, 'rgba(46, 125, 50, 0)');
      ctx.fillStyle = radialGradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    return canvas;
  }

  static generateRustTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base rust color
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.rust[0].hex;
    ctx.fillRect(0, 0, width, height);

    // Add rust variations
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 5 + Math.random() * 25;
      const rustColor = STEAMPUNK_PALETTE.atmospheric.rust[
        Math.floor(Math.random() * STEAMPUNK_PALETTE.atmospheric.rust.length)
      ];

      const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radialGradient.addColorStop(0, rustColor.hex);
      radialGradient.addColorStop(1, 'rgba(183, 65, 14, 0)');
      ctx.fillStyle = radialGradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    // Add dark spots
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 2 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  static generateOilStainTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Clear with transparency
    ctx.clearRect(0, 0, width, height);

    // Add oil stains
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 20 + Math.random() * 60;
      const oilColor = STEAMPUNK_PALETTE.atmospheric.oil[
        Math.floor(Math.random() * STEAMPUNK_PALETTE.atmospheric.oil.length)
      ];

      const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radialGradient.addColorStop(0, oilColor.hex + 'CC');
      radialGradient.addColorStop(0.5, oilColor.hex + '99');
      radialGradient.addColorStop(1, oilColor.hex + '00');
      
      ctx.fillStyle = radialGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add rainbow sheen effect
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 15 + Math.random() * 30;

      const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radialGradient.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
      radialGradient.addColorStop(0.3, 'rgba(255, 255, 0, 0.1)');
      radialGradient.addColorStop(0.6, 'rgba(0, 255, 0, 0.1)');
      radialGradient.addColorStop(0.8, 'rgba(0, 0, 255, 0.1)');
      radialGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
      
      ctx.fillStyle = radialGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  static generateGrassTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base grass color from steampunk palette
    ctx.fillStyle = STEAMPUNK_PALETTE.victorian.greens[2].hex;
    ctx.fillRect(0, 0, width, height);

    // Add darker patches
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 10 + Math.random() * 30;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, STEAMPUNK_PALETTE.victorian.greens[3].hex + '99');
      gradient.addColorStop(1, STEAMPUNK_PALETTE.victorian.greens[3].hex + '00');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    // Add grass blades
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = 5 + Math.random() * 10;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;

      const greenVariant = STEAMPUNK_PALETTE.victorian.greens[
        Math.floor(Math.random() * STEAMPUNK_PALETTE.victorian.greens.length)
      ];
      ctx.strokeStyle = greenVariant.hex + '99';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Add some dirt patches with steampunk browns
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 10 + Math.random() * 20;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, STEAMPUNK_PALETTE.victorian.browns[2].hex + '66');
      gradient.addColorStop(1, STEAMPUNK_PALETTE.victorian.browns[2].hex + '00');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    return canvas;
  }

  static generateSteampunkBorder(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw brass pipes using palette
    const brassGradient = createGradient(
      ctx,
      STEAMPUNK_PALETTE.gradients.brass,
      0, 0, width, height
    );
    ctx.fillStyle = brassGradient;
    ctx.fillRect(0, 0, width, height);

    // Add rivets
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.iron[0].hex;
    const rivetSpacing = 20;
    for (let x = rivetSpacing / 2; x < width; x += rivetSpacing) {
      for (let y = rivetSpacing / 2; y < height; y += rivetSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[0].hex;
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = STEAMPUNK_PALETTE.metallic.iron[0].hex;
      }
    }

    // Add pipe details
    ctx.strokeStyle = STEAMPUNK_PALETTE.victorian.browns[0].hex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (2 * height) / 3);
    ctx.lineTo(width, (2 * height) / 3);
    ctx.stroke();

    return canvas;
  }

  static generateGearTexture(
    size: number,
    toothCount: number = 12
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.45;
    const innerRadius = size * 0.35;
    const holeRadius = size * 0.15;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw gear teeth
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
    ctx.beginPath();
    
    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const nextAngle = ((i + 1) / toothCount) * Math.PI * 2;
      const toothWidth = Math.PI / toothCount * 0.6;
      
      // Outer edge of tooth
      ctx.arc(centerX, centerY, outerRadius, angle - toothWidth / 2, angle + toothWidth / 2);
      
      // Connect to inner circle
      ctx.lineTo(
        centerX + Math.cos(angle + toothWidth / 2) * innerRadius,
        centerY + Math.sin(angle + toothWidth / 2) * innerRadius
      );
      
      // Inner edge
      ctx.arc(centerX, centerY, innerRadius, angle + toothWidth / 2, nextAngle - toothWidth / 2);
      
      // Connect to next tooth
      ctx.lineTo(
        centerX + Math.cos(nextAngle - toothWidth / 2) * outerRadius,
        centerY + Math.sin(nextAngle - toothWidth / 2) * outerRadius
      );
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Draw center hole
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    
    // Add shading
    const gradient = ctx.createRadialGradient(
      centerX - size * 0.1,
      centerY - size * 0.1,
      0,
      centerX,
      centerY,
      outerRadius
    );
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return canvas;
  }
}
