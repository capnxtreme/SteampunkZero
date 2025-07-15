import { Vehicle, Bounds } from './Vehicle';

export class VehicleSprite {
  vehicle: Vehicle;
  color: string;

  constructor(vehicle: Vehicle, color: string = '#FF6B6B') {
    this.vehicle = vehicle;
    this.color = color;
  }

  render(context: CanvasRenderingContext2D): void {
    const { position, rotation, width, height } = this.vehicle;

    // Save context state
    context.save();

    // Transform to vehicle position and rotation
    context.translate(position.x, position.y);
    context.rotate(rotation);

    // Set styles
    context.fillStyle = this.color;
    context.strokeStyle = '#333333';
    context.lineWidth = 2;

    // Draw vehicle body as a pointed rectangle (like a car seen from above)
    context.beginPath();

    // Main body
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Start from rear left
    context.moveTo(-halfWidth, -halfHeight);
    // To front left
    context.lineTo(halfWidth * 0.6, -halfHeight);
    // To front point
    context.lineTo(halfWidth, 0);
    // To front right
    context.lineTo(halfWidth * 0.6, halfHeight);
    // To rear right
    context.lineTo(-halfWidth, halfHeight);
    // Close path
    context.closePath();

    // Fill and stroke
    context.fill();
    context.stroke();

    // Draw direction indicator (windshield)
    context.fillStyle = 'rgba(100, 100, 100, 0.5)';
    context.beginPath();
    context.moveTo(halfWidth * 0.3, -halfHeight * 0.6);
    context.lineTo(halfWidth * 0.6, -halfHeight * 0.6);
    context.lineTo(halfWidth * 0.6, halfHeight * 0.6);
    context.lineTo(halfWidth * 0.3, halfHeight * 0.6);
    context.closePath();
    context.fill();

    // Restore context state
    context.restore();
  }

  setColor(color: string): void {
    this.color = color;
  }

  getBounds(): Bounds {
    return this.vehicle.getBounds();
  }
}
