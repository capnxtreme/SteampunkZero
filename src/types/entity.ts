// Entity type definitions
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';

export interface ComponentMap {
    transform?: Transform;
    physics?: Physics;
    render?: RenderComponent;
    collider?: ColliderComponent;
    update?: UpdateComponent;
    [key: string]: any;
}

export interface Entity {
    id: number;
    components: Map<string, any>;
    tags: Set<string>;
    active: boolean;
}

export interface RenderComponent {
    type: 'rectangle' | 'circle' | 'sprite' | 'text';
    layer?: number;
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
    radius?: number;
    image?: HTMLImageElement;
    text?: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
}

export interface ColliderComponent {
    type: 'box' | 'circle';
    width?: number;
    height?: number;
    radius?: number;
}

export interface UpdateComponent {
    update: (entity: Entity, deltaTime: number) => void;
}