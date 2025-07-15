import { Mode7Renderer } from './rendering/Mode7Renderer.js';
import { Mode7Texture } from './rendering/Mode7Texture.js';
import { Track } from './track/Track.js';
import { TrackRenderer } from './track/TrackRenderer.js';
import { Vehicle } from './entities/Vehicle.js';
import { VehicleController } from './controllers/VehicleController.js';
import { VehicleSprite } from './entities/VehicleSprite.js';

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  currentTrack: 'straight' | 'oval';
  lapTime: number;
  bestLapTime: number;
}

export class SteampunkRacer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode7Renderer: Mode7Renderer;
  private mode7Texture: Mode7Texture;
  private track: Track;
  private trackRenderer: TrackRenderer;
  private vehicle: Vehicle;
  private vehicleController: VehicleController;
  private vehicleSprite: VehicleSprite;
  
  private state: GameState;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FIXED_TIMESTEP: number = 1000 / 60; // 60 FPS physics
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    
    // Initialize renderers
    this.mode7Renderer = new Mode7Renderer(canvas);
    
    // Create Mode 7 texture
    this.mode7Texture = new Mode7Texture(512, 512);
    this.mode7Texture.drawRoadTexture(200);
    
    // Create straight track by default (easier to see in Mode 7)
    this.track = Track.createStraightTrack(1000, 200);
    this.trackRenderer = new TrackRenderer(this.mode7Renderer);
    
    // Create player vehicle
    const startPos = this.track.getPositionOnTrack(0);
    this.vehicle = new Vehicle(startPos);
    this.vehicle.rotation = 0; // Face forward on track (0 = up after adjustment)
    
    // Set up controls
    this.vehicleController = new VehicleController(this.vehicle);
    
    // Create vehicle sprite
    this.vehicleSprite = new VehicleSprite(this.vehicle, '#c9302c'); // Steampunk red
    
    // Initialize game state
    this.state = {
      isRunning: false,
      isPaused: false,
      currentTrack: 'straight',
      lapTime: 0,
      bestLapTime: Infinity
    };
  }
  
  start(): void {
    if (this.state.isRunning) return;
    
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
  }
  
  pause(): void {
    this.state.isPaused = !this.state.isPaused;
  }
  
  switchTrack(): void {
    if (this.state.currentTrack === 'oval') {
      this.track = Track.createStraightTrack(800, 100);
      this.state.currentTrack = 'straight';
      // Regenerate texture for straight track
      this.mode7Texture.drawRoadTexture(100);
    } else {
      this.track = Track.createOvalTrack(600, 300, 120);
      this.state.currentTrack = 'oval';
      // Regenerate texture for oval track
      this.mode7Texture.drawRoadTexture(120);
    }
    this.trackRenderer = new TrackRenderer(this.mode7Renderer);
    
    // Reset vehicle position
    const startPos = this.track.getPositionOnTrack(0);
    this.vehicle.position = { ...startPos };
    this.vehicle.rotation = 0;
    this.vehicle.speed = 0;
  }
  
  private gameLoop = (): void => {
    if (!this.state.isRunning) return;
    
    const currentTime = performance.now();
    const frameTime = this.lastTime === 0 ? 0 : Math.min(currentTime - this.lastTime, 250); // Cap at 250ms
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
    const interpolation = this.accumulator / this.FIXED_TIMESTEP;
    this.render(interpolation);
    
    requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number): void {
    // Update vehicle controller (processes input)
    this.vehicleController.update(deltaTime);
    
    // Update vehicle physics
    this.vehicle.update(deltaTime);
    
    // Check track boundaries
    const collision = this.track.checkCollision(this.vehicle.position);
    
    if (collision.collision) {
      // Simple collision response - reduce speed and push away from boundary
      this.vehicle.speed *= 0.5;
      
      if (collision.side === 'left') {
        this.vehicle.position.x += 5;
      } else if (collision.side === 'right') {
        this.vehicle.position.x -= 5;
      }
    }
    
    // Update camera to follow vehicle
    this.updateCamera();
    
    // Update lap time
    this.state.lapTime += deltaTime;
  }
  
  private updateCamera(): void {
    // Camera follows behind the vehicle
    const cameraDistance = 100; // Distance behind vehicle
    const cameraHeight = 80; // Camera height for Mode 7 effect
    
    // Position camera behind the vehicle based on vehicle's rotation
    const cameraX = this.vehicle.position.x + Math.sin(this.vehicle.rotation) * cameraDistance;
    const cameraY = this.vehicle.position.y - Math.cos(this.vehicle.rotation) * cameraDistance;
    
    this.mode7Renderer.setCameraPosition(cameraX, cameraY);
    this.mode7Renderer.setCameraAngle(this.vehicle.rotation); // Look in vehicle's direction
    this.mode7Renderer.setCameraHeight(cameraHeight);
  }
  
  private render(interpolation: number): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render Mode 7 horizon
    this.mode7Renderer.renderHorizon();
    
    // Render Mode 7 ground with texture
    this.mode7Renderer.renderMode7(this.mode7Texture.getCanvas());
    
    // Render vehicle
    const screenPos = this.mode7Renderer.worldToScreen(this.vehicle.position);
    
    // Debug output (only log occasionally to avoid spam)
    if (Math.random() < 0.01) {
      console.log('Vehicle state:', {
        position: this.vehicle.position,
        rotation: (this.vehicle.rotation * 180 / Math.PI).toFixed(1) + '°',
        speed: this.vehicle.speed.toFixed(1),
        camera: this.mode7Renderer.getCamera()
      });
    }
    
    // Draw vehicle at fixed position, facing into the screen
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height - 150);
    this.ctx.scale(1.5, 1.5);
    
    // Draw vehicle shadow (wider at bottom for perspective)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.moveTo(-15, -20); // top left
    this.ctx.lineTo(15, -20);  // top right
    this.ctx.lineTo(20, 15);   // bottom right
    this.ctx.lineTo(-20, 15);  // bottom left
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw vehicle body (trapezoid shape for perspective)
    this.ctx.fillStyle = '#c9302c';
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 2;
    
    // Vehicle body - wider at bottom, narrower at top (facing into screen)
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -20);  // top left (front of car)
    this.ctx.lineTo(10, -20);   // top right (front of car)
    this.ctx.lineTo(15, 15);    // bottom right (rear of car)
    this.ctx.lineTo(-15, 15);   // bottom left (rear of car)
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Windshield (at front/top of car)
    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    this.ctx.beginPath();
    this.ctx.moveTo(-8, -18);
    this.ctx.lineTo(8, -18);
    this.ctx.lineTo(6, -10);
    this.ctx.lineTo(-6, -10);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Engine details (stripes on hood)
    this.ctx.strokeStyle = '#8B0000';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(-4, -15);
    this.ctx.lineTo(-5, -5);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(4, -15);
    this.ctx.lineTo(5, -5);
    this.ctx.stroke();
    
    this.ctx.restore();
    
    // Render HUD
    this.renderHUD();
  }
  
  private renderHUD(): void {
    // Speed meter
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText(`Speed: ${Math.round(this.vehicle.speed)}`, 10, 30);
    
    // Lap time
    const lapSeconds = Math.floor(this.state.lapTime);
    const lapMinutes = Math.floor(lapSeconds / 60);
    const lapSecs = lapSeconds % 60;
    this.ctx.fillText(`Time: ${lapMinutes}:${lapSecs.toString().padStart(2, '0')}`, 10, 60);
    
    // Track type
    this.ctx.fillText(`Track: ${this.state.currentTrack}`, 10, 90);
    
    // Controls
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Controls: Arrow keys to drive, P to pause, T to switch track', 10, this.canvas.height - 10);
    
    // Paused indicator
    if (this.state.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 48px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.textAlign = 'left';
    }
    
    this.ctx.restore();
  }
  
  // Public methods for external control
  handleKeyPress(key: string): void {
    switch(key.toLowerCase()) {
      case 'p':
        this.pause();
        break;
      case 't':
        this.switchTrack();
        break;
    }
  }
}