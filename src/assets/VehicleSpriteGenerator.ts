import { STEAMPUNK_PALETTE, createGradient } from '../config/steampunkPalette';

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

    // Main body - brass colored with perspective using palette
    const bodyGradient = createGradient(
      ctx,
      [
        STEAMPUNK_PALETTE.metallic.brass[0].hex,
        STEAMPUNK_PALETTE.metallic.brass[1].hex,
        STEAMPUNK_PALETTE.metallic.brass[2].hex,
        STEAMPUNK_PALETTE.metallic.brass[1].hex,
        STEAMPUNK_PALETTE.metallic.brass[0].hex,
      ],
      0, 0, 64, 0
    );

    // Car body - rear view with Victorian curves
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(8, 20); // bottom left
    ctx.quadraticCurveTo(6, 14, 12, 8); // curved left side
    ctx.lineTo(52, 8); // top
    ctx.quadraticCurveTo(58, 14, 56, 20); // curved right side
    ctx.lineTo(8, 20); // bottom
    ctx.closePath();
    ctx.fill();

    // Dark metallic outline
    ctx.strokeStyle = STEAMPUNK_PALETTE.victorian.browns[0].hex;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rear window with brass frame
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.moveTo(16, 10);
    ctx.lineTo(48, 10);
    ctx.lineTo(46, 15);
    ctx.lineTo(18, 15);
    ctx.closePath();
    ctx.fill();
    
    // Window frame
    ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.brass[3].hex;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ornate exhaust pipes with copper
    const pipeY = 28;
    const pipePositions = [18, 26, 38, 46];

    pipePositions.forEach((pipeX, i) => {
      // Outer pipe - copper
      const copperGradient = ctx.createRadialGradient(pipeX, pipeY, 0, pipeX, pipeY, 4);
      copperGradient.addColorStop(0, STEAMPUNK_PALETTE.metallic.copper[1].hex);
      copperGradient.addColorStop(1, STEAMPUNK_PALETTE.metallic.copper[0].hex);
      ctx.fillStyle = copperGradient;
      ctx.beginPath();
      ctx.arc(pipeX, pipeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Inner pipe
      ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[1].hex;
      ctx.beginPath();
      ctx.arc(pipeX, pipeY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Decorative rings
      ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.gold[2].hex;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(pipeX, pipeY, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Steam/smoke effect from pipes with proper colors
    pipePositions.forEach((pipeX, i) => {
      const steamGradient = ctx.createRadialGradient(
        pipeX, pipeY + 6 + i * 2, 0,
        pipeX, pipeY + 6 + i * 2, 4 + i
      );
      steamGradient.addColorStop(0, STEAMPUNK_PALETTE.atmospheric.steam[0].hex + 'CC');
      steamGradient.addColorStop(1, STEAMPUNK_PALETTE.atmospheric.steam[0].hex + '00');
      ctx.fillStyle = steamGradient;
      ctx.beginPath();
      ctx.arc(pipeX, pipeY + 6 + i * 2, 4 + i, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rear wheels with brass hubcaps
    // Left wheel
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[2].hex;
    ctx.fillRect(4, 18, 8, 12);
    // Brass hubcap
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
    ctx.beginPath();
    ctx.arc(8, 24, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Right wheel
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[2].hex;
    ctx.fillRect(52, 18, 8, 12);
    // Brass hubcap
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
    ctx.beginPath();
    ctx.arc(56, 24, 2, 0, Math.PI * 2);
    ctx.fill();

    // Wheel treads
    ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.iron[1].hex;
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

    // Rear bumper with leather texture
    const bumperGradient = ctx.createLinearGradient(10, 22, 10, 26);
    bumperGradient.addColorStop(0, STEAMPUNK_PALETTE.victorian.browns[1].hex);
    bumperGradient.addColorStop(1, STEAMPUNK_PALETTE.victorian.browns[0].hex);
    ctx.fillStyle = bumperGradient;
    ctx.fillRect(10, 22, 44, 4);

    // License plate area - brass nameplate
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
    ctx.fillRect(24, 23, 16, 3);
    ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.brass[3].hex;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(24, 23, 16, 3);

    // Rear lights - Victorian style
    const lightColors = [
      STEAMPUNK_PALETTE.victorian.burgundy[0].hex,
      STEAMPUNK_PALETTE.victorian.burgundy[0].hex
    ];
    [14, 50].forEach((x, i) => {
      // Outer ring
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
      ctx.beginPath();
      ctx.arc(x, 18, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner light
      ctx.fillStyle = lightColors[i];
      ctx.beginPath();
      ctx.arc(x, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(x - 0.5, 17.5, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Decorative brass details - gears
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
    [20, 44].forEach(x => {
      ctx.save();
      ctx.translate(x, 17);
      // Small gear
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.fillRect(-0.5, -3, 1, 6);
      }
      ctx.restore();
      
      ctx.beginPath();
      ctx.arc(x, 17, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.brass[3].hex;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Rivets on rear - decorative pattern
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[0].hex;
    const rivetY = 12;
    for (let x = 20; x < 45; x += 8) {
      ctx.beginPath();
      ctx.arc(x, rivetY, 1, 0, Math.PI * 2);
      ctx.fill();
      
      // Rivet shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + 0.5, rivetY + 0.5, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[0].hex;
    }

    // Additional ornamental details
    // Side vents
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[3].hex;
    ctx.fillRect(10, 14, 2, 4);
    ctx.fillRect(52, 14, 2, 4);

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

    // Main body with steampunk curves
    const bodyGradient = createGradient(
      ctx,
      STEAMPUNK_PALETTE.gradients.brass,
      0, 0, 40, 0
    );

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(20, 5); // front point
    ctx.bezierCurveTo(28, 8, 35, 15, 35, 20); // front right curve
    ctx.lineTo(35, 40); // rear right
    ctx.quadraticCurveTo(35, 50, 30, 55); // rear right corner
    ctx.lineTo(10, 55); // rear
    ctx.quadraticCurveTo(5, 50, 5, 40); // rear left corner
    ctx.lineTo(5, 20); // front left
    ctx.bezierCurveTo(5, 15, 12, 8, 20, 5); // front left curve
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = STEAMPUNK_PALETTE.victorian.browns[0].hex;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cockpit with glass canopy
    const cockpitGradient = ctx.createRadialGradient(20, 22, 0, 20, 22, 10);
    cockpitGradient.addColorStop(0, 'rgba(135, 206, 235, 0.9)');
    cockpitGradient.addColorStop(0.7, 'rgba(135, 206, 235, 0.7)');
    cockpitGradient.addColorStop(1, 'rgba(70, 130, 180, 0.9)');
    
    ctx.fillStyle = cockpitGradient;
    ctx.beginPath();
    ctx.moveTo(20, 15);
    ctx.quadraticCurveTo(25, 18, 25, 22);
    ctx.lineTo(25, 30);
    ctx.quadraticCurveTo(25, 32, 20, 32);
    ctx.quadraticCurveTo(15, 32, 15, 30);
    ctx.lineTo(15, 22);
    ctx.quadraticCurveTo(15, 18, 20, 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Engine details - exposed pistons
    // Left side
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.iron[1].hex;
    ctx.fillRect(7, 25, 3, 15);
    ctx.fillRect(11, 28, 2, 10);
    
    // Right side
    ctx.fillRect(30, 25, 3, 15);
    ctx.fillRect(27, 28, 2, 10);

    // Copper pipes
    ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.copper[0].hex;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Left pipes
    ctx.beginPath();
    ctx.moveTo(8, 35);
    ctx.quadraticCurveTo(6, 45, 8, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 35);
    ctx.quadraticCurveTo(10, 45, 12, 50);
    ctx.stroke();

    // Right pipes
    ctx.beginPath();
    ctx.moveTo(28, 35);
    ctx.quadraticCurveTo(30, 45, 28, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(32, 35);
    ctx.quadraticCurveTo(34, 45, 32, 50);
    ctx.stroke();

    // Front ornament - brass eagle/gear combo
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
    ctx.beginPath();
    ctx.arc(20, 10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Gear teeth
    ctx.save();
    ctx.translate(20, 10);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-0.5, -4, 1, 8);
    }
    ctx.restore();

    // Decorative rivets in Victorian pattern
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[0].hex;
    const rivetPositions = [
      [10, 25], [30, 25],
      [10, 45], [30, 45],
      [20, 38],
      [15, 35], [25, 35],
      [15, 41], [25, 41],
    ];

    rivetPositions.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[3].hex;
      ctx.beginPath();
      ctx.arc(x - 0.5, y - 0.5, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[0].hex;
    });

    // Side mounted weapons/tools
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.iron[0].hex;
    ctx.fillRect(3, 30, 2, 8);
    ctx.fillRect(35, 30, 2, 8);

    // Rear propeller/fan
    ctx.save();
    ctx.translate(20, 50);
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.copper[1].hex;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(3, -2, 5, 0);
      ctx.quadraticCurveTo(3, 2, 0, 0);
      ctx.fill();
    }
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    return canvas;
  }

  static generateMechanicalParts(size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Generate various mechanical parts
    const partSize = size / 4;
    
    // Gear 1
    ctx.save();
    ctx.translate(partSize / 2, partSize / 2);
    this.drawGear(ctx, partSize * 0.4, 8, STEAMPUNK_PALETTE.metallic.brass[1].hex);
    ctx.restore();

    // Gear 2
    ctx.save();
    ctx.translate(partSize * 2.5, partSize / 2);
    this.drawGear(ctx, partSize * 0.3, 12, STEAMPUNK_PALETTE.metallic.copper[0].hex);
    ctx.restore();

    // Spring
    ctx.save();
    ctx.translate(partSize / 2, partSize * 2.5);
    this.drawSpring(ctx, partSize * 0.8, STEAMPUNK_PALETTE.metallic.iron[1].hex);
    ctx.restore();

    // Bolt
    ctx.save();
    ctx.translate(partSize * 2.5, partSize * 2.5);
    this.drawBolt(ctx, partSize * 0.6, STEAMPUNK_PALETTE.metallic.iron[2].hex);
    ctx.restore();

    return canvas;
  }

  private static drawGear(ctx: CanvasRenderingContext2D, radius: number, teeth: number, color: string): void {
    const innerRadius = radius * 0.7;
    const toothHeight = radius * 0.2;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const nextAngle = ((i + 1) / teeth) * Math.PI * 2;
      const toothWidth = (Math.PI * 2 / teeth) * 0.4;
      
      // Tooth
      ctx.arc(0, 0, radius, angle - toothWidth / 2, angle + toothWidth / 2);
      ctx.lineTo(
        Math.cos(angle + toothWidth / 2) * innerRadius,
        Math.sin(angle + toothWidth / 2) * innerRadius
      );
      ctx.arc(0, 0, innerRadius, angle + toothWidth / 2, nextAngle - toothWidth / 2);
      ctx.lineTo(
        Math.cos(nextAngle - toothWidth / 2) * radius,
        Math.sin(nextAngle - toothWidth / 2) * radius
      );
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Center hole
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  private static drawSpring(ctx: CanvasRenderingContext2D, length: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const coils = 6;
    const coilHeight = length / coils;
    const coilWidth = length * 0.3;
    
    ctx.moveTo(0, -length / 2);
    for (let i = 0; i < coils; i++) {
      const y = -length / 2 + i * coilHeight;
      ctx.quadraticCurveTo(coilWidth, y + coilHeight / 2, 0, y + coilHeight);
      ctx.quadraticCurveTo(-coilWidth, y + coilHeight * 1.5, 0, y + coilHeight * 2);
    }
    
    ctx.stroke();
  }

  private static drawBolt(ctx: CanvasRenderingContext2D, size: number, color: string): void {
    // Bolt head
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * size * 0.3;
      const y = Math.sin(angle) * size * 0.3;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Shaft
    ctx.fillRect(-size * 0.1, size * 0.3, size * 0.2, size * 0.4);
  }
}
