// Physics system for handling movement and collisions
import { CONFIG } from '../config.js';
import { Entity, ColliderComponent } from '../types/entity.js';
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';

export class PhysicsSystem {
  private gravity: number;
  private airResistance: number;
  private groundFriction: number;

  constructor() {
    this.gravity = CONFIG.GRAVITY;
    this.airResistance = CONFIG.AIR_RESISTANCE;
    this.groundFriction = CONFIG.GROUND_FRICTION;
  }

  initialize(): void {
    console.log('Physics system initialized');
  }

  update(entities: Entity[], deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds

    // Get entities with physics components
    const physicsEntities = entities.filter(
      (entity) =>
        entity.components.has('physics') && entity.components.has('transform')
    );

    // Update physics for each entity
    for (const entity of physicsEntities) {
      this.updateEntity(entity, dt);
    }

    // Check collisions
    this.checkCollisions(physicsEntities);
  }

  private updateEntity(entity: Entity, dt: number): void {
    const physics = entity.components.get('physics') as Physics;
    const transform = entity.components.get('transform') as Transform;

    // Apply forces
    if (physics.forces && physics.forces.length > 0) {
      physics.forces.forEach((force) => {
        physics.vx += force.x * dt;
        physics.vy += force.y * dt;
      });
      physics.forces = [];
    }

    // Apply gravity if not grounded
    if (!physics.grounded && physics.useGravity) {
      physics.vy += this.gravity * physics.mass * dt;
    }

    // Apply air resistance
    physics.vx *= Math.pow(this.airResistance, dt);
    physics.vy *= Math.pow(this.airResistance, dt);

    // Apply ground friction if grounded
    if (physics.grounded) {
      physics.vx *= Math.pow(this.groundFriction, dt);
    }

    // Update position
    transform.x += physics.vx * dt;
    transform.y += physics.vy * dt;

    // Update rotation based on angular velocity
    if (physics.angularVelocity) {
      transform.rotation += physics.angularVelocity * dt;
    }
  }

  private checkCollisions(entities: Entity[]): void {
    // Simple collision detection between entities
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        if (this.checkCollision(entityA, entityB)) {
          this.resolveCollision(entityA, entityB);
        }
      }
    }
  }

  private checkCollision(entityA: Entity, entityB: Entity): boolean {
    const colliderA = entityA.components.get('collider') as
      | ColliderComponent
      | undefined;
    const colliderB = entityB.components.get('collider') as
      | ColliderComponent
      | undefined;

    if (!colliderA || !colliderB) return false;

    const transformA = entityA.components.get('transform') as Transform;
    const transformB = entityB.components.get('transform') as Transform;

    // Simple AABB collision detection
    if (colliderA.type === 'box' && colliderB.type === 'box') {
      if (
        !colliderA.width ||
        !colliderA.height ||
        !colliderB.width ||
        !colliderB.height
      ) {
        return false;
      }
      return this.checkAABBCollision(
        transformA.x,
        transformA.y,
        colliderA.width,
        colliderA.height,
        transformB.x,
        transformB.y,
        colliderB.width,
        colliderB.height
      );
    }

    // Circle collision detection
    if (colliderA.type === 'circle' && colliderB.type === 'circle') {
      if (!colliderA.radius || !colliderB.radius) {
        return false;
      }
      return this.checkCircleCollision(
        transformA.x,
        transformA.y,
        colliderA.radius,
        transformB.x,
        transformB.y,
        colliderB.radius
      );
    }

    return false;
  }

  private checkAABBCollision(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return (
      x1 - w1 / 2 < x2 + w2 / 2 &&
      x1 + w1 / 2 > x2 - w2 / 2 &&
      y1 - h1 / 2 < y2 + h2 / 2 &&
      y1 + h1 / 2 > y2 - h2 / 2
    );
  }

  private checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }

  private resolveCollision(entityA: Entity, entityB: Entity): void {
    const physicsA = entityA.components.get('physics') as Physics | undefined;
    const physicsB = entityB.components.get('physics') as Physics | undefined;

    if (!physicsA || !physicsB) return;

    const transformA = entityA.components.get('transform') as Transform;
    const transformB = entityB.components.get('transform') as Transform;

    // Calculate collision normal
    const dx = transformB.x - transformA.x;
    const dy = transformB.y - transformA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    // Calculate relative velocity
    const dvx = physicsB.vx - physicsA.vx;
    const dvy = physicsB.vy - physicsA.vy;
    const dvn = dvx * nx + dvy * ny;

    // Don't resolve if objects are separating
    if (dvn > 0) return;

    // Calculate impulse
    const restitution = Math.min(
      physicsA.restitution || 0.5,
      physicsB.restitution || 0.5
    );
    const impulse = (2 * dvn) / (physicsA.mass + physicsB.mass);

    // Apply impulse
    physicsA.vx += impulse * physicsB.mass * nx * (1 + restitution);
    physicsA.vy += impulse * physicsB.mass * ny * (1 + restitution);
    physicsB.vx -= impulse * physicsA.mass * nx * (1 + restitution);
    physicsB.vy -= impulse * physicsA.mass * ny * (1 + restitution);

    // Separate objects
    const colliderA = entityA.components.get('collider') as ColliderComponent;
    const colliderB = entityB.components.get('collider') as ColliderComponent;
    const radiusA = colliderA.radius || 0;
    const radiusB = colliderB.radius || 0;
    const overlap = radiusA + radiusB - distance;

    if (overlap > 0) {
      const separationX = nx * overlap * 0.5;
      const separationY = ny * overlap * 0.5;

      transformA.x -= separationX;
      transformA.y -= separationY;
      transformB.x += separationX;
      transformB.y += separationY;
    }
  }

  applyForce(entity: Entity, forceX: number, forceY: number): void {
    const physics = entity.components.get('physics') as Physics | undefined;
    if (physics) {
      if (!physics.forces) physics.forces = [];
      physics.forces.push({ x: forceX, y: forceY });
    }
  }
}
