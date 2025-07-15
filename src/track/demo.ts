import { Mode7Renderer } from '../rendering/Mode7Renderer';
import { Track } from './Track';
import { TrackRenderer } from './TrackRenderer';

// Demo: Track System with Mode7 Renderer
export function createTrackDemo(canvas: HTMLCanvasElement): void {
  // Initialize Mode7 renderer
  const mode7Renderer = new Mode7Renderer(canvas);
  const trackRenderer = new TrackRenderer(mode7Renderer);
  
  // Create different track types
  const straightTrack = Track.createStraightTrack(2000, 300);
  const ovalTrack = Track.createOvalTrack(1000, 600, 250);
  
  // Demo state
  let currentTrack = straightTrack;
  let cameraDistance = 0;
  let cameraX = 0;
  let trackType: 'straight' | 'oval' = 'straight';
  
  // Animation loop
  function animate(): void {
    // Clear the canvas
    mode7Renderer.clear();
    
    // Render horizon
    mode7Renderer.renderHorizon();
    
    // Update camera position (move forward along track)
    cameraDistance += 2;
    if (cameraDistance > currentTrack.getLength()) {
      cameraDistance = 0;
    }
    
    // Get position on track
    const trackPosition = currentTrack.getPositionOnTrack(cameraDistance);
    
    // Simulate some lateral movement for oval track
    if (trackType === 'oval') {
      const angle = (cameraDistance / currentTrack.getLength()) * Math.PI * 2;
      cameraX = Math.sin(angle) * 50;
    }
    
    // Update camera
    mode7Renderer.setCameraPosition(trackPosition.x + cameraX, trackPosition.y);
    mode7Renderer.setCameraHeight(100);
    
    // Render the track
    trackRenderer.render(currentTrack, cameraDistance, {
      roadColor: '#1a1a1a',
      borderColor: '#ff6b6b',
      centerLineColor: '#ffd93d',
      borderWidth: 15,
      showCenterLine: true,
      segments: 30
    });
    
    // Check collision (for demo purposes)
    const playerPosition = { 
      x: trackPosition.x + cameraX, 
      y: trackPosition.y 
    };
    const collision = currentTrack.checkCollision(playerPosition);
    
    // Draw UI info
    const ctx = mode7Renderer.getContext();
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`Track: ${trackType}`, 10, 30);
    ctx.fillText(`Distance: ${Math.floor(cameraDistance)}/${currentTrack.getLength()}`, 10, 50);
    ctx.fillText(`Collision: ${collision.collision ? `YES - ${collision.side}` : 'NO'}`, 10, 70);
    if (!collision.collision) {
      ctx.fillText(`Distance to left: ${collision.distanceToLeft?.toFixed(1)}`, 10, 90);
      ctx.fillText(`Distance to right: ${collision.distanceToRight?.toFixed(1)}`, 10, 110);
    }
    ctx.fillText('Press SPACE to switch tracks', 10, canvas.height - 20);
    ctx.restore();
    
    requestAnimationFrame(animate);
  }
  
  // Handle keyboard input
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      // Switch between track types
      if (trackType === 'straight') {
        currentTrack = ovalTrack;
        trackType = 'oval';
      } else {
        currentTrack = straightTrack;
        trackType = 'straight';
      }
      cameraDistance = 0;
      cameraX = 0;
    }
  });
  
  // Start animation
  animate();
}

// Function to run the demo
export function runTrackDemo(): void {
  // Create or get canvas
  let canvas = document.getElementById('trackCanvas') as HTMLCanvasElement;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'trackCanvas';
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.border = '1px solid #333';
    document.body.appendChild(canvas);
  }
  
  createTrackDemo(canvas);
}