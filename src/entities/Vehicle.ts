export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Vehicle {
  position: Position;
  rotation: number;
  speed: number;
  maxSpeed: number;
  turnSpeed: number;
  acceleration: number;
  friction: number;
  width: number;
  height: number;

  constructor(initialPosition: Position = { x: 0, y: 0 }) {
    this.position = { ...initialPosition };
    this.rotation = 0; // 0 = facing up/forward (+Y direction)
    this.speed = 0;
    this.maxSpeed = 300; // pixels per second
    this.turnSpeed = Math.PI * 1.5; // radians per second
    this.acceleration = 200; // pixels per second squared
    this.friction = 100; // pixels per second squared
    this.width = 32;
    this.height = 16;
  }

  update(deltaTime: number): void {
    // Update position based on current speed and rotation
    // In our game: rotation = 0 means facing "forward" which is +Y (down the track)
    // Canvas coordinates: +X is right, +Y is down
    // Rotation increases clockwise: 0=down, 90°=left, 180°=up, 270°=right
    // Need to negate sin for X to get correct left/right movement
    const velocityX = -Math.sin(this.rotation) * this.speed;
    const velocityY = Math.cos(this.rotation) * this.speed;

    this.position.x += velocityX * deltaTime;
    this.position.y += velocityY * deltaTime;
  }

  accelerate(amount: number): void {
    this.speed += amount;
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
  }

  decelerate(amount: number): void {
    this.speed -= amount;
    if (this.speed < 0) {
      this.speed = 0;
    }
  }

  applyFriction(deltaTime: number): void {
    if (this.speed > 0) {
      this.speed -= this.friction * deltaTime;
      if (this.speed < 0) {
        this.speed = 0;
      }
    }
  }

  steerLeft(deltaTime: number): void {
    // Only allow steering when moving
    if (Math.abs(this.speed) > 10) {
      this.rotation -= this.turnSpeed * deltaTime * (Math.abs(this.speed) / this.maxSpeed);
    }
  }
  
  steerRight(deltaTime: number): void {
    // Only allow steering when moving
    if (Math.abs(this.speed) > 10) {
      this.rotation += this.turnSpeed * deltaTime * (Math.abs(this.speed) / this.maxSpeed);
    }
  }

  getBounds(): Bounds {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}
