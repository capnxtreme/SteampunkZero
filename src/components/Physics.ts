// Physics component for entity physics properties
export interface Force {
    x: number;
    y: number;
}

export interface PhysicsOptions {
    vx?: number;
    vy?: number;
    ax?: number;
    ay?: number;
    mass?: number;
    restitution?: number;
    friction?: number;
    angularVelocity?: number;
    useGravity?: boolean;
}

export class Physics {
    public vx: number;
    public vy: number;
    public ax: number;
    public ay: number;
    public mass: number;
    public restitution: number;
    public friction: number;
    public angularVelocity: number;
    public useGravity: boolean;
    public grounded: boolean;
    public forces: Force[];

    constructor(options: PhysicsOptions = {}) {
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        this.ax = options.ax || 0;
        this.ay = options.ay || 0;
        this.mass = options.mass || 1;
        this.restitution = options.restitution || 0.5;
        this.friction = options.friction || 0.1;
        this.angularVelocity = options.angularVelocity || 0;
        this.useGravity = options.useGravity !== undefined ? options.useGravity : true;
        this.grounded = false;
        this.forces = [];
    }
    
    setVelocity(vx: number, vy: number): void {
        this.vx = vx;
        this.vy = vy;
    }
    
    addVelocity(dvx: number, dvy: number): void {
        this.vx += dvx;
        this.vy += dvy;
    }
    
    setAcceleration(ax: number, ay: number): void {
        this.ax = ax;
        this.ay = ay;
    }
    
    stop(): void {
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.angularVelocity = 0;
    }
}