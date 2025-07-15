/**
 * Example of how to integrate the Track system into your game
 */

import { Mode7Renderer } from '../rendering/Mode7Renderer';
import { Track, TrackRenderer, CollisionResult } from './index';

// Example game integration
class RacingGame {
  private mode7Renderer: Mode7Renderer;
  private trackRenderer: TrackRenderer;
  private track: Track;
  
  // Player state
  private playerDistance: number = 0;
  private playerLateralPosition: number = 0;
  private playerSpeed: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    // Initialize renderers
    this.mode7Renderer = new Mode7Renderer(canvas);
    this.trackRenderer = new TrackRenderer(this.mode7Renderer);
    
    // Create a track (you can switch between different tracks)
    this.track = Track.createOvalTrack(2000, 800, 300);
  }
  
  update(deltaTime: number): void {
    // Update player position
    this.playerDistance += this.playerSpeed * deltaTime;
    
    // Loop back to start if we've completed the track
    if (this.playerDistance > this.track.getLength()) {
      this.playerDistance -= this.track.getLength();
    }
    
    // Get current position on track
    const trackPosition = this.track.getPositionOnTrack(this.playerDistance);
    const playerWorldPos = {
      x: trackPosition.x + this.playerLateralPosition,
      y: trackPosition.y
    };
    
    // Check for collisions
    const collision = this.track.checkCollision(playerWorldPos);
    
    if (collision.collision) {
      // Handle collision - bounce back, slow down, etc.
      this.handleCollision(collision);
    }
    
    // Update camera to follow player
    this.mode7Renderer.setCameraPosition(playerWorldPos.x, playerWorldPos.y);
    
    // You can also adjust camera angle based on track direction
    // const trackDirection = this.getTrackDirection(this.playerDistance);
    // this.mode7Renderer.setCameraAngle(trackDirection);
  }
  
  render(): void {
    // Clear screen
    this.mode7Renderer.clear();
    
    // Render background/horizon
    this.mode7Renderer.renderHorizon();
    
    // Render the track
    this.trackRenderer.render(this.track, this.playerDistance, {
      roadColor: '#2a2a2a',
      borderColor: '#e94560',
      centerLineColor: '#ffd93d',
      borderWidth: 20,
      showCenterLine: true,
      segments: 40
    });
    
    // Render other game objects (vehicles, obstacles, etc.)
    // this.renderVehicles();
    // this.renderObstacles();
    
    // Render UI
    this.renderUI();
  }
  
  private handleCollision(collision: CollisionResult): void {
    if (collision.side === 'left') {
      // Bounce off left wall
      this.playerLateralPosition += collision.penetration! + 10;
      this.playerSpeed *= 0.7; // Slow down
    } else if (collision.side === 'right') {
      // Bounce off right wall
      this.playerLateralPosition -= collision.penetration! + 10;
      this.playerSpeed *= 0.7; // Slow down
    }
  }
  
  private renderUI(): void {
    const ctx = this.mode7Renderer.getContext();
    ctx.save();
    
    // Speed meter
    ctx.fillStyle = 'white';
    ctx.font = '20px monospace';
    ctx.fillText(`Speed: ${Math.floor(this.playerSpeed)}`, 10, 30);
    
    // Distance
    ctx.fillText(`Distance: ${Math.floor(this.playerDistance)}`, 10, 60);
    
    ctx.restore();
  }
  
  // Public methods for game control
  accelerate(): void {
    this.playerSpeed = Math.min(this.playerSpeed + 50, 500);
  }
  
  brake(): void {
    this.playerSpeed = Math.max(this.playerSpeed - 100, 0);
  }
  
  steerLeft(): void {
    this.playerLateralPosition -= 5;
  }
  
  steerRight(): void {
    this.playerLateralPosition += 5;
  }
}

// Example usage:
/*
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const game = new RacingGame(canvas);

// Game loop
function gameLoop(timestamp: number): void {
  const deltaTime = timestamp / 1000; // Convert to seconds
  
  game.update(deltaTime);
  game.render();
  
  requestAnimationFrame(gameLoop);
}

// Input handling
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp': game.accelerate(); break;
    case 'ArrowDown': game.brake(); break;
    case 'ArrowLeft': game.steerLeft(); break;
    case 'ArrowRight': game.steerRight(); break;
  }
});

// Start the game
requestAnimationFrame(gameLoop);
*/