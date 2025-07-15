import { Mode7Renderer, Point2D } from '../rendering/Mode7Renderer';
import { Track, TrackSegment } from './Track';

export interface TrackRenderOptions {
  roadColor?: string;
  borderColor?: string;
  centerLineColor?: string;
  borderWidth?: number;
  showCenterLine?: boolean;
  segments?: number; // Number of segments to render ahead
}

export class TrackRenderer {
  private mode7Renderer: Mode7Renderer;
  private defaultOptions: Required<TrackRenderOptions> = {
    roadColor: '#2a2a2a',
    borderColor: '#ffffff',
    centerLineColor: '#ffff00',
    borderWidth: 10,
    showCenterLine: true,
    segments: 50
  };

  constructor(mode7Renderer: Mode7Renderer) {
    this.mode7Renderer = mode7Renderer;
  }

  render(track: Track, cameraDistance: number, options?: TrackRenderOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    const ctx = this.mode7Renderer.getContext();
    const camera = this.mode7Renderer.getCamera();
    
    // Debug logging
    console.log('TrackRenderer.render called:', {
      camera,
      cameraDistance,
      trackLength: track.getLength()
    });
    
    // Save context state
    ctx.save();
    
    // Render track segments from far to near (back to front)
    const renderDistance = 500; // How far ahead to render
    const step = 5; // Distance between each rendered line
    
    let renderedLines = 0;
    for (let distance = renderDistance; distance > 0; distance -= step) {
      const worldDistance = camera.y + distance;
      
      // Get track position at this distance
      const centerPos = { x: camera.x, y: worldDistance };
      const boundaries = track.getBoundariesAt(centerPos);
      
      if (!boundaries) {
        console.log(`No boundaries at distance ${worldDistance}`);
        continue;
      }
      
      // Convert to screen coordinates
      const leftScreen = this.mode7Renderer.worldToScreen(boundaries.left);
      const rightScreen = this.mode7Renderer.worldToScreen(boundaries.right);
      const centerScreen = this.mode7Renderer.worldToScreen(centerPos);
      
      // Skip if off screen
      if (leftScreen.y < 0 || leftScreen.y > ctx.canvas.height) continue;
      
      // Draw road surface
      ctx.strokeStyle = opts.roadColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftScreen.x, leftScreen.y);
      ctx.lineTo(rightScreen.x, rightScreen.y);
      ctx.stroke();
      
      // Draw borders
      if (distance % 20 < step) {
        ctx.strokeStyle = opts.borderColor;
        ctx.lineWidth = 4;
        
        // Left border
        ctx.beginPath();
        ctx.moveTo(leftScreen.x - opts.borderWidth, leftScreen.y);
        ctx.lineTo(leftScreen.x, leftScreen.y);
        ctx.stroke();
        
        // Right border
        ctx.beginPath();
        ctx.moveTo(rightScreen.x, rightScreen.y);
        ctx.lineTo(rightScreen.x + opts.borderWidth, rightScreen.y);
        ctx.stroke();
      }
      
      // Draw center line dashes
      if (opts.showCenterLine && Math.floor(worldDistance / 40) % 2 === 0) {
        ctx.strokeStyle = opts.centerLineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerScreen.x - 5, centerScreen.y);
        ctx.lineTo(centerScreen.x + 5, centerScreen.y);
        ctx.stroke();
      }
      
      renderedLines++;
    }
    
    console.log(`Rendered ${renderedLines} track lines`);
    
    // Restore context state
    ctx.restore();
  }

  private renderTrackSegment(
    track: Track, 
    distance: number, 
    segmentLength: number,
    options: Required<TrackRenderOptions>,
    ctx: CanvasRenderingContext2D
  ): void {
    // Get track position and boundaries at this distance
    const position = track.getPositionOnTrack(distance);
    const boundaries = track.getBoundariesAt(position);
    
    if (!boundaries) {
      return;
    }
    
    // Convert world coordinates to screen coordinates
    const leftScreen = this.mode7Renderer.worldToScreen(boundaries.left);
    const rightScreen = this.mode7Renderer.worldToScreen(boundaries.right);
    const centerScreen = this.mode7Renderer.worldToScreen(position);
    
    // Only draw if visible on screen
    if (leftScreen.y < 0 || leftScreen.y > ctx.canvas.height) {
      return;
    }
    
    // Draw road as a horizontal line
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftScreen.x, leftScreen.y);
    ctx.lineTo(rightScreen.x, rightScreen.y);
    ctx.stroke();
    
    // Draw center line dashes
    if (options.showCenterLine && Math.floor(distance / 40) % 2 === 0) {
      ctx.strokeStyle = options.centerLineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerScreen.x - 10, centerScreen.y);
      ctx.lineTo(centerScreen.x + 10, centerScreen.y);
      ctx.stroke();
    }
  }

  private offsetPoint(point: Point2D, offset: number, isLeft: boolean): Point2D {
    // Simple offset - in a real implementation, this would consider track direction
    return {
      x: point.x + (isLeft ? offset : -offset),
      y: point.y
    };
  }

  private isOffScreen(
    leftNear: Point2D, 
    rightNear: Point2D, 
    leftFar: Point2D, 
    rightFar: Point2D,
    canvas: HTMLCanvasElement
  ): boolean {
    // Check if all points are outside screen bounds
    const allPoints = [leftNear, rightNear, leftFar, rightFar];
    const allLeft = allPoints.every(p => p.x < 0);
    const allRight = allPoints.every(p => p.x > canvas.width);
    const allAbove = allPoints.every(p => p.y < 0);
    const allBelow = allPoints.every(p => p.y > canvas.height);
    
    return allLeft || allRight || allAbove || allBelow;
  }

  private shouldDrawCenterLine(distance: number): boolean {
    // Draw dashed center line - visible every 40 units
    return Math.floor(distance / 40) % 2 === 0;
  }

  // Render track boundaries for debugging
  renderDebugBoundaries(track: Track, cameraDistance: number): void {
    const ctx = this.mode7Renderer.getContext();
    ctx.save();
    
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    
    const segments = track.getSegments();
    for (const segment of segments) {
      const leftScreen = this.mode7Renderer.worldToScreen(segment.leftBoundary);
      const rightScreen = this.mode7Renderer.worldToScreen(segment.rightBoundary);
      
      // Draw boundary markers
      ctx.beginPath();
      ctx.arc(leftScreen.x, leftScreen.y, 5, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(rightScreen.x, rightScreen.y, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }
}