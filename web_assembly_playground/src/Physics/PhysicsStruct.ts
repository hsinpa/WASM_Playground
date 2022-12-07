import {vec2, vec3} from 'gl-matrix';

interface PhysicsComponent {
    velocity: vec2;
    acceleration: vec2;
    position: vec2;
    mass: number;

    elasticity: number,
    friction: number,
}

export interface PlaneStruct {
    position: vec3;
    normal: vec3
}

export interface Particle2DStruct extends PhysicsComponent {
    radius: number;
}