import {MersenneTwister19937, Random } from 'random-js';
import {vec2 } from 'gl-matrix';
import { SC_Branch } from './SC_Branch';
import { Rect } from './SC_Types';

export interface SC_Node {
    position : vec2,
    reached: boolean,
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

    public spawn_attractor(rect: Rect, spawn_length) {
        this.m_leaves = [];

        for (let i = 0; i < spawn_length; i++) {
            let random_x = this.m_rand_engine.integer( rect.xMin, rect.xMax);
            let random_y = this.m_rand_engine.integer(rect.yMin, rect.yMax);

            this.m_leaves.push( {position : vec2.fromValues(random_x, random_y), reached: false} );
            //console.log(`RandomX ${random_x}, RandomY ${random_y}`);
        }
    }

    public spawn_free_branch(root_x: number, root_y: number) {
        this.m_branches = []; 

        let root = new SC_Branch(vec2.fromValues(root_x, root_y), null);
            root.direction = vec2.fromValues(0, -1);

        this.m_branches.push(root);

        let current_branch = root;
        let leaves_lens = this.m_leaves.length;

        while (this.m_branches.length < 10) {

            if (current_branch == null) break;

            let found = false;
            for (let i = 0; i < leaves_lens; i++) {
                let leave = this.m_leaves[i];
                let distance = vec2.distance( current_branch.position, leave.position);

                console.log(distance);

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

            current_branch = null;
        }
    }

    /**
     *An iteration approach
     *
     * @memberof SpaceColonization
     */
    public grow_branch() {
        let leave_lens = this.m_leaves.length;
        let branch_lens = this.m_branches.length;

        for (let i = 0; i < leave_lens ; i++) {
            let leaf = this.m_leaves[i];
            let closestBranch : SC_Branch = null;
            let record = this.m_max_distance;


            for (let j = 0; j < branch_lens; j++) {
                let branch = this.m_branches[j];
                let distance  = vec2.distance(branch.position, leaf.position);

                if (distance < this.m_min_distance) {
                    leaf.reached = true;
                    closestBranch = null;
                    break;
                }

                if (distance < record) {
                    closestBranch = branch;
                    record = distance;
                }
            }

            if (closestBranch != null) {
                let newDir = vec2.subtract(vec2.create(), leaf.position, closestBranch.position);
                    newDir = vec2.normalize(newDir, newDir);
                closestBranch.direction = vec2.add(closestBranch.direction,  closestBranch.direction, newDir);
            }
        }

        //Remove connect leaf
        for (let i = leave_lens - 1; i >= 0; i--) {
            if (this.m_leaves[i].reached) {
                this.m_leaves = this.m_leaves.splice(i, 1);
           }
        }


        for (let i = branch_lens - 1; i >= 0; i--) {
            var branch = this.m_branches[i];
            if (branch.count > 0) {

                let average_direction = branch.direction;
                average_direction[0] = average_direction[0]  / (branch.count + 1);
                average_direction[1] = average_direction[1]  / (branch.count + 1);

                branch.set_direction(branch.direction);
                this.m_branches.push(branch.next());
                branch.reset();
            }
        }

    }
}