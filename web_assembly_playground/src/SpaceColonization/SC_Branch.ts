import {vec2 } from 'gl-matrix';

export class SC_Branch {

    position : vec2;
    direction: vec2;
    original_direction: vec2;

    parent: SC_Branch;
    count: number = 0;

    constructor(p_postion : vec2, p_parent : SC_Branch) {
        this.position = p_postion;
        this.parent = p_parent;

        this.direction = vec2.create();
        this.original_direction = vec2.create();

        if (this.parent != null) {
            vec2.subtract(this.direction, this.position, this.parent.position);
            vec2.normalize(this.direction, this.direction);

            this.set_direction(this.direction, true);
        }
    }

    public reset() {
        this.direction = vec2.copy(this.direction, this.original_direction);
        this.count = 0;
    }

    public set_direction(p_direction : vec2, p_replace_origin = false) {
        this.direction = p_direction;

        if (p_replace_origin) {
            vec2.copy(this.original_direction, this.direction);
        }
    }

    public next() {
        let next_vector = vec2.scale(vec2.create(), this.direction, 10);
        let next_position = vec2.add(vec2.create(), this.position, next_vector);
        return new SC_Branch(next_position, this);
    }
}