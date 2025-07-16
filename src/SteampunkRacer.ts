import { Mode7Renderer3D } from './rendering/Mode7Renderer3D.js';
import { Vehicle } from './entities/Vehicle.js';
import { VehicleController } from './controllers/VehicleController.js';
import { VehicleSprite } from './entities/VehicleSprite.js';
import { VehicleSpriteGenerator } from './assets/VehicleSpriteGenerator.js';
import { AssetLoader } from './core/AssetLoader.js';
import { TrackTexture } from './tracks/TrackTexture.js';
import { AudioManager } from './audio/AudioManager.js';
import { SteampunkEnvironment } from './rendering/SteampunkEnvironment.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { SteampunkHUD } from './ui/SteampunkHUD.js';

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  currentTrack: 'random-1' | 'random-2' | 'random-3' | 'oval';
  trackIndex: number;
  lapTime: number;
  bestLapTime: number;
  currentLap: number;
  totalLaps: number;
  distanceTraveled: number;
  hasPassedStart: boolean;
  vehicleStartPos: { x: number; y: number };
  isHittingWall: boolean;
}

export class SteampunkRacer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode7Renderer: Mode7Renderer3D;
  private vehicle: Vehicle;
  private vehicleController: VehicleController;
  private vehicleSprite: VehicleSprite;
  private vehicleSpriteCanvas: HTMLCanvasElement;
  private assetLoader: AssetLoader;
  private vehicleImage: HTMLImageElement | undefined;
  private audioManager: AudioManager;
  private env: SteampunkEnvironment;
  private particles: ParticleSystem;
  private hud: SteampunkHUD;

  private trackTexture: TrackTexture;

  private trackTypes = [
    {
      name: 'random-1',
      generate: (tt: TrackTexture) => tt.generateRandomTrack(),
    },
    {
      name: 'random-2',
      generate: (tt: TrackTexture) => tt.generateRandomTrack(),
    },
    {
      name: 'random-3',
      generate: (tt: TrackTexture) => tt.generateRandomTrack(),
    },
    { name: 'oval', generate: (tt: TrackTexture) => tt.generateOvalTrack() },
  ];

  private state: GameState;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FIXED_TIMESTEP: number = 1000 / 60; // 60 FPS physics
  private debugMode: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Initialize renderer
    this.mode7Renderer = new Mode7Renderer3D(canvas);

    // Create track texture - Large but reasonable for browsers
    console.log('Creating TrackTexture instance...');
    this.trackTexture = new TrackTexture(2048, 2048); // Balanced size for performance
    console.log('TrackTexture created:', this.trackTexture);

    // Generate first track (random)
    console.log('Calling generateRandomTrack...');
    this.trackTexture.generateRandomTrack();
    console.log('Track generation complete');

    // Create player vehicle - start at center right of track
    const startPos = { x: 0, y: 0 }; // Start at center, we'll find the track
    this.vehicle = new Vehicle(startPos);
    this.vehicle.rotation = 0; // Face forward (down the screen)

    // Set up controls
    this.vehicleController = new VehicleController(this.vehicle);

    // Create vehicle sprite
    this.vehicleSprite = new VehicleSprite(this.vehicle, '#c9302c'); // Steampunk red

    // Generate steampunk vehicle sprite (rear view)
    this.vehicleSpriteCanvas = VehicleSpriteGenerator.generateSteamPunkCar(2);

    // Initialize asset loader
    this.assetLoader = new AssetLoader();

    // Initialize audio manager
    this.audioManager = new AudioManager();

    // Initialize new visual systems
    this.env = new SteampunkEnvironment(this.canvas.width, this.canvas.height, {
      timeOfDay: 'dusk',
      weather: 'foggy',
      industrialLevel: 0.7,
    });
    this.particles = new ParticleSystem();
    // Exhaust emitters for rear-view vehicle (screen space constants for now)
    this.particles.addEmitter(
      'exhaustLeft',
      ParticleSystem.createVehicleExhaust(this.canvas.width / 2 - 20, this.canvas.height - 80)
    );
    this.particles.addEmitter(
      'exhaustRight',
      ParticleSystem.createVehicleExhaust(this.canvas.width / 2 + 20, this.canvas.height - 80)
    );
    this.hud = new SteampunkHUD(this.canvas.width, this.canvas.height);

    // Initialize game state
    this.state = {
      isRunning: false,
      isPaused: false,
      currentTrack: 'random-1',
      trackIndex: 0,
      lapTime: 0,
      bestLapTime: Infinity,
      currentLap: 1,
      totalLaps: 3,
      distanceTraveled: 0,
      hasPassedStart: false,
      vehicleStartPos: { x: 0, y: 0 },
      isHittingWall: false,
    };
  }

  async start(): Promise<void> {
    if (this.state.isRunning) return;

    // Load assets first
    await this.assetLoader.loadInitialAssets();
    this.vehicleImage = this.assetLoader.getImage('car_red');

    // Initialize audio (requires user interaction)
    await this.audioManager.initialize();

    // Start background music
    this.audioManager.playBackgroundMusic();

    this.state.isRunning = true;
    this.state.isPaused = false;
    this.vehicleController.attach();
    this.lastTime = performance.now();
    this.accumulator = 0; // Reset accumulator
    this.gameLoop();
  }

  stop(): void {
    this.state.isRunning = false;
    this.vehicleController.detach();

    // Stop audio
    this.audioManager.stopEngineSound();
    this.audioManager.stopBackgroundMusic();
  }

  pause(): void {
    this.state.isPaused = !this.state.isPaused;

    // Pause/resume audio
    if (this.state.isPaused) {
      this.audioManager.stopEngineSound();
    }
  }

  switchTrack(): void {
    // Cycle to next track
    this.state.trackIndex =
      (this.state.trackIndex + 1) % this.trackTypes.length;
    const trackType = this.trackTypes[this.state.trackIndex];

    // Generate new track texture
    trackType.generate(this.trackTexture);
    this.state.currentTrack = trackType.name;

    // For random tracks, find a good starting position on the track
    // We'll search for a road surface near the expected start position
    const startX = 700; // Start searching from right side (adjusted for larger scale)
    const startY = 0; // Center vertically
    let found = false;

    // Search in expanding circles for a road surface
    const worldToTextureScale = 0.354;
    for (let radius = 0; radius < 500 && !found; radius += 25) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const checkX = startX + Math.cos(angle) * radius;
        const checkY = startY + Math.sin(angle) * radius;
        const textureX = Math.floor(checkX * worldToTextureScale + 2048);
        const textureY = Math.floor(checkY * worldToTextureScale + 2048);

        if (
          textureX >= 0 &&
          textureX < 2048 &&
          textureY >= 0 &&
          textureY < 2048
        ) {
          const surface = this.trackTexture.getSurfaceAt(textureX, textureY);
          if (surface === 'road' || surface === 'startFinish') {
            this.state.vehicleStartPos = { x: checkX, y: checkY };
            found = true;
            break;
          }
        }
      }
    }

    // Fallback to default if no road found
    if (!found) {
      this.state.vehicleStartPos = { x: 0, y: 0 };
    }

    // Reset game state
    this.resetRace();
  }

  private resetRace(): void {
    // Reset vehicle position to track start position
    this.vehicle.position = { ...this.state.vehicleStartPos };
    this.vehicle.rotation = 0;
    this.vehicle.speed = 0;

    // Reset lap tracking
    this.state.currentLap = 1;
    this.state.lapTime = 0;
    this.state.distanceTraveled = 0;
    this.state.hasPassedStart = false;
  }

  private gameLoop = (): void => {
    if (!this.state.isRunning) return;

    const currentTime = performance.now();
    const frameTime =
      this.lastTime === 0 ? 0 : Math.min(currentTime - this.lastTime, 250); // Cap at 250ms
    this.lastTime = currentTime;

    if (!this.state.isPaused) {
      this.accumulator += frameTime;

      // Fixed timestep physics
      while (this.accumulator >= this.FIXED_TIMESTEP) {
        this.update(this.FIXED_TIMESTEP / 1000);
        this.accumulator -= this.FIXED_TIMESTEP;
      }
    }

    // Render with interpolation
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update vehicle controller (processes input)
    this.vehicleController.update(deltaTime);

    // Store old position
    const oldX = this.vehicle.position.x;
    const oldY = this.vehicle.position.y;

    // Update vehicle physics
    this.vehicle.update(deltaTime);

    // Update engine sound based on speed
    this.audioManager.playEngineSound(
      this.vehicle.speed,
      this.vehicle.maxSpeed
    );

    // Check multiple points around the vehicle for collision
    const checkPoints = [
      { dx: 0, dy: 0 }, // Center
      { dx: 10, dy: 0 }, // Right
      { dx: -10, dy: 0 }, // Left
      { dx: 0, dy: 10 }, // Front
      { dx: 0, dy: -10 }, // Back
      { dx: 7, dy: 7 }, // Front-right
      { dx: -7, dy: 7 }, // Front-left
      { dx: 7, dy: -7 }, // Back-right
      { dx: -7, dy: -7 }, // Back-left
    ];

    let hitWall = false;
    let currentSurface = 'road';

    // Check all points around the vehicle
    for (const point of checkPoints) {
      // Rotate check point based on vehicle rotation
      const cos = Math.cos(this.vehicle.rotation);
      const sin = Math.sin(this.vehicle.rotation);
      const rotX = point.dx * cos - point.dy * sin;
      const rotY = point.dx * sin + point.dy * cos;

      const checkX = this.vehicle.position.x + rotX;
      const checkY = this.vehicle.position.y + rotY;

      // Convert to texture coordinates with same scale as renderer
      const worldToTextureScale = 0.354; // Same as Mode7Renderer3D
      const textureX = Math.floor(checkX * worldToTextureScale + 2048);
      const textureY = Math.floor(checkY * worldToTextureScale + 2048);

      if (
        textureX >= 0 &&
        textureX < 2048 &&
        textureY >= 0 &&
        textureY < 2048
      ) {
        const surface = this.trackTexture.getSurfaceAt(textureX, textureY);

        if (surface === 'wall') {
          hitWall = true;
          break;
        }

        // Use the center point's surface for other effects
        if (point.dx === 0 && point.dy === 0) {
          currentSurface = surface;
        }
      }
    }

    // Update wall hit state
    this.state.isHittingWall = hitWall;

    // Handle wall collision
    if (hitWall) {
      // Restore old position
      this.vehicle.position.x = oldX;
      this.vehicle.position.y = oldY;
      // Bounce effect
      this.vehicle.speed *= -0.3;

      // Play collision sound
      this.audioManager.playCollisionSound();
    } else {
      // Handle other surface types
      switch (currentSurface) {
        case 'offtrack':
          // Off track - reduce speed
          this.vehicle.speed *= 0.98; // Gradual slowdown
          if (this.vehicle.speed > this.vehicle.maxSpeed * 0.5) {
            this.vehicle.speed = this.vehicle.maxSpeed * 0.5;
          }
          break;
        case 'boost':
          // Boost pad - increase speed
          if (this.vehicle.speed < this.vehicle.maxSpeed * 1.5) {
            this.vehicle.speed = Math.min(
              this.vehicle.speed * 1.05,
              this.vehicle.maxSpeed * 1.5
            );
            // Play boost sound when hitting boost pad
            this.audioManager.playBoostSound();
          }
          break;
        case 'hazard':
          // Hazard - spin out
          this.vehicle.rotation += Math.PI / 16;
          this.vehicle.speed *= 0.95;
          break;
        case 'startFinish':
          // Check for lap completion
          if (this.vehicle.position.y > 250 && !this.state.hasPassedStart) {
            this.state.hasPassedStart = true;
          } else if (
            this.vehicle.position.y < 200 &&
            this.state.hasPassedStart
          ) {
            this.completeLap();
          }
          break;
      }
    }

    // Update camera to follow vehicle
    this.updateCamera();

    // Update lap time and distance
    this.state.lapTime += deltaTime;
    this.state.distanceTraveled += this.vehicle.speed * deltaTime;
  }

  private completeLap(): void {
    // Update best lap time
    if (this.state.lapTime < this.state.bestLapTime) {
      this.state.bestLapTime = this.state.lapTime;
    }

    // Move to next lap
    this.state.currentLap++;

    // Check if race is complete
    if (this.state.currentLap > this.state.totalLaps) {
      // Race complete!
      console.log(
        `Race complete! Best lap: ${this.state.bestLapTime.toFixed(2)}s`
      );
      this.state.currentLap = this.state.totalLaps; // Cap at total laps
    }

    // Reset lap timer and tracking
    this.state.lapTime = 0;
    this.state.hasPassedStart = false;
  }

  private updateCamera(): void {
    // Camera follows behind the vehicle
    const cameraDistance = 50; // Distance behind vehicle - closer for larger track appearance
    const cameraHeight = 40; // Camera height for Mode 7 effect - lower for larger track

    // Position camera behind the vehicle based on vehicle's rotation
    const cameraX =
      this.vehicle.position.x +
      Math.sin(this.vehicle.rotation) * cameraDistance;
    const cameraY =
      this.vehicle.position.y -
      Math.cos(this.vehicle.rotation) * cameraDistance;

    // Update renderer
    this.mode7Renderer.setCameraPosition(cameraX, cameraY);
    this.mode7Renderer.setCameraAngle(this.vehicle.rotation);
    this.mode7Renderer.setCameraHeight(cameraHeight);
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render sky/background via environment with parallax tied to vehicle position
    const parallaxX = this.vehicle.position.x;
    this.env.update(1 / 60);
    this.env.render(this.ctx, parallaxX);

    // Render track using Mode7
    this.mode7Renderer.renderMode7With3D(
      this.trackTexture.getCanvas(),
      this.trackTexture.getHeightMap()
    );

    // Render vehicle sprite (rear view) at screen center bottom
    this.ctx.save();
    const vehicleScreenX = this.canvas.width / 2;
    const vehicleScreenY = this.canvas.height - 150;
    this.ctx.drawImage(
      this.vehicleSpriteCanvas,
      vehicleScreenX - this.vehicleSpriteCanvas.width / 2,
      vehicleScreenY - this.vehicleSpriteCanvas.height / 2
    );
    this.ctx.restore();

    // Update exhaust emitter positions to follow vehicle sprite
    this.particles.updateEmitter('exhaustLeft', {
      x: vehicleScreenX - 20,
      y: vehicleScreenY + 20,
    });
    this.particles.updateEmitter('exhaustRight', {
      x: vehicleScreenX + 20,
      y: vehicleScreenY + 20,
    });
    this.particles.update(1 / 60);
    this.particles.render(this.ctx);

    // HUD update and render
    this.hud.update({
      speed: this.vehicle.speed,
      maxSpeed: this.vehicle.maxSpeed,
      boost: 0,
      maxBoost: 100,
      position: 1,
      lap: this.state.currentLap,
      totalLaps: this.state.totalLaps,
      time: this.state.lapTime,
    });
    this.hud.render(this.ctx, this.canvas.width, this.canvas.height);

    // Minimap and debug info remain below (optional)
    // Draw collision indicator
    if (this.state.isHittingWall) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      this.ctx.lineWidth = 10;
      this.ctx.strokeRect(
        5,
        5,
        this.canvas.width - 10,
        this.canvas.height - 10
      );
      this.ctx.restore();
    }

    // Render HUD
    // this.renderHUD(); // This line is commented out as per the edit hint

    // Always render minimap
    // this.renderMinimap(); // This line is commented out as per the edit hint

    // Render debug info if enabled
    if (this.debugMode) {
      this.renderDebugInfo();
    }
  }

  private renderHUD(): void {
    // Steampunk HUD
    this.ctx.save();

    // Top left panel - brass plate
    const panelGradient = this.ctx.createLinearGradient(0, 0, 220, 120);
    panelGradient.addColorStop(0, 'rgba(139, 105, 20, 0.9)');
    panelGradient.addColorStop(0.5, 'rgba(205, 127, 50, 0.9)');
    panelGradient.addColorStop(1, 'rgba(139, 105, 20, 0.9)');
    this.ctx.fillStyle = panelGradient;
    this.ctx.fillRect(5, 5, 220, 120);

    // Panel border with metallic effect
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(5, 5, 220, 120);

    // Inner border
    this.ctx.strokeStyle = '#8b6914';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, 10, 210, 110);

    // Decorative corner pieces
    this.ctx.fillStyle = '#cd7f32';
    const corners = [
      [5, 5],
      [220, 5],
      [5, 120],
      [220, 120],
    ];
    corners.forEach(([x, y]) => {
      this.ctx.beginPath();
      this.ctx.arc(x + 5, y + 5, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#654321';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });

    // Rivets with shadow effect
    this.ctx.fillStyle = '#ffd700';
    const rivetPositions = [
      [20, 20],
      [210, 20],
      [20, 110],
      [210, 110],
    ];
    rivetPositions.forEach(([x, y]) => {
      // Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(x + 1, y + 1, 3, 0, Math.PI * 2);
      this.ctx.fill();
      // Rivet
      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      // Highlight
      this.ctx.fillStyle = '#ffff00';
      this.ctx.beginPath();
      this.ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Speed gauge background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(25, 30, 180, 25);

    // Speed text with engraved effect
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 18px Georgia';
    this.ctx.fillText('VELOCITY', 30, 48);

    // Speed value with gauge
    const speedPercent = this.vehicle.speed / this.vehicle.maxSpeed;
    this.ctx.fillStyle = '#8b0000';
    this.ctx.fillRect(110, 35, speedPercent * 90, 15);

    // Speed number
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.fillText(`${Math.round(this.vehicle.speed)} KPH`, 115, 48);

    // Chronometer background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(25, 65, 180, 25);

    // Time text
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 18px Georgia';
    this.ctx.fillText('CHRONOMETER', 30, 83);

    // Lap time with brass numbers
    const lapSeconds = Math.floor(this.state.lapTime);
    const lapMinutes = Math.floor(lapSeconds / 60);
    const lapSecs = lapSeconds % 60;
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.fillText(
      `${lapMinutes}:${lapSecs.toString().padStart(2, '0')}`,
      145,
      83
    );

    // Track indicator with gear decoration
    this.ctx.fillStyle = '#cd7f32';
    this.ctx.beginPath();
    this.ctx.arc(40, 105, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = 40 + Math.cos(angle) * 10;
      const y = 105 + Math.sin(angle) * 10;
      this.ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    // Track type and lap info
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 14px Georgia';
    this.ctx.fillText(
      `CIRCUIT: ${this.state.currentTrack.toUpperCase()}`,
      55,
      108
    );

    // Lap counter on the right side
    const lapPanelGradient = this.ctx.createLinearGradient(
      this.canvas.width - 150,
      0,
      this.canvas.width - 5,
      100
    );
    lapPanelGradient.addColorStop(0, 'rgba(139, 105, 20, 0.9)');
    lapPanelGradient.addColorStop(0.5, 'rgba(205, 127, 50, 0.9)');
    lapPanelGradient.addColorStop(1, 'rgba(139, 105, 20, 0.9)');
    this.ctx.fillStyle = lapPanelGradient;
    this.ctx.fillRect(this.canvas.width - 150, 5, 145, 80);

    // Lap panel border
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.canvas.width - 150, 5, 145, 80);

    // Lap text
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 20px Georgia';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LAP', this.canvas.width - 77.5, 35);

    // Lap number
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 32px monospace';
    this.ctx.fillText(
      `${this.state.currentLap}/${this.state.totalLaps}`,
      this.canvas.width - 77.5,
      65
    );

    // Best lap time
    if (this.state.bestLapTime !== Infinity) {
      this.ctx.fillStyle = '#000000';
      this.ctx.font = 'bold 12px Georgia';
      this.ctx.fillText(
        `BEST: ${this.state.bestLapTime.toFixed(2)}s`,
        this.canvas.width - 77.5,
        78
      );
    }

    this.ctx.textAlign = 'left';

    // Controls instruction plate at bottom
    const bottomGradient = this.ctx.createLinearGradient(
      0,
      this.canvas.height - 35,
      0,
      this.canvas.height - 5
    );
    bottomGradient.addColorStop(0, 'rgba(139, 105, 20, 0.8)');
    bottomGradient.addColorStop(1, 'rgba(205, 127, 50, 0.8)');
    this.ctx.fillStyle = bottomGradient;
    this.ctx.fillRect(5, this.canvas.height - 35, this.canvas.width - 10, 30);

    // Control text with engraved effect
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 14px Georgia';
    this.ctx.fillText(
      'CONTROLS: Arrows - Drive | P - Pause | T - Track | D - Debug | M - Mute',
      15,
      this.canvas.height - 15
    );

    // Paused indicator
    if (this.state.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 48px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        'PAUSED',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
      this.ctx.textAlign = 'left';
    }

    this.ctx.restore();
  }

  private renderMinimap(): void {
    this.ctx.save();

    // Get current vehicle texture position
    const worldToTextureScale = 0.354;
    const textureX = this.vehicle.position.x * worldToTextureScale + 1024;
    const textureY = this.vehicle.position.y * worldToTextureScale + 1024;

    // Mini-map in top right
    const miniMapSize = 150;
    const miniMapX = this.canvas.width - miniMapSize - 10;
    const miniMapY = 10;

    // Mini-map background with steampunk frame
    const frameGradient = this.ctx.createLinearGradient(
      miniMapX - 5,
      miniMapY - 5,
      miniMapX + miniMapSize + 5,
      miniMapY + miniMapSize + 5
    );
    frameGradient.addColorStop(0, 'rgba(139, 105, 20, 0.9)');
    frameGradient.addColorStop(0.5, 'rgba(205, 127, 50, 0.9)');
    frameGradient.addColorStop(1, 'rgba(139, 105, 20, 0.9)');
    this.ctx.fillStyle = frameGradient;
    this.ctx.fillRect(
      miniMapX - 5,
      miniMapY - 5,
      miniMapSize + 10,
      miniMapSize + 10
    );

    // Draw scaled track texture
    this.ctx.save();
    this.ctx.translate(miniMapX, miniMapY);
    this.ctx.scale(miniMapSize / 2048, miniMapSize / 2048);
    this.ctx.drawImage(this.trackTexture.getCanvas(), 0, 0);
    this.ctx.restore();

    // Draw vehicle position on mini-map
    const miniVehicleX = miniMapX + (textureX / 2048) * miniMapSize;
    const miniVehicleY = miniMapY + (textureY / 2048) * miniMapSize;

    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(miniVehicleX, miniVehicleY, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw vehicle direction indicator
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(miniVehicleX, miniVehicleY);
    this.ctx.lineTo(
      miniVehicleX - Math.sin(this.vehicle.rotation) * 10,
      miniVehicleY + Math.cos(this.vehicle.rotation) * 10
    );
    this.ctx.stroke();

    this.ctx.restore();
  }

  private renderDebugInfo(): void {
    this.ctx.save();

    // Debug panel background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(10, this.canvas.height / 2 - 100, 250, 200);

    // Debug text
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px monospace';
    let y = this.canvas.height / 2 - 80;
    const lineHeight = 20;

    // Vehicle world position
    this.ctx.fillText(
      `Vehicle World Pos: (${this.vehicle.position.x.toFixed(0)}, ${this.vehicle.position.y.toFixed(0)})`,
      20,
      y
    );
    y += lineHeight;

    // Texture coordinates
    const worldToTextureScale = 0.354;
    const textureX = Math.floor(
      this.vehicle.position.x * worldToTextureScale + 2048
    );
    const textureY = Math.floor(
      this.vehicle.position.y * worldToTextureScale + 2048
    );
    this.ctx.fillText(`Texture Coords: (${textureX}, ${textureY})`, 20, y);
    y += lineHeight;

    // Surface type
    if (textureX >= 0 && textureX < 2048 && textureY >= 0 && textureY < 2048) {
      const surface = this.trackTexture.getSurfaceAt(textureX, textureY);
      this.ctx.fillText(`Surface: ${surface}`, 20, y);
    } else {
      this.ctx.fillText('Surface: OUT OF BOUNDS', 20, y);
    }
    y += lineHeight;

    // Camera info
    const camera = this.mode7Renderer.getCamera();
    this.ctx.fillText(
      `Camera Pos: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)})`,
      20,
      y
    );
    y += lineHeight;
    this.ctx.fillText(
      `Camera Angle: ${((camera.angle * 180) / Math.PI).toFixed(1)}°`,
      20,
      y
    );
    y += lineHeight;

    // Speed and rotation
    this.ctx.fillText(`Speed: ${this.vehicle.speed.toFixed(1)}`, 20, y);
    y += lineHeight;
    this.ctx.fillText(
      `Rotation: ${((this.vehicle.rotation * 180) / Math.PI).toFixed(1)}°`,
      20,
      y
    );
    y += lineHeight;

    // Collision state
    this.ctx.fillText(
      `Wall Hit: ${this.state.isHittingWall ? 'YES' : 'NO'}`,
      20,
      y
    );
    this.ctx.fillStyle = this.state.isHittingWall ? '#ff0000' : '#00ff00';

    this.ctx.restore();
  }

  // Public methods for external control
  handleKeyPress(key: string): void {
    switch (key.toLowerCase()) {
      case 'p':
        this.pause();
        break;
      case 't':
        this.switchTrack();
        break;
      case 'd':
        this.debugMode = !this.debugMode;
        console.log('Debug mode:', this.debugMode ? 'ON' : 'OFF');
        break;
      case 'm':
        // Toggle mute
        this.audioManager.setMuted(!this.audioManager['config'].muted);
        console.log(
          'Audio:',
          this.audioManager['config'].muted ? 'MUTED' : 'ON'
        );
        break;
    }
  }
}
