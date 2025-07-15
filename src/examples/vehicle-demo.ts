import { Vehicle } from '../entities/Vehicle';
import { VehicleController } from '../controllers/VehicleController';
import { VehicleSprite } from '../entities/VehicleSprite';

// Create a simple demo of the vehicle system
export class VehicleDemo {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private vehicle: Vehicle;
  private controller: VehicleController;
  private sprite: VehicleSprite;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context');
    }
    this.context = context;

    // Initialize vehicle at center of canvas
    this.vehicle = new Vehicle({
      x: canvas.width / 2,
      y: canvas.height / 2,
    });

    // Create controller with default arrow keys
    this.controller = new VehicleController(this.vehicle);
    this.controller.attach();

    // Create sprite with default color
    this.sprite = new VehicleSprite(this.vehicle);
  }

  start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update
    this.controller.update(deltaTime);

    // Keep vehicle on screen (wrap around)
    const { position } = this.vehicle;
    if (position.x < 0) position.x = this.canvas.width;
    if (position.x > this.canvas.width) position.x = 0;
    if (position.y < 0) position.y = this.canvas.height;
    if (position.y > this.canvas.height) position.y = 0;

    // Render
    this.render();

    // Continue loop
    requestAnimationFrame(this.gameLoop);
  };

  private render(): void {
    // Clear canvas
    this.context.fillStyle = '#1a1a1a';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw vehicle
    this.sprite.render(this.context);

    // Draw info
    this.context.fillStyle = '#ffffff';
    this.context.font = '16px monospace';
    this.context.fillText(`Speed: ${Math.round(this.vehicle.speed)}`, 10, 30);
    this.context.fillText(
      `Rotation: ${Math.round((this.vehicle.rotation * 180) / Math.PI)}°`,
      10,
      50
    );
    this.context.fillText(
      'Use arrow keys to control',
      10,
      this.canvas.height - 20
    );
  }

  destroy(): void {
    this.controller.detach();
  }
}

// Export a function to create and start the demo
export function createVehicleDemo(canvasId: string): VehicleDemo | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`Canvas with id "${canvasId}" not found`);
    return null;
  }

  const demo = new VehicleDemo(canvas);
  demo.start();
  return demo;
}
