export interface Camera {
  x: number;
  y: number;
  angle: number;
  height: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export class Mode7Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private horizonY: number;
  private fov: number = 90; // Field of view in degrees
  private near: number = 10; // Near clipping plane
  private far: number = 1000; // Far clipping plane

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
    
    this.camera = {
      x: 0,
      y: 0,
      angle: 0,
      height: 100
    };
    
    this.horizonY = canvas.height * 0.5; // Horizon at center
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getCamera(): Camera {
    return { ...this.camera };
  }

  setCameraPosition(x: number, y: number): void {
    this.camera.x = x;
    this.camera.y = y;
  }

  setCameraAngle(angle: number): void {
    this.camera.angle = angle;
  }

  setCameraHeight(height: number): void {
    this.camera.height = height;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  worldToScreen(worldPoint: Point2D): Point2D {
    // Transform world coordinates relative to camera
    const relX = worldPoint.x - this.camera.x;
    const relY = worldPoint.y - this.camera.y;
    
    // Apply camera rotation
    const cos = Math.cos(-this.camera.angle);
    const sin = Math.sin(-this.camera.angle);
    const rotatedX = relX * cos - relY * sin;
    const rotatedY = relX * sin + relY * cos;
    
    // Apply Mode 7 perspective transformation
    const distance = Math.max(rotatedY, this.near);
    const scale = this.camera.height / distance;
    
    // Convert to screen coordinates
    const screenX = this.canvas.width / 2 + rotatedX * scale;
    // In Mode 7, further objects appear higher (smaller Y), so we subtract from horizon
    const screenY = this.horizonY - (distance - this.near) * scale * 0.1;
    
    return { x: screenX, y: screenY };
  }

  renderHorizon(): void {
    // Save current context state
    this.ctx.save();
    
    // Sky gradient
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.horizonY);
    skyGradient.addColorStop(0, '#1a1a2e');
    skyGradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.horizonY);
    
    // Ground gradient (will be replaced by Mode 7 texture later)
    const groundGradient = this.ctx.createLinearGradient(0, this.horizonY, 0, this.canvas.height);
    groundGradient.addColorStop(0, '#0f3460');
    groundGradient.addColorStop(1, '#533483');
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(0, this.horizonY, this.canvas.width, this.canvas.height - this.horizonY);
    
    // Horizon line
    this.ctx.strokeStyle = '#e94560';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.horizonY);
    this.ctx.lineTo(this.canvas.width, this.horizonY);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  renderMode7(textureCanvas: HTMLCanvasElement): void {
    // Get texture data
    const textureCtx = textureCanvas.getContext('2d');
    if (!textureCtx) return;
    
    const textureData = textureCtx.getImageData(0, 0, textureCanvas.width, textureCanvas.height);
    const textureWidth = textureCanvas.width;
    const textureHeight = textureCanvas.height;
    const texturePixels = textureData.data;
    
    // Get screen data
    const screenData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    const screenPixels = screenData.data;
    const screenWidth = this.canvas.width;
    const screenHeight = this.canvas.height;
    
    // Mode 7 transformation for each scanline below horizon
    for (let screenY = this.horizonY; screenY < screenHeight; screenY++) {
      // Calculate the distance for this scanline
      const relativeY = screenY - this.horizonY;
      const distance = (this.camera.height * this.canvas.height) / (relativeY + 1);
      
      // Calculate the scale factor for this scanline
      const scale = distance / this.camera.height;
      
      // Calculate horizontal scaling based on field of view
      const fovRadians = (this.fov * Math.PI) / 180;
      const horizScale = Math.tan(fovRadians / 2) * distance / (screenWidth / 2);
      
      // Sample the texture for each pixel in this scanline
      for (let screenX = 0; screenX < screenWidth; screenX++) {
        // Calculate world coordinates
        const relativeX = screenX - screenWidth / 2;
        const worldX = this.camera.x + (relativeX * horizScale);
        const worldY = this.camera.y + distance;
        
        // Apply camera rotation
        const cos = Math.cos(this.camera.angle);
        const sin = Math.sin(this.camera.angle);
        const rotatedX = (worldX - this.camera.x) * cos - (worldY - this.camera.y) * sin + this.camera.x;
        const rotatedY = (worldX - this.camera.x) * sin + (worldY - this.camera.y) * cos + this.camera.y;
        
        // Convert to texture coordinates
        let textureX = Math.floor(rotatedX) % textureWidth;
        let textureY = Math.floor(rotatedY) % textureHeight;
        
        // Handle negative modulo
        if (textureX < 0) textureX += textureWidth;
        if (textureY < 0) textureY += textureHeight;
        
        // Sample from texture
        const textureIndex = (textureY * textureWidth + textureX) * 4;
        const screenIndex = (screenY * screenWidth + screenX) * 4;
        
        screenPixels[screenIndex] = texturePixels[textureIndex];
        screenPixels[screenIndex + 1] = texturePixels[textureIndex + 1];
        screenPixels[screenIndex + 2] = texturePixels[textureIndex + 2];
        screenPixels[screenIndex + 3] = 255;
      }
    }
    
    // Draw the transformed image
    this.ctx.putImageData(screenData, 0, 0);
  }
}