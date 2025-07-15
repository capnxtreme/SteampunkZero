import { describe, it, expect, beforeEach } from 'vitest';
import { Vehicle } from './Vehicle';

describe('Vehicle', () => {
  let vehicle: Vehicle;

  beforeEach(() => {
    vehicle = new Vehicle();
  });

  describe('initialization', () => {
    it('should initialize with default position at origin', () => {
      expect(vehicle.position).toEqual({ x: 0, y: 0 });
    });

    it('should initialize with default rotation of 0', () => {
      expect(vehicle.rotation).toBe(0);
    });

    it('should initialize with default speed of 0', () => {
      expect(vehicle.speed).toBe(0);
    });

    it('should accept custom initial position', () => {
      const customVehicle = new Vehicle({ x: 100, y: 200 });
      expect(customVehicle.position).toEqual({ x: 100, y: 200 });
    });
  });

  describe('movement', () => {
    it('should update position based on speed and rotation', () => {
      vehicle.speed = 100;
      vehicle.rotation = 0; // Facing down (+Y direction)
      vehicle.update(0.016); // 16ms delta time

      expect(vehicle.position.x).toBeCloseTo(0);
      expect(vehicle.position.y).toBeCloseTo(1.6);
    });

    it('should move in the direction of rotation', () => {
      vehicle.speed = 100;
      vehicle.rotation = Math.PI / 2; // 90° = facing left (-X)
      vehicle.update(0.016);

      expect(vehicle.position.x).toBeCloseTo(-1.6); // Moving left
      expect(vehicle.position.y).toBeCloseTo(0);
    });
  });

  describe('acceleration', () => {
    it('should accelerate when accelerate() is called', () => {
      vehicle.accelerate(50);
      expect(vehicle.speed).toBe(50);
    });

    it('should respect maximum speed', () => {
      vehicle.accelerate(1000);
      expect(vehicle.speed).toBeLessThanOrEqual(vehicle.maxSpeed);
    });

    it('should decelerate when decelerate() is called', () => {
      vehicle.speed = 100;
      vehicle.decelerate(30);
      expect(vehicle.speed).toBe(70);
    });

    it('should not go below 0 speed when decelerating', () => {
      vehicle.speed = 20;
      vehicle.decelerate(50);
      expect(vehicle.speed).toBe(0);
    });

    it('should apply friction when no acceleration', () => {
      vehicle.speed = 100;
      vehicle.applyFriction(0.016);
      expect(vehicle.speed).toBeLessThan(100);
    });
  });

  describe('steering', () => {
    it('should turn left when steerLeft() is called with sufficient speed', () => {
      vehicle.speed = 50; // Need speed > 10 for steering
      const initialRotation = vehicle.rotation;
      vehicle.steerLeft(0.016);
      expect(vehicle.rotation).toBeLessThan(initialRotation);
    });

    it('should turn right when steerRight() is called with sufficient speed', () => {
      vehicle.speed = 50; // Need speed > 10 for steering
      const initialRotation = vehicle.rotation;
      vehicle.steerRight(0.016);
      expect(vehicle.rotation).toBeGreaterThan(initialRotation);
    });

    it('should respect turn speed', () => {
      vehicle.speed = vehicle.maxSpeed; // Maximum speed for full turn rate
      vehicle.turnSpeed = Math.PI; // 180 degrees per second
      vehicle.steerRight(1); // 1 second
      expect(vehicle.rotation).toBeCloseTo(Math.PI);
    });

    it('should not steer when speed is too low', () => {
      vehicle.speed = 5; // Speed < 10
      const initialRotation = vehicle.rotation;
      vehicle.steerLeft(0.016);
      expect(vehicle.rotation).toBe(initialRotation);
      vehicle.steerRight(0.016);
      expect(vehicle.rotation).toBe(initialRotation);
    });
  });

  describe('bounds', () => {
    it('should have width and height properties', () => {
      expect(vehicle.width).toBeDefined();
      expect(vehicle.height).toBeDefined();
    });

    it('should return bounding box', () => {
      vehicle.position = { x: 100, y: 100 };
      const bounds = vehicle.getBounds();

      expect(bounds).toHaveProperty('x');
      expect(bounds).toHaveProperty('y');
      expect(bounds).toHaveProperty('width');
      expect(bounds).toHaveProperty('height');
    });
  });
});
