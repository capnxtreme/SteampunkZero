import { TextureGenerator } from '../assets/TextureGenerator';
import { AssetLoader } from '../core/AssetLoader';

export class Mode7Texture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private assetLoader: AssetLoader | undefined;

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
        const isEven = (x / tileSize + y / tileSize) % 2 === 0;
        this.ctx.fillStyle = isEven ? color1 : color2;
        this.ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
  }

  setAssetLoader(assetLoader: AssetLoader): void {
    this.assetLoader = assetLoader;
  }

  drawRoadTexture(roadWidth: number, trackType?: string): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;

    // Use real grass texture if available, otherwise generate
    const grassImage = this.assetLoader?.getImage('grass');
    if (grassImage) {
      // Tile the grass texture
      const pattern = this.ctx.createPattern(grassImage, 'repeat');
      if (pattern) {
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0, 0, width, height);
      }
    } else {
      const grassTexture = TextureGenerator.generateGrassTexture(width, height);
      this.ctx.drawImage(grassTexture, 0, 0);
    }

    // Use real road texture if available
    const roadImage = this.assetLoader?.getImage('road_straight');
    if (roadImage) {
      // Create a pattern and fill the road area
      const pattern = this.ctx.createPattern(roadImage, 'repeat');
      if (pattern) {
        this.ctx.save();
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(centerX - roadWidth / 2, 0, roadWidth, height);
        this.ctx.restore();
      }
    } else {
      const roadTexture = TextureGenerator.generateCobblestoneTexture(
        roadWidth,
        height
      );
      this.ctx.drawImage(roadTexture, centerX - roadWidth / 2, 0);
    }

    // Generate brass borders for road edges
    const borderWidth = 20;
    const borderTexture = TextureGenerator.generateSteampunkBorder(
      borderWidth,
      height
    );

    // Draw left border
    this.ctx.drawImage(borderTexture, centerX - roadWidth / 2 - borderWidth, 0);
    // Draw right border
    this.ctx.drawImage(borderTexture, centerX + roadWidth / 2, 0);

    // Draw brass center line with rivets
    const centerLineTexture = TextureGenerator.generateBrassTexture(8, height);
    this.ctx.drawImage(centerLineTexture, centerX - 4, 0);

    // Add steam vents along the road edges
    this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    const ventSpacing = 80;
    for (let y = 0; y < height; y += ventSpacing) {
      // Left side vents
      this.ctx.beginPath();
      this.ctx.arc(centerX - roadWidth / 2 - 10, y, 15, 0, Math.PI * 2);
      this.ctx.fill();
      // Right side vents
      this.ctx.beginPath();
      this.ctx.arc(centerX + roadWidth / 2 + 10, y, 15, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
