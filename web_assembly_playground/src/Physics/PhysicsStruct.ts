import {vec2} from 'gl-matrix';

interface PhysicsComponent {
    velocity: vec2;
    acceleration: vec2;
    position: vec2;
}

export interface Particle2DStruct extends PhysicsComponent {
    radius: number;
}