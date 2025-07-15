export class VehicleSpriteGenerator {
  static generateSteamPunkCar(scale: number = 1): HTMLCanvasElement {
    const width = 64 * scale;
    const height = 48 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.scale(scale, scale);

    // REAR VIEW OF STEAMPUNK CAR

    // Main body - brass colored with perspective
    const bodyGradient = ctx.createLinearGradient(0, 0, 64, 0);
    bodyGradient.addColorStop(0, '#8b6914');
    bodyGradient.addColorStop(0.5, '#cd7f32');
    bodyGradient.addColorStop(1, '#8b6914');

    // Car body - rear view
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(8, 20); // bottom left
    ctx.lineTo(56, 20); // bottom right
    ctx.lineTo(52, 8); // top right
    ctx.lineTo(12, 8); // top left
    ctx.closePath();
    ctx.fill();

    // Dark metallic outline
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rear window
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.moveTo(16, 10);
    ctx.lineTo(48, 10);
    ctx.lineTo(46, 15);
    ctx.lineTo(18, 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Exhaust pipes
    const pipeY = 28;
    const pipePositions = [20, 28, 36, 44];

    pipePositions.forEach((pipeX) => {
      // Pipe
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.arc(pipeX, pipeY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Inner pipe
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(pipeX, pipeY, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Steam/smoke effect from pipes
    ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
    pipePositions.forEach((pipeX, i) => {
      ctx.beginPath();
      ctx.arc(pipeX, pipeY + 6 + i * 2, 4 + i, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rear wheels (visible from behind)
    ctx.fillStyle = '#333';
    ctx.fillRect(4, 18, 8, 12); // left wheel
    ctx.fillRect(52, 18, 8, 12); // right wheel

    // Wheel treads
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(6, 20 + i * 3);
      ctx.lineTo(10, 20 + i * 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(54, 20 + i * 3);
      ctx.lineTo(58, 20 + i * 3);
      ctx.stroke();
    }

    // Rear bumper
    ctx.fillStyle = '#654321';
    ctx.fillRect(10, 22, 44, 4);

    // License plate area
    ctx.fillStyle = '#daa520';
    ctx.fillRect(24, 23, 16, 3);

    // Rear lights
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(14, 18, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(50, 18, 2, 0, Math.PI * 2);
    ctx.fill();

    // Decorative brass details
    ctx.fillStyle = '#cd7f32';
    ctx.fillRect(16, 17, 4, 2);
    ctx.fillRect(44, 17, 4, 2);

    // Rivets on rear
    ctx.fillStyle = '#ffd700';
    const rivetY = 12;
    for (let x = 20; x < 45; x += 8) {
      ctx.beginPath();
      ctx.arc(x, rivetY, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    return canvas;
  }

  static generateTopDownView(scale: number = 1): HTMLCanvasElement {
    const width = 40 * scale;
    const height = 60 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.save();
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(20, 32, 18, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    const bodyGradient = ctx.createLinearGradient(0, 0, 40, 0);
    bodyGradient.addColorStop(0, '#8b6914');
    bodyGradient.addColorStop(0.5, '#cd7f32');
    bodyGradient.addColorStop(1, '#8b6914');

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(20, 5); // front point
    ctx.lineTo(35, 20); // front right
    ctx.lineTo(35, 40); // rear right
    ctx.lineTo(30, 55); // rear right corner
    ctx.lineTo(10, 55); // rear left corner
    ctx.lineTo(5, 40); // rear left
    ctx.lineTo(5, 20); // front left
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = 'rgba(135, 206, 235, 0.9)';
    ctx.beginPath();
    ctx.moveTo(20, 15);
    ctx.lineTo(25, 20);
    ctx.lineTo(25, 30);
    ctx.lineTo(20, 32);
    ctx.lineTo(15, 30);
    ctx.lineTo(15, 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Engine pipes on sides
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Left pipes
    ctx.beginPath();
    ctx.moveTo(8, 35);
    ctx.lineTo(8, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 35);
    ctx.lineTo(12, 50);
    ctx.stroke();

    // Right pipes
    ctx.beginPath();
    ctx.moveTo(28, 35);
    ctx.lineTo(28, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(32, 35);
    ctx.lineTo(32, 50);
    ctx.stroke();

    // Front decoration
    ctx.fillStyle = '#cd7f32';
    ctx.beginPath();
    ctx.arc(20, 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Rivets
    ctx.fillStyle = '#ffd700';
    const rivetPositions = [
      [10, 25],
      [30, 25],
      [10, 45],
      [30, 45],
      [20, 38],
    ];

    rivetPositions.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    return canvas;
  }
}
