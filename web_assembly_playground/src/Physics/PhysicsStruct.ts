import {vec2, vec3} from 'gl-matrix';
import {RoundRectStruct} from '../Canvas/CanvasHelper';

interface PhysicsComponent {
    velocity: vec2,
    acceleration: vec2,
    position: vec2,
    mass: number,

    elasticity: number,
    friction: number,
}

export interface PlaneStruct {
    position: vec3,
    normal: vec3
}

export interface Particle2DStruct extends PhysicsComponent {
    radius: number;
}

export interface FlipperStruct {
    shape: RoundRectStruct,
    angular_velocity: number,
}

export interface WireStruct {
    position: vec2,
    radius: number,
}