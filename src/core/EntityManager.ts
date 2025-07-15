// Entity manager for handling game objects
import { Entity, ComponentMap, UpdateComponent } from '../types/entity.js';

export class EntityManager {
  private entities: Map<number, Entity>;
  private entitiesByTag: Map<string, Set<number>>;
  private nextId: number;

  constructor() {
    this.entities = new Map();
    this.entitiesByTag = new Map();
    this.nextId = 1;
  }

  createEntity(components: ComponentMap = {}, tags: string[] = []): Entity {
    const id = this.nextId++;
    const entity: Entity = {
      id,
      components: new Map(),
      tags: new Set(tags),
      active: true,
    };

    // Add components
    for (const [name, component] of Object.entries(components)) {
      entity.components.set(name, component);
    }

    // Store entity
    this.entities.set(id, entity);

    // Index by tags
    for (const tag of tags) {
      if (!this.entitiesByTag.has(tag)) {
        this.entitiesByTag.set(tag, new Set());
      }
      this.entitiesByTag.get(tag)!.add(id);
    }

    return entity;
  }

  removeEntity(id: number): void {
    const entity = this.entities.get(id);
    if (!entity) return;

    // Remove from tag indices
    for (const tag of entity.tags) {
      const tagSet = this.entitiesByTag.get(tag);
      if (tagSet) {
        tagSet.delete(id);
        if (tagSet.size === 0) {
          this.entitiesByTag.delete(tag);
        }
      }
    }

    // Remove entity
    this.entities.delete(id);
  }

  getEntity(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  getEntities(): Entity[] {
    return Array.from(this.entities.values()).filter((e) => e.active);
  }

  getEntitiesByTag(tag: string): Entity[] {
    const tagSet = this.entitiesByTag.get(tag);
    if (!tagSet) return [];

    return Array.from(tagSet)
      .map((id) => this.entities.get(id))
      .filter((e): e is Entity => e !== undefined && e.active);
  }

  getEntitiesWithComponents(...componentNames: string[]): Entity[] {
    return this.getEntities().filter((entity) => {
      return componentNames.every((name) => entity.components.has(name));
    });
  }

  addComponent(entityId: number, componentName: string, component: any): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.components.set(componentName, component);
    }
  }

  removeComponent(entityId: number, componentName: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.components.delete(componentName);
    }
  }

  getComponent<T = any>(entityId: number, componentName: string): T | null {
    const entity = this.entities.get(entityId);
    return entity ? (entity.components.get(componentName) as T) || null : null;
  }

  update(deltaTime: number): void {
    // Update all entities with update components
    for (const entity of this.getEntities()) {
      const updateComponent = entity.components.get('update') as
        | UpdateComponent
        | undefined;
      if (updateComponent && typeof updateComponent.update === 'function') {
        updateComponent.update(entity, deltaTime);
      }
    }
  }

  clear(): void {
    this.entities.clear();
    this.entitiesByTag.clear();
    this.nextId = 1;
  }
}
