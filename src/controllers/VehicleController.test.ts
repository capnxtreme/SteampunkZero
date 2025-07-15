import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VehicleController } from './VehicleController';
import { Vehicle } from '../entities/Vehicle';

describe('VehicleController', () => {
  let vehicle: Vehicle;
  let controller: VehicleController;

  beforeEach(() => {
    vehicle = new Vehicle();
    controller = new VehicleController(vehicle);
  });

  describe('initialization', () => {
    it('should initialize with a vehicle', () => {
      expect(controller.vehicle).toBe(vehicle);
    });

    it('should have default key bindings', () => {
      expect(controller.keys).toBeDefined();
      expect(controller.keys.left).toBe('ArrowLeft');
      expect(controller.keys.right).toBe('ArrowRight');
      expect(controller.keys.up).toBe('ArrowUp');
      expect(controller.keys.down).toBe('ArrowDown');
    });

    it('should accept custom key bindings', () => {
      const customKeys = {
        left: 'a',
        right: 'd',
        up: 'w',
        down: 's',
      };
      const customController = new VehicleController(vehicle, customKeys);
      expect(customController.keys).toEqual(customKeys);
    });
  });

  describe('input handling', () => {
    it('should track pressed keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      controller.handleKeyDown(event);
      expect(controller.isKeyPressed('ArrowUp')).toBe(true);
    });

    it('should track released keys', () => {
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const upEvent = new KeyboardEvent('keyup', { key: 'ArrowUp' });

      controller.handleKeyDown(downEvent);
      expect(controller.isKeyPressed('ArrowUp')).toBe(true);

      controller.handleKeyUp(upEvent);
      expect(controller.isKeyPressed('ArrowUp')).toBe(false);
    });

    it('should prevent default behavior for handled keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      controller.handleKeyDown(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('vehicle control', () => {
    it('should accelerate vehicle when up key is pressed', () => {
      controller.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'ArrowUp' })
      );
      const initialSpeed = vehicle.speed;
      controller.update(0.016);
      expect(vehicle.speed).toBeGreaterThan(initialSpeed);
    });

    it('should decelerate vehicle when down key is pressed', () => {
      vehicle.speed = 100;
      controller.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );
      controller.update(0.016);
      expect(vehicle.speed).toBeLessThan(100);
    });

    it('should steer left when left key is pressed and vehicle has sufficient speed', () => {
      vehicle.speed = 50; // Need speed > 10 for steering
      const initialRotation = vehicle.rotation;
      controller.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      );
      controller.update(0.016);
      expect(vehicle.rotation).toBeLessThan(initialRotation); // Left = counter-clockwise = decrease
    });

    it('should steer right when right key is pressed and vehicle has sufficient speed', () => {
      vehicle.speed = 50; // Need speed > 10 for steering
      const initialRotation = vehicle.rotation;
      controller.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );
      controller.update(0.016);
      expect(vehicle.rotation).toBeGreaterThan(initialRotation); // Right = clockwise = increase
    });

    it('should apply friction when no acceleration keys are pressed', () => {
      vehicle.speed = 100;
      controller.update(0.016);
      expect(vehicle.speed).toBeLessThan(100);
    });

    it('should not steer when vehicle speed is too low', () => {
      vehicle.speed = 5; // Speed < 10, no steering allowed
      const initialRotation = vehicle.rotation;
      controller.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      );
      controller.update(0.016);
      expect(vehicle.rotation).toBe(initialRotation);
    });
  });

  describe('event listeners', () => {
    it('should attach event listeners when attach() is called', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      controller.attach();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function)
      );
    });

    it('should remove event listeners when detach() is called', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      controller.attach();
      controller.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function)
      );
    });
  });
});
