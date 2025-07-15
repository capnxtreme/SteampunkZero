import { Vehicle } from '../entities/Vehicle';

export interface KeyBindings {
  left: string;
  right: string;
  up: string;
  down: string;
}

export class VehicleController {
  vehicle: Vehicle;
  keys: KeyBindings;
  private pressedKeys: Set<string>;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;

  constructor(vehicle: Vehicle, keys?: KeyBindings) {
    this.vehicle = vehicle;
    this.keys = keys || {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown'
    };
    this.pressedKeys = new Set<string>();
    
    // Bind event handlers to preserve 'this' context
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
  }

  handleKeyDown(event: KeyboardEvent): void {
    const key = event.key;
    
    // Check if this is one of our control keys
    if (Object.values(this.keys).includes(key)) {
      event.preventDefault();
      this.pressedKeys.add(key);
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    const key = event.key;
    this.pressedKeys.delete(key);
  }

  isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }

  update(deltaTime: number): void {
    // Handle acceleration/deceleration
    if (this.isKeyPressed(this.keys.up)) {
      this.vehicle.accelerate(this.vehicle.acceleration * deltaTime);
    } else if (this.isKeyPressed(this.keys.down)) {
      this.vehicle.decelerate(this.vehicle.acceleration * deltaTime);
    } else {
      // Apply friction when no acceleration keys are pressed
      this.vehicle.applyFriction(deltaTime);
    }

    // Handle steering
    if (this.isKeyPressed(this.keys.left)) {
      this.vehicle.steerLeft(deltaTime);
    }
    if (this.isKeyPressed(this.keys.right)) {
      this.vehicle.steerRight(deltaTime);
    }

    // Note: vehicle.update() is called by the game loop, not here
  }

  attach(): void {
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.boundHandleKeyDown);
    window.removeEventListener('keyup', this.boundHandleKeyUp);
    this.pressedKeys.clear();
  }
}