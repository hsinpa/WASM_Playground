import {MersenneTwister19937, Random } from 'random-js';
import {vec2 } from 'gl-matrix';
import { SC_Branch } from './SC_Branch';

export interface SC_Node {
    position : vec2
}

export class SpaceColonization {

    private m_rand_engine : Random;
    private m_leaves : SC_Node[] = [];
    private m_branches : SC_Branch[] = [];

    private m_min_distance : number;
    private m_max_distance : number;

    public get Leaves() {
        return this.m_leaves;
    }

    public get Branches() {
        return this.m_branches;
    }

    constructor(min_distance : number, max_distance : number, seed? : number) {
        this.m_min_distance = min_distance;
        this.m_max_distance = max_distance;

        if (seed == undefined) {
            this.m_rand_engine = new Random(MersenneTwister19937.autoSeed());
        } else
            this.m_rand_engine = new Random(MersenneTwister19937.seed(seed));
    } 

    public spawn_attractor(width: number, height: number, spawn_length) {
        this.m_leaves = [];

        for (let i = 0; i < spawn_length; i++) {
            let random_x = this.m_rand_engine.integer(0, width);
            let random_y = this.m_rand_engine.integer(0, height);

            this.m_leaves.push( {position : vec2.fromValues(random_x, random_y)} );
            //console.log(`RandomX ${random_x}, RandomY ${random_y}`);
        }
    }

    public spawn_branch(root_x: number, root_y: number) {
        this.m_branches = []; 

        let root = new SC_Branch(vec2.fromValues(root_x, root_y), null);
            root.direction = vec2.fromValues(0, -1);

        this.m_branches.push(root);

        let current_branch = root;
        let leaves_lens = this.m_leaves.length;

        while (this.m_branches.length < 10) {

            let found = false;
            for (let i = 0; i < leaves_lens; i++) {
                let leave = this.m_leaves[i];
                let distance = vec2.distance( current_branch.postion, leave.position);

                if (distance < this.m_max_distance) {
                    if (!found) found =  true;      
                }
            }

            if (!found) {
                let branch = current_branch.next();
                current_branch = branch;

                this.m_branches.push(branch);
                continue;
            }

        }

    }
}