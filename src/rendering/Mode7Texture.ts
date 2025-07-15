export class Mode7Texture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  
  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create texture context');
    this.ctx = ctx;
    this.imageData = this.ctx.createImageData(width, height);
  }
  
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  
  clear(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  drawCheckerboard(tileSize: number, color1: string, color2: string): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        this.ctx.fillStyle = isEven ? color1 : color2;
        this.ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  }
  
  drawRoadTexture(roadWidth: number): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    
    // Clear to grass color
    this.ctx.fillStyle = '#2d5016';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw road
    this.ctx.fillStyle = '#3a3a3a';
    this.ctx.fillRect(centerX - roadWidth / 2, 0, roadWidth, height);
    
    // Draw road edges
    this.ctx.fillStyle = '#8b7355';
    this.ctx.fillRect(centerX - roadWidth / 2 - 10, 0, 10, height);
    this.ctx.fillRect(centerX + roadWidth / 2, 0, 10, height);
    
    // Draw center line dashes
    this.ctx.fillStyle = '#ffff00';
    const dashLength = 40;
    const dashGap = 40;
    for (let y = 0; y < height; y += dashLength + dashGap) {
      this.ctx.fillRect(centerX - 2, y, 4, dashLength);
    }
  }
}