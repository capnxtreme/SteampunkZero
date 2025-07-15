export class TextureGenerator {
  static generateCobblestoneTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base color - dark gray cobblestone
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, width, height);

    // Add cobblestone pattern
    const stoneSize = 32;
    for (let y = 0; y < height; y += stoneSize) {
      for (let x = 0; x < width; x += stoneSize) {
        // Offset every other row
        const offset = (y / stoneSize) % 2 === 0 ? 0 : stoneSize / 2;
        const stoneX = x + offset;

        // Random variation in color
        const brightness = 0.8 + Math.random() * 0.4;
        const gray = Math.floor(58 * brightness);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;

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
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
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

    // Brass gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#b87333');
    gradient.addColorStop(0.5, '#cd7f32');
    gradient.addColorStop(1, '#8b6914');
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

  static generateGrassTexture(
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base grass color
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, width, height);

    // Add grass blades
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = 5 + Math.random() * 10;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;

      ctx.strokeStyle = `rgba(45, ${80 + Math.random() * 40}, 22, 0.6)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    // Add some dirt patches
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 10 + Math.random() * 20;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(101, 67, 33, 0.3)');
      gradient.addColorStop(1, 'rgba(101, 67, 33, 0)');
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

    // Draw brass pipes
    ctx.fillStyle = '#cd7f32';
    ctx.fillRect(0, 0, width, height);

    // Add rivets
    ctx.fillStyle = '#8b6914';
    const rivetSpacing = 20;
    for (let x = rivetSpacing / 2; x < width; x += rivetSpacing) {
      for (let y = rivetSpacing / 2; y < height; y += rivetSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8b6914';
      }
    }

    // Add pipe details
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (2 * height) / 3);
    ctx.lineTo(width, (2 * height) / 3);
    ctx.stroke();

    return canvas;
  }
}
