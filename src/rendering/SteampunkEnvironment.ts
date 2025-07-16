import { STEAMPUNK_PALETTE, createGradient, interpolateColor } from '../config/steampunkPalette';

export interface EnvironmentConfig {
  timeOfDay: 'dawn' | 'noon' | 'dusk' | 'night';
  weather: 'clear' | 'foggy' | 'steamy';
  industrialLevel: number; // 0-1, how many factories/smokestacks
}

export class SteampunkEnvironment {
  private skyCanvas: HTMLCanvasElement;
  private backgroundCanvas: HTMLCanvasElement;
  private fogCanvas: HTMLCanvasElement;
  private config: EnvironmentConfig;
  private animationTime: number = 0;
  
  constructor(width: number, height: number, config: EnvironmentConfig) {
    this.config = config;
    
    // Pre-render layers
    this.skyCanvas = this.createSkyLayer(width, height);
    this.backgroundCanvas = this.createBackgroundLayer(width, height);
    this.fogCanvas = this.createFogLayer(width, height);
  }
  
  private createSkyLayer(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Sky gradient based on time of day
    let skyColors: string[] = [];
    
    switch (this.config.timeOfDay) {
      case 'dawn':
        skyColors = [
          STEAMPUNK_PALETTE.atmospheric.soot[2].hex,
          interpolateColor(
            STEAMPUNK_PALETTE.atmospheric.soot[2].hex,
            STEAMPUNK_PALETTE.metallic.brass[2].hex,
            0.5
          ),
          STEAMPUNK_PALETTE.metallic.brass[2].hex,
          STEAMPUNK_PALETTE.metallic.copper[1].hex,
        ];
        break;
        
      case 'noon':
        skyColors = [
          interpolateColor(
            STEAMPUNK_PALETTE.atmospheric.steam[2].hex,
            STEAMPUNK_PALETTE.atmospheric.soot[3].hex,
            0.3
          ),
          STEAMPUNK_PALETTE.atmospheric.steam[1].hex,
          interpolateColor(
            STEAMPUNK_PALETTE.atmospheric.steam[0].hex,
            STEAMPUNK_PALETTE.metallic.brass[3].hex,
            0.1
          ),
        ];
        break;
        
      case 'dusk':
        skyColors = [
          STEAMPUNK_PALETTE.victorian.blues[2].hex,
          interpolateColor(
            STEAMPUNK_PALETTE.victorian.blues[1].hex,
            STEAMPUNK_PALETTE.metallic.copper[0].hex,
            0.4
          ),
          STEAMPUNK_PALETTE.metallic.copper[1].hex,
          STEAMPUNK_PALETTE.metallic.brass[0].hex,
        ];
        break;
        
      case 'night':
        skyColors = [
          STEAMPUNK_PALETTE.victorian.blues[0].hex,
          STEAMPUNK_PALETTE.victorian.blues[1].hex,
          STEAMPUNK_PALETTE.victorian.blues[2].hex,
        ];
        break;
    }
    
    const skyGradient = createGradient(ctx, skyColors, 0, 0, 0, height);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add stars for night
    if (this.config.timeOfDay === 'night') {
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.6;
        const size = Math.random() * 2;
        const opacity = 0.3 + Math.random() * 0.7;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Add industrial haze
    const hazeGradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
    hazeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    hazeGradient.addColorStop(1, `${STEAMPUNK_PALETTE.atmospheric.oil[2].hex}33`);
    ctx.fillStyle = hazeGradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
  }
  
  private createBackgroundLayer(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Industrial skyline
    const buildingCount = Math.floor(5 + this.config.industrialLevel * 10);
    const buildings: Array<{x: number, width: number, height: number}> = [];
    
    // Generate building positions
    for (let i = 0; i < buildingCount; i++) {
      buildings.push({
        x: Math.random() * width,
        width: 40 + Math.random() * 80,
        height: 100 + Math.random() * 200,
      });
    }
    
    // Sort by x position for proper layering
    buildings.sort((a, b) => a.x - b.x);
    
    // Draw buildings
    buildings.forEach((building, index) => {
      const darkness = index / buildings.length;
      const color = interpolateColor(
        STEAMPUNK_PALETTE.atmospheric.soot[2].hex,
        STEAMPUNK_PALETTE.atmospheric.soot[0].hex,
        darkness
      );
      
      ctx.fillStyle = color;
      ctx.fillRect(
        building.x,
        height - building.height,
        building.width,
        building.height
      );
      
      // Add windows
      const windowSize = 6;
      const windowSpacing = 12;
      const windowColor = this.config.timeOfDay === 'night' 
        ? STEAMPUNK_PALETTE.metallic.gold[3].hex
        : STEAMPUNK_PALETTE.atmospheric.soot[3].hex;
      
      ctx.fillStyle = windowColor;
      for (let wx = building.x + windowSpacing; wx < building.x + building.width - windowSpacing; wx += windowSpacing) {
        for (let wy = height - building.height + windowSpacing; wy < height - windowSpacing; wy += windowSpacing) {
          if (Math.random() > 0.3) {
            ctx.fillRect(wx, wy, windowSize, windowSize);
          }
        }
      }
      
      // Add smokestacks
      if (Math.random() < 0.3 + this.config.industrialLevel * 0.4) {
        const stackX = building.x + building.width * (0.2 + Math.random() * 0.6);
        const stackWidth = 10 + Math.random() * 10;
        const stackHeight = 30 + Math.random() * 50;
        
        // Stack
        ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[1].hex;
        ctx.fillRect(
          stackX,
          height - building.height - stackHeight,
          stackWidth,
          stackHeight
        );
        
        // Copper bands
        ctx.fillStyle = STEAMPUNK_PALETTE.metallic.copper[0].hex;
        for (let band = 0; band < 3; band++) {
          ctx.fillRect(
            stackX,
            height - building.height - stackHeight + band * stackHeight / 3,
            stackWidth,
            2
          );
        }
      }
    });
    
    // Add clocktower
    if (Math.random() < 0.5) {
      const clockX = width * (0.2 + Math.random() * 0.6);
      const clockSize = 40;
      const towerHeight = 250;
      
      // Tower
      ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.soot[1].hex;
      ctx.fillRect(clockX - 20, height - towerHeight, 40, towerHeight);
      
      // Clock face
      ctx.fillStyle = STEAMPUNK_PALETTE.atmospheric.steam[0].hex;
      ctx.beginPath();
      ctx.arc(clockX, height - towerHeight + 30, clockSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = STEAMPUNK_PALETTE.metallic.brass[1].hex;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Clock hands
      ctx.strokeStyle = STEAMPUNK_PALETTE.atmospheric.soot[0].hex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(clockX, height - towerHeight + 30);
      ctx.lineTo(clockX + 15, height - towerHeight + 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(clockX, height - towerHeight + 30);
      ctx.lineTo(clockX - 10, height - towerHeight + 35);
      ctx.stroke();
      
      // Gears visible
      ctx.fillStyle = STEAMPUNK_PALETTE.metallic.brass[2].hex;
      ctx.beginPath();
      ctx.arc(clockX + 25, height - towerHeight + 50, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(clockX - 25, height - towerHeight + 45, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return canvas;
  }
  
  private createFogLayer(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    if (this.config.weather === 'foggy' || this.config.weather === 'steamy') {
      // Create fog patches
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = height * 0.6 + Math.random() * height * 0.4;
        const radius = 50 + Math.random() * 150;
        
        const fogGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const fogColor = this.config.weather === 'steamy' 
          ? STEAMPUNK_PALETTE.atmospheric.steam[0].hex
          : STEAMPUNK_PALETTE.atmospheric.steam[2].hex;
          
        fogGradient.addColorStop(0, fogColor + '66');
        fogGradient.addColorStop(0.5, fogColor + '33');
        fogGradient.addColorStop(1, fogColor + '00');
        
        ctx.fillStyle = fogGradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
    
    return canvas;
  }
  
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
    
    // Animate fog
    if (this.config.weather !== 'clear') {
      const ctx = this.fogCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
      
      // Recreate fog with slight offset for animation
      for (let i = 0; i < 20; i++) {
        const baseX = (i * 100) % this.fogCanvas.width;
        const x = baseX + Math.sin(this.animationTime * 0.0005 + i) * 20;
        const y = this.fogCanvas.height * 0.6 + Math.sin(this.animationTime * 0.0003 + i * 2) * 20 + i * 10;
        const radius = 50 + Math.sin(this.animationTime * 0.0002 + i * 3) * 20 + i * 5;
        
        const fogGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const fogColor = this.config.weather === 'steamy' 
          ? STEAMPUNK_PALETTE.atmospheric.steam[0].hex
          : STEAMPUNK_PALETTE.atmospheric.steam[2].hex;
          
        fogGradient.addColorStop(0, fogColor + '44');
        fogGradient.addColorStop(0.5, fogColor + '22');
        fogGradient.addColorStop(1, fogColor + '00');
        
        ctx.fillStyle = fogGradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D, parallaxX: number = 0): void {
    // Sky (no parallax)
    ctx.drawImage(this.skyCanvas, 0, 0);
    
    // Background with parallax
    const bgParallax = parallaxX * 0.3;
    ctx.drawImage(
      this.backgroundCanvas,
      -bgParallax % this.backgroundCanvas.width,
      0
    );
    // Draw again for seamless scrolling
    ctx.drawImage(
      this.backgroundCanvas,
      (-bgParallax % this.backgroundCanvas.width) + this.backgroundCanvas.width,
      0
    );
    
    // Fog with different parallax
    const fogParallax = parallaxX * 0.1;
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      this.fogCanvas,
      -fogParallax % this.fogCanvas.width,
      0
    );
    ctx.drawImage(
      this.fogCanvas,
      (-fogParallax % this.fogCanvas.width) + this.fogCanvas.width,
      0
    );
    ctx.globalAlpha = 1;
  }
  
  setTimeOfDay(time: EnvironmentConfig['timeOfDay']): void {
    this.config.timeOfDay = time;
    this.skyCanvas = this.createSkyLayer(this.skyCanvas.width, this.skyCanvas.height);
  }
  
  setWeather(weather: EnvironmentConfig['weather']): void {
    this.config.weather = weather;
    this.fogCanvas = this.createFogLayer(this.fogCanvas.width, this.fogCanvas.height);
  }
}