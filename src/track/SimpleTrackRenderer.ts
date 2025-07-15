import { Mode7Renderer } from '../rendering/Mode7Renderer';
import { Track } from './Track';

export class SimpleTrackRenderer {
  constructor(private mode7Renderer: Mode7Renderer) {}

  render(track: Track): void {
    const ctx = this.mode7Renderer.getContext();
    const camera = this.mode7Renderer.getCamera();
    
    ctx.save();
    
    // Draw track from camera position forward
    const startDist = Math.max(0, camera.y - 50);
    const endDist = Math.min(track.getLength(), camera.y + 500);
    
    // Draw track segments every 10 units
    for (let dist = startDist; dist < endDist; dist += 10) {
      const pos = track.getPositionOnTrack(dist);
      const boundaries = track.getBoundariesAt(pos);
      
      if (!boundaries) continue;
      
      // Convert to screen coordinates
      const leftScreen = this.mode7Renderer.worldToScreen(boundaries.left);
      const rightScreen = this.mode7Renderer.worldToScreen(boundaries.right);
      const centerScreen = this.mode7Renderer.worldToScreen(pos);
      
      // Only draw if visible
      if (leftScreen.y > 0 && leftScreen.y < ctx.canvas.height) {
        // Draw road edges
        ctx.strokeStyle = '#8b7355'; // Brass color
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leftScreen.x, leftScreen.y);
        ctx.lineTo(rightScreen.x, rightScreen.y);
        ctx.stroke();
        
        // Draw road surface (filled trapezoid)
        if (dist + 10 < endDist) {
          const nextPos = track.getPositionOnTrack(dist + 10);
          const nextBoundaries = track.getBoundariesAt(nextPos);
          if (nextBoundaries) {
            const nextLeftScreen = this.mode7Renderer.worldToScreen(nextBoundaries.left);
            const nextRightScreen = this.mode7Renderer.worldToScreen(nextBoundaries.right);
            
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(leftScreen.x, leftScreen.y);
            ctx.lineTo(rightScreen.x, rightScreen.y);
            ctx.lineTo(nextRightScreen.x, nextRightScreen.y);
            ctx.lineTo(nextLeftScreen.x, nextLeftScreen.y);
            ctx.closePath();
            ctx.fill();
          }
        }
        
        // Draw center line (dashed)
        if (Math.floor(dist / 20) % 2 === 0) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerScreen.x - 3, centerScreen.y);
          ctx.lineTo(centerScreen.x + 3, centerScreen.y);
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  }
}