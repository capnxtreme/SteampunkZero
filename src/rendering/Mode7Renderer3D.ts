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

interface Column {
  screenX: number;
  textureX: number;
  textureY: number;
  distance: number;
  height: number;
}

export class Mode7Renderer3D {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private horizonY: number;
  private fov: number = 120; // Wider FOV for larger track appearance
  private near: number = 10;
  private far: number = 1000;
  private wallHeight: number = 100; // Height of walls in world units

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
      height: 100,
    };

    this.horizonY = canvas.height * 0.5;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getCamera(): Camera {
    return { ...this.camera };
  }

  getHorizonY(): number {
    return this.horizonY;
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
    const screenY = this.horizonY - (distance - this.near) * scale * 0.1;

    return { x: screenX, y: screenY };
  }

  renderHorizon(): void {
    this.ctx.save();

    // Sky gradient
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.horizonY);
    skyGradient.addColorStop(0, '#1a1a2e');
    skyGradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.horizonY);

    // Ground gradient
    const groundGradient = this.ctx.createLinearGradient(
      0,
      this.horizonY,
      0,
      this.canvas.height
    );
    groundGradient.addColorStop(0, '#0f3460');
    groundGradient.addColorStop(1, '#533483');
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(
      0,
      this.horizonY,
      this.canvas.width,
      this.canvas.height - this.horizonY
    );

    // Horizon line
    this.ctx.strokeStyle = '#e94560';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.horizonY);
    this.ctx.lineTo(this.canvas.width, this.horizonY);
    this.ctx.stroke();

    this.ctx.restore();
  }

  renderMode7With3D(
    textureCanvas: HTMLCanvasElement,
    heightMap: Float32Array
  ): void {
    const textureCtx = textureCanvas.getContext('2d');
    if (!textureCtx) return;

    const textureData = textureCtx.getImageData(
      0,
      0,
      textureCanvas.width,
      textureCanvas.height
    );
    const textureWidth = textureCanvas.width;
    const textureHeight = textureCanvas.height;
    const texturePixels = textureData.data;

    const screenWidth = this.canvas.width;
    const screenHeight = this.canvas.height;

    // Create arrays to store wall columns
    const wallColumns: Column[] = [];

    // First pass: render ground and detect walls
    const screenData = this.ctx.createImageData(screenWidth, screenHeight);
    const screenPixels = screenData.data;

    // Clear screen data
    for (let i = 0; i < screenPixels.length; i += 4) {
      screenPixels[i] = 0;
      screenPixels[i + 1] = 0;
      screenPixels[i + 2] = 0;
      screenPixels[i + 3] = 0;
    }

    // Render ground plane
    for (let screenY = this.horizonY; screenY < screenHeight; screenY++) {
      const relativeY = screenY - this.horizonY;
      const distance =
        (this.camera.height * this.canvas.height) / (relativeY + 1);

      if (distance > this.far) continue;

      const fovRadians = (this.fov * Math.PI) / 180;
      const horizScale =
        (Math.tan(fovRadians / 2) * distance) / (screenWidth / 2);

      for (let screenX = 0; screenX < screenWidth; screenX++) {
        const relativeX = screenX - screenWidth / 2;
        const worldX = this.camera.x + relativeX * horizScale;
        const worldY = this.camera.y + distance;

        // Apply camera rotation
        const cos = Math.cos(this.camera.angle);
        const sin = Math.sin(this.camera.angle);
        const rotatedX =
          (worldX - this.camera.x) * cos -
          (worldY - this.camera.y) * sin +
          this.camera.x;
        const rotatedY =
          (worldX - this.camera.x) * sin +
          (worldY - this.camera.y) * cos +
          this.camera.y;

        // Convert to texture coordinates with scale
        // Scale adjusted to make track appear 128x larger
        // With 4096x4096 texture, this gives effective coverage of ~11585x11585 world units
        const worldToTextureScale = 0.354; // Makes track appear 128x bigger
        const textureX = Math.floor(
          rotatedX * worldToTextureScale + textureWidth / 2
        );
        const textureY = Math.floor(
          rotatedY * worldToTextureScale + textureHeight / 2
        );

        if (
          textureX < 0 ||
          textureX >= textureWidth ||
          textureY < 0 ||
          textureY >= textureHeight
        ) {
          continue;
        }

        // Get height at this position
        const heightIndex = textureY * textureWidth + textureX;
        const height = heightMap[heightIndex];

        // If this is a wall, add to wall columns for later rendering
        if (height > 0) {
          wallColumns.push({
            screenX,
            textureX,
            textureY,
            distance,
            height,
          });
        } else {
          // Render ground pixel
          const textureIndex = (textureY * textureWidth + textureX) * 4;
          const screenIndex = (screenY * screenWidth + screenX) * 4;

          screenPixels[screenIndex] = texturePixels[textureIndex];
          screenPixels[screenIndex + 1] = texturePixels[textureIndex + 1];
          screenPixels[screenIndex + 2] = texturePixels[textureIndex + 2];
          screenPixels[screenIndex + 3] = 255;
        }
      }
    }

    // Draw the ground
    this.ctx.putImageData(screenData, 0, 0);

    // Second pass: render walls (back to front)
    wallColumns.sort((a, b) => b.distance - a.distance);

    console.log('Wall columns to render:', wallColumns.length);

    for (const column of wallColumns) {
      // Calculate wall height on screen
      const wallHeightScreen =
        (this.wallHeight / column.distance) * this.canvas.height;
      const wallTop = this.horizonY - wallHeightScreen;
      const wallBottom = this.horizonY;

      // Get wall color from texture
      const textureIndex =
        (column.textureY * textureWidth + column.textureX) * 4;
      const r = texturePixels[textureIndex];
      const g = texturePixels[textureIndex + 1];
      const b = texturePixels[textureIndex + 2];

      // Apply distance fog
      const fogFactor = Math.max(0, 1 - column.distance / this.far);
      const foggedR = Math.floor(r * fogFactor);
      const foggedG = Math.floor(g * fogFactor);
      const foggedB = Math.floor(b * fogFactor);

      // Draw wall column
      this.ctx.fillStyle = `rgb(${foggedR}, ${foggedG}, ${foggedB})`;
      this.ctx.fillRect(column.screenX, wallTop, 1, wallBottom - wallTop);

      // Add shading for 3D effect
      const shadeFactor = 0.7;
      this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - fogFactor * shadeFactor})`;
      this.ctx.fillRect(column.screenX, wallTop, 1, wallBottom - wallTop);
    }
  }
}
