import {vec2 } from 'gl-matrix';

export class SC_Branch {
    postion : vec2;
    direction: vec2;

    parent: SC_Branch;

    constructor(p_postion : vec2, p_parent : SC_Branch) {
        this.postion = p_postion;
        this.parent = p_parent;

        if (this.parent != null) {
            let direction = vec2.create();

            vec2.subtract(direction, this.postion, this.parent.postion);
            vec2.normalize(direction, direction);
            this.direction = direction;

            console.log(this.direction);
        }
    }

    public next() {
        let next_vector = vec2.scale(vec2.create(), this.direction, 25);
        let next_position = vec2.add(vec2.create(), this.postion, next_vector);
        return new SC_Branch(next_position, this);
    }
}