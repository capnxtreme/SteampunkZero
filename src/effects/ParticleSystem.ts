import { STEAMPUNK_PALETTE, interpolateColor } from '../config/steampunkPalette';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
  rotation?: number;
  rotationSpeed?: number;
  type: ParticleType;
}

export enum ParticleType {
  STEAM = 'steam',
  SMOKE = 'smoke',
  SPARK = 'spark',
  GEAR = 'gear',
  OIL = 'oil',
  DUST = 'dust',
}

export interface ParticleEmitterConfig {
  x: number;
  y: number;
  type: ParticleType;
  rate: number; // particles per second
  lifespan: number; // in seconds
  speed: number;
  spread: number; // angle spread in radians
  direction: number; // base direction in radians
  sizeRange: [number, number];
  gravity?: number;
  wind?: number;
  fadeOut?: boolean;
  continuous?: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private emitters: Map<string, ParticleEmitterConfig> = new Map();
  private gearTexture: HTMLCanvasElement | null = null;
  
  constructor() {
    // Pre-generate gear texture for gear particles
    this.createGearTexture();
  }
  
  private createGearTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    
    // Mini gear
    ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Center hole
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(8, 8, 2, 0, Math.PI * 2);
    ctx.fill();
    
    this.gearTexture = canvas;
  }
  
  addEmitter(id: string, config: ParticleEmitterConfig): void {
    this.emitters.set(id, config);
  }
  
  removeEmitter(id: string): void {
    this.emitters.delete(id);
  }
  
  updateEmitter(id: string, config: Partial<ParticleEmitterConfig>): void {
    const existing = this.emitters.get(id);
    if (existing) {
      this.emitters.set(id, { ...existing, ...config });
    }
  }
  
  emit(config: ParticleEmitterConfig, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this.createParticle(config);
    }
  }
  
  private createParticle(config: ParticleEmitterConfig): void {
    const angle = config.direction + (Math.random() - 0.5) * config.spread;
    const speed = config.speed * (0.5 + Math.random() * 0.5);
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    
    let color: string;
    let opacity: number;
    
    switch (config.type) {
      case ParticleType.STEAM:
        const steamColor = STEAMPUNK_PALETTE.atmospheric.steam[
          Math.floor(Math.random() * STEAMPUNK_PALETTE.atmospheric.steam.length)
        ];
        color = steamColor.hex;
        opacity = 0.6 + Math.random() * 0.3;
        break;
        
      case ParticleType.SMOKE:
        const smokeColor = STEAMPUNK_PALETTE.atmospheric.soot[
          Math.floor(Math.random() * 2)
        ];
        color = smokeColor.hex;
        opacity = 0.4 + Math.random() * 0.3;
        break;
        
      case ParticleType.SPARK:
        const sparkColors = [
          STEAMPUNK_PALETTE.metallic.gold[0].hex,
          '#FFA500',
          '#FF6347',
        ];
        color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
        opacity = 1;
        break;
        
      case ParticleType.GEAR:
        color = STEAMPUNK_PALETTE.metallic.brass[
          Math.floor(Math.random() * STEAMPUNK_PALETTE.metallic.brass.length)
        ].hex;
        opacity = 1;
        break;
        
      case ParticleType.OIL:
        color = STEAMPUNK_PALETTE.atmospheric.oil[
          Math.floor(Math.random() * STEAMPUNK_PALETTE.atmospheric.oil.length)
        ].hex;
        opacity = 0.8;
        break;
        
      default:
        color = '#CCCCCC';
        opacity = 0.5;
    }
    
    const particle: Particle = {
      x: config.x + (Math.random() - 0.5) * 10,
      y: config.y + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: config.lifespan,
      size,
      color,
      opacity,
      rotation: config.type === ParticleType.GEAR ? Math.random() * Math.PI * 2 : 0,
      rotationSpeed: config.type === ParticleType.GEAR ? (Math.random() - 0.5) * 0.2 : 0,
      type: config.type,
    };
    
    this.particles.push(particle);
  }
  
  update(deltaTime: number): void {
    // Update emitters
    this.emitters.forEach((config, id) => {
      if (config.continuous) {
        const particlesToEmit = Math.floor(config.rate * deltaTime);
        if (particlesToEmit > 0) {
          this.emit(config, particlesToEmit);
        }
      }
    });
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Apply gravity
      const emitterConfig = Array.from(this.emitters.values()).find(e => e.type === particle.type);
      if (emitterConfig?.gravity) {
        particle.vy += emitterConfig.gravity * deltaTime;
      }
      
      // Apply wind
      if (emitterConfig?.wind) {
        particle.vx += emitterConfig.wind * deltaTime;
      }
      
      // Update rotation
      if (particle.rotation !== undefined && particle.rotationSpeed) {
        particle.rotation += particle.rotationSpeed;
      }
      
      // Update life
      particle.life += deltaTime;
      
      // Type-specific behavior
      switch (particle.type) {
        case ParticleType.STEAM:
          // Steam rises and expands
          particle.vy -= 50 * deltaTime;
          particle.size += 20 * deltaTime;
          particle.opacity *= 0.98;
          break;
          
        case ParticleType.SMOKE:
          // Smoke rises slowly and spreads
          particle.vy -= 30 * deltaTime;
          particle.size += 15 * deltaTime;
          particle.vx *= 0.98;
          break;
          
        case ParticleType.SPARK:
          // Sparks fall and fade quickly
          particle.vy += 200 * deltaTime;
          particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));
          break;
          
        case ParticleType.OIL:
          // Oil drops fall and splatter
          particle.vy += 300 * deltaTime;
          if (particle.vy > 0 && particle.y > 0) {
            particle.vx *= 0.9;
            particle.vy *= 0.5;
            particle.size += 10 * deltaTime;
          }
          break;
      }
      
      // Fade out if enabled
      if (emitterConfig?.fadeOut) {
        const lifeRatio = particle.life / particle.maxLife;
        if (lifeRatio > 0.7) {
          particle.opacity *= 0.95;
        }
      }
      
      // Remove dead particles
      if (particle.life >= particle.maxLife || particle.opacity <= 0.01) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Group particles by type for batch rendering
    const particlesByType = new Map<ParticleType, Particle[]>();
    this.particles.forEach(particle => {
      if (!particlesByType.has(particle.type)) {
        particlesByType.set(particle.type, []);
      }
      particlesByType.get(particle.type)!.push(particle);
    });
    
    // Render each type
    particlesByType.forEach((particles, type) => {
      switch (type) {
        case ParticleType.STEAM:
        case ParticleType.SMOKE:
          // Soft particles
          particles.forEach(particle => {
            ctx.globalAlpha = particle.opacity;
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, particle.color + '88');
            gradient.addColorStop(0.5, particle.color + '44');
            gradient.addColorStop(1, particle.color + '00');
            ctx.fillStyle = gradient;
            ctx.fillRect(
              particle.x - particle.size,
              particle.y - particle.size,
              particle.size * 2,
              particle.size * 2
            );
          });
          break;
          
        case ParticleType.SPARK:
          // Bright points
          ctx.globalCompositeOperation = 'lighter';
          particles.forEach(particle => {
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalCompositeOperation = 'source-over';
          break;
          
        case ParticleType.GEAR:
          // Rotating gears
          if (this.gearTexture) {
            particles.forEach(particle => {
              ctx.save();
              ctx.globalAlpha = particle.opacity;
              ctx.translate(particle.x, particle.y);
              ctx.rotate(particle.rotation || 0);
              ctx.drawImage(
                this.gearTexture,
                -particle.size / 2,
                -particle.size / 2,
                particle.size,
                particle.size
              );
              ctx.restore();
            });
          }
          break;
          
        case ParticleType.OIL:
          // Oil drops
          particles.forEach(particle => {
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.ellipse(
              particle.x,
              particle.y,
              particle.size,
              particle.size * 0.6,
              0, 0, Math.PI * 2
            );
            ctx.fill();
          });
          break;
      }
    });
    
    ctx.restore();
  }
  
  clear(): void {
    this.particles = [];
  }
  
  getParticleCount(): number {
    return this.particles.length;
  }
  
  // Preset emitter configurations
  static createVehicleExhaust(x: number, y: number): ParticleEmitterConfig {
    return {
      x,
      y,
      type: ParticleType.STEAM,
      rate: 30,
      lifespan: 2,
      speed: 100,
      spread: Math.PI / 6,
      direction: -Math.PI / 2,
      sizeRange: [10, 20],
      fadeOut: true,
      continuous: true,
    };
  }
  
  static createDamageSmoke(x: number, y: number): ParticleEmitterConfig {
    return {
      x,
      y,
      type: ParticleType.SMOKE,
      rate: 20,
      lifespan: 3,
      speed: 50,
      spread: Math.PI / 4,
      direction: -Math.PI / 2,
      sizeRange: [15, 30],
      fadeOut: true,
      continuous: true,
    };
  }
  
  static createCollisionSparks(x: number, y: number, direction: number): ParticleEmitterConfig {
    return {
      x,
      y,
      type: ParticleType.SPARK,
      rate: 0,
      lifespan: 0.5,
      speed: 200,
      spread: Math.PI / 3,
      direction: direction + Math.PI,
      sizeRange: [2, 4],
      gravity: 400,
    };
  }
  
  static createGearDebris(x: number, y: number): ParticleEmitterConfig {
    return {
      x,
      y,
      type: ParticleType.GEAR,
      rate: 0,
      lifespan: 3,
      speed: 150,
      spread: Math.PI,
      direction: -Math.PI / 2,
      sizeRange: [8, 16],
      gravity: 300,
    };
  }
}