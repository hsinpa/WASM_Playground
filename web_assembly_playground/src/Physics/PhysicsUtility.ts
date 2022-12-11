import { vec3 } from "gl-matrix";

export const PlaneEquationDetection = function(plane_position: vec3, plane_normal: vec3, target: vec3) {
    let dist = vec3.sub(vec3.create(), target, plane_position);
    return vec3.dot(dist, plane_normal);
}

export const IntersectionPlane = function(plane_position: vec3, plane_normal: vec3, target_pos: vec3, target_normal: vec3) {
    var denom = vec3.dot(plane_normal, target_normal);
    
    let p010 = vec3.subtract(vec3.create(), plane_position, target_pos);
    let t = vec3.dot(p010, plane_normal) / denom;

    return t;
}

export const Clamp = function(taget: number, max : number, min : number) {
    return Math.min(Math.max(taget, min), max);
}

export function RandomRange(min : number, max : number) {
    return ~~(Math.random() * (max - min + 1)) + min
};
