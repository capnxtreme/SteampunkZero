import { STEAMPUNK_PALETTE, createGradient } from '../config/steampunkPalette';

export interface HUDConfig {
  speed: number;
  maxSpeed: number;
  boost: number;
  maxBoost: number;
  position: number;
  lap: number;
  totalLaps: number;
  time: number;
}

export class SteampunkHUD {
  private speedGaugeCanvas: HTMLCanvasElement;
  private boostGaugeCanvas: HTMLCanvasElement;
  private positionDisplayCanvas: HTMLCanvasElement;
  private decorativeElementsCanvas: HTMLCanvasElement;
  private config: HUDConfig;
  private animationTime: number = 0;
  
  constructor(width: number, height: number) {
    // Pre-render static elements
    this.speedGaugeCanvas = this.createSpeedGauge(200, 200);
    this.boostGaugeCanvas = this.createBoostGauge(150, 150);
    this.positionDisplayCanvas = this.createPositionDisplay(200, 100);
    this.decorativeElementsCanvas = this.createDecorativeElements(width, height);
    
    this.config = {
      speed: 0,
      maxSpeed: 300,
      boost: 0,
      maxBoost: 100,
      position: 1,
      lap: 1,
      totalLaps: 3,
      time: 0,
    };
  }
  
  private createSpeedGauge(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    // Outer ring - brass
    const outerGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.9,
      centerX, centerY, radius
    );
    outerGradient.addColorStop(0, STEAMPUNK_PALETTE.metallic.brass[2].hex);
    outerGradient.addColorStop(0.5, STEAMPUNK_PALETTE.metallic.brass[1].hex);
    outerGradient.addColorStop(1, STEAMPUNK_PALETTE.metallic.brass[3].hex);
    
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner face
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.steam[0].hex;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    // Glass effect
    const glassGradient = ctx.createRadialGradient(
      centerX - radius * 0.3, centerY - radius * 0.3, 0,
      centerX, centerY, radius
    );
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    glassGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    
    ctx.fillStyle = glassGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    // Tick marks and numbers
    ctx.strokeStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 300; i += 30) {
      const angle = (i / 300) * Math.PI * 1.5 + Math.PI * 0.75;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Major tick
      if (i % 60 === 0) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(
          centerX + cos * radius * 0.7,
          centerY + sin * radius * 0.7
        );
        ctx.lineTo(
          centerX + cos * radius * 0.85,
          centerY + sin * radius * 0.85
        );
        ctx.stroke();
        
        // Number
        ctx.fillText(
          i.toString(),
          centerX + cos * radius * 0.6,
          centerY + sin * radius * 0.6
        );
      } else {
        // Minor tick
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
          centerX + cos * radius * 0.75,
          centerY + sin * radius * 0.75
        );
        ctx.lineTo(
          centerX + cos * radius * 0.85,
          centerY + sin * radius * 0.85
        );
        ctx.stroke();
      }
    }
    
    // Center cap
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Decorative screws
    const screwPositions = [
      { x: centerX - radius * 0.7, y: centerY - radius * 0.7 },
      { x: centerX + radius * 0.7, y: centerY - radius * 0.7 },
      { x: centerX - radius * 0.7, y: centerY + radius * 0.7 },
      { x: centerX + radius * 0.7, y: centerY + radius * 0.7 },
    ];
    
    screwPositions.forEach(pos => {
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.iron[1].hex;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Screw slot
      ctx.strokeStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pos.x - 3, pos.y);
      ctx.lineTo(pos.x + 3, pos.y);
      ctx.stroke();
    });
    
    // Label
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
    ctx.font = '12px serif';
    ctx.fillText('VELOCITY', centerX, centerY + radius * 0.5);
    ctx.fillText('KM/H', centerX, centerY + radius * 0.65);
    
    return canvas;
  }
  
  private createBoostGauge(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    // Copper outer ring
    const outerGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.9,
      centerX, centerY, radius
    );
    outerGradient.addColorStop(0, STEAMPUNK_PALETTE.metallic.copper[1].hex);
    outerGradient.addColorStop(0.5, STEAMPUNK_PALETTE.metallic.copper[0].hex);
    outerGradient.addColorStop(1, STEAMPUNK_PALETTE.metallic.copper[2].hex);
    
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner face
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    // Pressure zones
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.85, Math.PI * 0.75, Math.PI * 1.5);
    ctx.strokeStyle = STEAMPUNK_PALETTE.victorian.greens[1].hex;
    ctx.lineWidth = 15;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.85, Math.PI * 1.5, Math.PI * 2);
    ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.gold[2].hex;
    ctx.lineWidth = 15;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.85, Math.PI * 2, Math.PI * 2.25);
    ctx.strokeStyle = STEAMPUNK_PALETTE.victorian.burgundy[0].hex;
    ctx.lineWidth = 15;
    ctx.stroke();
    
    // Tick marks
    ctx.strokeStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
    ctx.font = 'bold 12px serif';
    
    for (let i = 0; i <= 100; i += 20) {
      const angle = (i / 100) * Math.PI * 1.5 + Math.PI * 0.75;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        centerX + cos * radius * 0.65,
        centerY + sin * radius * 0.65
      );
      ctx.lineTo(
        centerX + cos * radius * 0.75,
        centerY + sin * radius * 0.75
      );
      ctx.stroke();
    }
    
    // Center with gear detail
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Gear teeth
    ctx.save();
    ctx.translate(centerX, centerY);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-2, -radius * 0.15, 4, radius * 0.3);
    }
    ctx.restore();
    
    // Label
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
    ctx.font = '10px serif';
    ctx.textAlign = 'center';
    ctx.fillText('STEAM', centerX, centerY + radius * 0.4);
    ctx.fillText('PRESSURE', centerX, centerY + radius * 0.55);
    
    return canvas;
  }
  
  private createPositionDisplay(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Brass frame
    const frameGradient = createGradient(
      ctx,
      STEAMPUNK_PALETTE.gradients.brass,
      0, 0, width, 0
    );
    ctx.fillStyle = frameGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Inner display area
    ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[3].hex;
    ctx.fillRect(10, 10, width - 20, height - 20);
    
    // Decorative corners
    const cornerSize = 20;
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.lineTo(0, cornerSize);
    ctx.fill();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - cornerSize, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, cornerSize);
    ctx.lineTo(width - cornerSize, 0);
    ctx.fill();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(0, height - cornerSize);
    ctx.lineTo(0, height);
    ctx.lineTo(cornerSize, height);
    ctx.lineTo(0, height - cornerSize);
    ctx.fill();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - cornerSize, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height - cornerSize);
    ctx.lineTo(width - cornerSize, height);
    ctx.fill();
    
    // Rivets
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[0].hex;
    const rivetPositions = [
      { x: 5, y: 5 },
      { x: width - 5, y: 5 },
      { x: 5, y: height - 5 },
      { x: width - 5, y: height - 5 },
    ];
    
    rivetPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    return canvas;
  }
  
  private createDecorativeElements(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Top decorative bar
    const barHeight = 40;
    const barGradient = createGradient(
      ctx,
      [
        STEAMPUNK_PALETTE.metallic.brass[3].hex,
        STEAMPUNK_PALETTE.metallic.brass[1].hex,
        STEAMPUNK_PALETTE.metallic.brass[3].hex,
      ],
      0, 0, width, 0
    );
    
    ctx.fillStyle = barGradient;
    ctx.fillRect(0, 0, width, barHeight);
    
    // Gear pattern
    for (let x = 20; x < width; x += 60) {
      ctx.save();
      ctx.translate(x, barHeight / 2);
      
      // Gear
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.copper[0].hex;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillRect(-2, -15, 4, 30);
      }
      ctx.restore();
      
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.copper[1].hex;
      ctx.beginPath();
      ctx.arc(x, barHeight / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[3].hex;
      ctx.beginPath();
      ctx.arc(x, barHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Pipe detail at bottom
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.copper[0].hex;
    ctx.fillRect(0, height - 20, width, 20);
    
    // Pipe segments
    for (let x = 0; x < width; x += 40) {
      ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, height - 20);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    return canvas;
  }
  
  update(config: Partial<HUDConfig>): void {
    this.config = { ...this.config, ...config };
    this.animationTime += 1/60; // Assume 60fps
  }
  
  render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    // Decorative elements
    ctx.drawImage(this.decorativeElementsCanvas, 0, 0, canvasWidth, 40);
    ctx.drawImage(
      this.decorativeElementsCanvas,
      0, canvasHeight - 20,
      canvasWidth, 20,
      0, canvasHeight - 20,
      canvasWidth, 20
    );
    
    // Speed gauge
    ctx.save();
    ctx.translate(canvasWidth - 120, canvasHeight - 120);
    ctx.drawImage(this.speedGaugeCanvas, -100, -100, 200, 200);
    
    // Speed needle
    const speedAngle = (this.config.speed / this.config.maxSpeed) * Math.PI * 1.5 + Math.PI * 0.75;
    ctx.strokeStyle = STEAMPUNK_PALETTE.victorian.burgundy[0].hex;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(speedAngle) * 70, Math.sin(speedAngle) * 70);
    ctx.stroke();
    
    // Needle cap
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[0].hex;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Boost gauge
    ctx.save();
    ctx.translate(120, canvasHeight - 100);
    ctx.drawImage(this.boostGaugeCanvas, -75, -75, 150, 150);
    
    // Boost needle
    const boostAngle = (this.config.boost / this.config.maxBoost) * Math.PI * 1.5 + Math.PI * 0.75;
    ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.copper[2].hex;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(boostAngle) * 50, Math.sin(boostAngle) * 50);
    ctx.stroke();
    
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.copper[0].hex;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Position display
    ctx.save();
    ctx.translate(canvasWidth / 2 - 100, 50);
    ctx.drawImage(this.positionDisplayCanvas, 0, 0);
    
    // Position text
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.gold[0].hex;
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.position.toString(), 50, 50);
    
    // Lap info
    ctx.font = '20px serif';
    ctx.fillText(`LAP ${this.config.lap}/${this.config.totalLaps}`, 150, 50);
    ctx.restore();
    
    // Time display
    ctx.save();
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    const minutes = Math.floor(this.config.time / 60);
    const seconds = Math.floor(this.config.time % 60);
    const milliseconds = Math.floor((this.config.time % 1) * 100);
    ctx.fillText(
      `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`,
      canvasWidth / 2,
      120
    );
    ctx.restore();
  }
}