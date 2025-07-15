export interface TrackTextureData {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  // Track element colors
  colors: {
    road: string;
    offtrack: string;
    wall: string;
    boost: string;
    hazard: string;
    startFinish: string;
  };
}

export class TrackTexture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private colors: TrackTextureData['colors'];
  private heightMap: Float32Array; // Height data for 3D walls

  constructor(width: number = 1024, height: number = 1024) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create track texture context');
    this.ctx = ctx;

    // Define color scheme for track elements
    this.colors = {
      road: '#404040', // Dark gray for road
      offtrack: '#2d5016', // Green for grass
      wall: '#000000', // Black for walls/barriers
      boost: '#ffff00', // Yellow for boost pads
      hazard: '#ff0000', // Red for hazards
      startFinish: '#ffffff', // White for start/finish line
    };

    // Initialize height map
    this.heightMap = new Float32Array(width * height);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getColors(): TrackTextureData['colors'] {
    return { ...this.colors };
  }

  getHeightAt(x: number, y: number): number {
    // Clamp to texture bounds
    x = Math.max(0, Math.min(this.canvas.width - 1, x));
    y = Math.max(0, Math.min(this.canvas.height - 1, y));

    const index = y * this.canvas.width + x;
    return this.heightMap[index];
  }

  getHeightMap(): Float32Array {
    return this.heightMap;
  }

  // Check what type of surface is at a given position
  getSurfaceAt(x: number, y: number): string {
    // Clamp to texture bounds
    x = Math.max(0, Math.min(this.canvas.width - 1, x));
    y = Math.max(0, Math.min(this.canvas.height - 1, y));

    // Sample a small area for more reliable detection
    const sampleSize = 3;
    const imageData = this.ctx.getImageData(
      Math.max(0, x - Math.floor(sampleSize / 2)),
      Math.max(0, y - Math.floor(sampleSize / 2)),
      sampleSize,
      sampleSize
    );
    const pixels = imageData.data;

    // Count occurrences of each surface type
    const counts: { [key: string]: number } = {
      wall: 0,
      road: 0,
      boost: 0,
      hazard: 0,
      startFinish: 0,
      offtrack: 0,
    };

    // Check each pixel in the sample
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // More precise color matching with tolerance
      if (r <= 20 && g <= 20 && b <= 20) {
        counts.wall++;
      } else if (
        r >= 55 &&
        r <= 85 &&
        g >= 55 &&
        g <= 85 &&
        b >= 55 &&
        b <= 85
      ) {
        counts.road++;
      } else if (r >= 240 && g >= 240 && b <= 30) {
        counts.boost++;
      } else if (r >= 240 && g <= 30 && b <= 30) {
        counts.hazard++;
      } else if (r >= 240 && g >= 240 && b >= 240) {
        counts.startFinish++;
      } else if (g > r && g > b && g > 50) {
        counts.offtrack++;
      } else {
        counts.offtrack++;
      }
    }

    // Return the most common surface type
    let maxCount = 0;
    let surface = 'offtrack';
    for (const [type, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        surface = type;
      }
    }

    return surface;
  }

  // Update height map based on surface colors
  updateHeightMap(): void {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const pixels = imageData.data;

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const index = (y * this.canvas.width + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];

        const heightIndex = y * this.canvas.width + x;

        // Set height based on surface type
        if (r < 10 && g < 10 && b < 10) {
          // Wall - high elevation
          this.heightMap[heightIndex] = 1.0;
        } else {
          // Everything else - ground level
          this.heightMap[heightIndex] = 0.0;
        }
      }
    }
  }

  // Generate an oval track with proper racing principles
  generateOvalTrack(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    console.log(
      'TrackTexture.generateOvalTrack called, canvas size:',
      width,
      'x',
      height
    );

    // Fill with off-track color
    this.ctx.fillStyle = this.colors.offtrack;
    this.ctx.fillRect(0, 0, width, height);

    // Track parameters - much wider for better racing
    const trackWidth = Math.floor(width * 0.3); // 30% of texture width
    const centerX = width / 2;
    const centerY = height / 2;
    console.log('Track width:', trackWidth, 'pixels (30% of', width, ')');

    // Create outer oval
    const outerRadiusX = width * 0.45;
    const outerRadiusY = height * 0.4;

    // Draw track base
    this.ctx.fillStyle = this.colors.road;
    this.ctx.beginPath();
    this.ctx.ellipse(
      centerX,
      centerY,
      outerRadiusX,
      outerRadiusY,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Clear inner area
    this.ctx.fillStyle = this.colors.offtrack;
    this.ctx.beginPath();
    this.ctx.ellipse(
      centerX,
      centerY,
      outerRadiusX - trackWidth,
      outerRadiusY - trackWidth,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Add inner and outer walls
    this.ctx.strokeStyle = this.colors.wall;
    this.ctx.lineWidth = 20;

    // Outer wall
    this.ctx.beginPath();
    this.ctx.ellipse(
      centerX,
      centerY,
      outerRadiusX + 10,
      outerRadiusY + 10,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.stroke();

    // Inner wall
    this.ctx.beginPath();
    this.ctx.ellipse(
      centerX,
      centerY,
      outerRadiusX - trackWidth - 10,
      outerRadiusY - trackWidth - 10,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.stroke();

    // Start/finish line
    this.ctx.fillStyle = this.colors.startFinish;
    this.ctx.fillRect(
      centerX + outerRadiusX - trackWidth,
      centerY - 30,
      trackWidth,
      60
    );

    // Add boost pads on straights for strategy
    this.ctx.fillStyle = this.colors.boost;
    // Top straight
    this.ctx.fillRect(
      centerX - 80,
      centerY - outerRadiusY + trackWidth / 2 - 30,
      160,
      60
    );
    // Bottom straight
    this.ctx.fillRect(
      centerX - 80,
      centerY + outerRadiusY - trackWidth / 2 - 30,
      160,
      60
    );

    // Update height map
    this.updateHeightMap();
  }

  // Generate a circuit-style track with proper racing line design
  generateCircuitTrack(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Fill with off-track color
    this.ctx.fillStyle = this.colors.offtrack;
    this.ctx.fillRect(0, 0, width, height);

    // Track width - wider for better racing
    const trackWidth = Math.floor(width * 0.25);

    // Set up for smooth curves
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Draw track base with proper racing line
    this.ctx.strokeStyle = this.colors.road;
    this.ctx.lineWidth = trackWidth;

    // Create a flowing circuit with good corner variety
    this.ctx.beginPath();

    // Start position (right side)
    const startX = width * 0.85;
    const startY = height * 0.7;
    this.ctx.moveTo(startX, startY);

    // Long straight into first corner (good for overtaking)
    this.ctx.lineTo(width * 0.85, height * 0.2);

    // Hairpin turn (technical section)
    this.ctx.quadraticCurveTo(
      width * 0.85,
      height * 0.1,
      width * 0.7,
      height * 0.1
    );
    this.ctx.quadraticCurveTo(
      width * 0.55,
      height * 0.1,
      width * 0.55,
      height * 0.2
    );

    // S-curves (flow section)
    this.ctx.bezierCurveTo(
      width * 0.55,
      height * 0.3,
      width * 0.3,
      height * 0.25,
      width * 0.2,
      height * 0.35
    );
    this.ctx.bezierCurveTo(
      width * 0.1,
      height * 0.45,
      width * 0.1,
      height * 0.55,
      width * 0.2,
      height * 0.65
    );

    // Fast sweeping corner
    this.ctx.quadraticCurveTo(
      width * 0.3,
      height * 0.75,
      width * 0.45,
      height * 0.8
    );

    // Chicane before finish
    this.ctx.lineTo(width * 0.6, height * 0.8);
    this.ctx.lineTo(width * 0.65, height * 0.75);
    this.ctx.lineTo(width * 0.7, height * 0.75);

    // Back to start/finish
    this.ctx.lineTo(startX, startY);

    this.ctx.stroke();

    // Add walls
    this.ctx.strokeStyle = this.colors.wall;
    this.ctx.lineWidth = trackWidth + 40;
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = 'source-over';

    // Start/finish line
    this.ctx.fillStyle = this.colors.startFinish;
    this.ctx.fillRect(startX - trackWidth / 2, startY - 30, trackWidth, 60);

    // Strategic boost pad placement
    this.ctx.fillStyle = this.colors.boost;
    // Exit of hairpin (reward good cornering)
    this.ctx.save();
    this.ctx.translate(width * 0.55, height * 0.25);
    this.ctx.rotate(Math.PI / 2);
    this.ctx.fillRect(-30, -trackWidth / 3, 60, trackWidth / 2);
    this.ctx.restore();

    // Before braking zone
    this.ctx.fillRect(width * 0.85 - 30, height * 0.4, 60, trackWidth / 2);

    // Update height map
    this.updateHeightMap();
  }

  // Generate a technical track with varying corner types
  generateTechnicalTrack(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Fill with off-track color
    this.ctx.fillStyle = this.colors.offtrack;
    this.ctx.fillRect(0, 0, width, height);

    // Variable track width for different sections
    const baseTrackWidth = Math.floor(width * 0.2);

    // Draw complex technical circuit
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // First pass - wide sections
    this.ctx.strokeStyle = this.colors.road;
    this.ctx.lineWidth = baseTrackWidth * 1.5;

    this.ctx.beginPath();
    this.ctx.moveTo(width * 0.8, height * 0.8);
    this.ctx.lineTo(width * 0.8, height * 0.5);
    this.ctx.stroke();

    // Regular width sections
    this.ctx.lineWidth = baseTrackWidth;

    this.ctx.beginPath();
    this.ctx.moveTo(width * 0.8, height * 0.5);

    // Complex corner sequence
    this.ctx.quadraticCurveTo(
      width * 0.8,
      height * 0.3,
      width * 0.6,
      height * 0.2
    );
    this.ctx.lineTo(width * 0.3, height * 0.2);

    // Decreasing radius corner (difficult)
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = -Math.PI / 2 + Math.PI * t;
      const radius = 80 - 30 * t; // Decreasing radius
      const x = width * 0.2 + Math.cos(angle) * radius;
      const y = height * 0.3 + Math.sin(angle) * radius;
      if (i === 0) this.ctx.lineTo(x, y);
      else this.ctx.lineTo(x, y);
    }

    // Tight section
    this.ctx.lineWidth = baseTrackWidth * 0.8;
    this.ctx.lineTo(width * 0.2, height * 0.6);
    this.ctx.quadraticCurveTo(
      width * 0.2,
      height * 0.7,
      width * 0.3,
      height * 0.7
    );

    // Opening up to finish
    this.ctx.lineWidth = baseTrackWidth * 1.2;
    this.ctx.bezierCurveTo(
      width * 0.5,
      height * 0.7,
      width * 0.6,
      height * 0.8,
      width * 0.8,
      height * 0.8
    );

    this.ctx.stroke();

    // Add walls with varying distances
    this.ctx.strokeStyle = this.colors.wall;
    this.ctx.lineWidth = baseTrackWidth * 2;
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = 'source-over';

    // Start/finish
    this.ctx.fillStyle = this.colors.startFinish;
    this.ctx.fillRect(width * 0.75, height * 0.8 - 30, baseTrackWidth, 60);

    // Limited boost pads (skill-based track)
    this.ctx.fillStyle = this.colors.boost;
    this.ctx.fillRect(width * 0.45, height * 0.2 - 25, 100, 50);

    // Hazard in challenging section
    this.ctx.fillStyle = this.colors.hazard;
    this.ctx.fillRect(width * 0.2 - 20, height * 0.45, 40, 40);

    // Update height map
    this.updateHeightMap();
  }

  // Generate a random track with good flow
  generateRandomTrack(): void {
    console.log('generateRandomTrack called!');
    // Randomly select one of our well-designed track types
    const trackTypes = [
      () => this.generateCircuitTrack(),
      () => this.generateTechnicalTrack(),
      () => this.generateFlowingTrack(),
    ];

    const selectedTrack =
      trackTypes[Math.floor(Math.random() * trackTypes.length)];
    console.log('Selected track type:', selectedTrack.toString());
    selectedTrack();
    console.log('Random track generation complete');
  }

  // Generate a high-speed flowing track
  private generateFlowingTrack(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Fill with off-track color
    this.ctx.fillStyle = this.colors.offtrack;
    this.ctx.fillRect(0, 0, width, height);

    // Wide track for high-speed racing
    const trackWidth = Math.floor(width * 0.35);

    this.ctx.strokeStyle = this.colors.road;
    this.ctx.lineWidth = trackWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Create flowing high-speed circuit
    this.ctx.beginPath();

    const centerX = width / 2;
    const centerY = height / 2;

    // Start at bottom
    this.ctx.moveTo(centerX, height * 0.9);

    // Large radius corners for maintaining speed
    this.ctx.quadraticCurveTo(width * 0.9, height * 0.9, width * 0.9, centerY);
    this.ctx.quadraticCurveTo(width * 0.9, height * 0.1, centerX, height * 0.1);
    this.ctx.quadraticCurveTo(width * 0.1, height * 0.1, width * 0.1, centerY);
    this.ctx.quadraticCurveTo(width * 0.1, height * 0.9, centerX, height * 0.9);

    this.ctx.stroke();

    // Add walls
    this.ctx.strokeStyle = this.colors.wall;
    this.ctx.lineWidth = trackWidth + 60;
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = 'source-over';

    // Multiple boost zones for speed
    this.ctx.fillStyle = this.colors.boost;
    // Boost strips on straights
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (width * 0.35);
      const y = centerY + Math.sin(angle) * (height * 0.35);

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle + Math.PI / 2);
      this.ctx.fillRect(-40, -trackWidth / 3, 80, trackWidth / 2);
      this.ctx.restore();
    }

    // Start/finish
    this.ctx.fillStyle = this.colors.startFinish;
    this.ctx.fillRect(
      centerX - trackWidth / 2,
      height * 0.9 - 30,
      trackWidth,
      60
    );

    // Update height map
    this.updateHeightMap();
  }
}
