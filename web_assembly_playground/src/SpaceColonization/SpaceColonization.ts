import {MersenneTwister19937, Random } from 'random-js';
import {vec2 } from 'gl-matrix';
import { SC_Branch } from './SC_Branch';
import { Rect } from './SC_Types';
import KDBush from "kdbush";

export interface SC_Node {
    position : vec2,
    reached: boolean,
}

interface KD_EndPoints { [key: string]: SC_Branch; }

export class SpaceColonization {

    private m_rand_engine : Random;
    private m_leaves : SC_Node[] = [];
    private m_branches : SC_Branch[] = [];
    private m_kd_candidates : KDBush<SC_Node> = null;
    private m_kd_branches : KDBush<SC_Branch> = null;
    private m_kd_endpoints : KD_EndPoints = {};

    private m_min_distance : number;
    private m_max_distance : number;

    public get Leaves() {
        return this.m_leaves;
    }

    public get Branches() {
        return this.m_branches;
    }

    constructor(min_distance : number, max_distance : number, random_engine : Random) {
        this.m_min_distance = min_distance;
        this.m_max_distance = max_distance;
        this.m_rand_engine = random_engine;
    } 

    public spawn_attractor(rect: Rect, spawn_length) {
        this.m_leaves = [];
        for (let i = 0; i < spawn_length; i++) {
            let random_x = this.m_rand_engine.integer( rect.xMin, rect.xMax);
            let random_y = this.m_rand_engine.integer(rect.yMin, rect.yMax);

            let point = vec2.fromValues(random_x, random_y);
            this.m_leaves.push( {position : point, reached: false} );
            //console.log(`RandomX ${random_x}, RandomY ${random_y}`);
        }

        this.m_kd_candidates = new KDBush(this.m_leaves, (n) => n.position[0],(n) => n.position[1], this.m_leaves.length, Float32Array);
    }

    public spawn_free_branch(root_x: number, root_y: number) {
        this.m_branches = []; 

        let root = new SC_Branch(vec2.fromValues(root_x, root_y), null);
            root.direction = vec2.fromValues(0, -1);

        this.m_branches.push(root);

        let current_branch = root;
        let leaves_lens = this.m_leaves.length;
        let max_trial = 50000;

        while (this.m_branches.length < max_trial) {

            if (current_branch == null) break;

            let found = false;

            let leave_index = this.m_kd_candidates.within(current_branch.position[0], current_branch.position[1], this.m_max_distance);
            let filter_length = leave_index.length;
            for (let i = 0; i < filter_length; i++) {
                let leave = this.m_leaves[ leave_index[i] ];
                let distance = vec2.distance( current_branch.position, leave.position);

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

        this.m_kd_branches = new KDBush(this.m_branches, (n) => n.position[0],(n) => n.position[1], this.m_leaves.length, Float32Array);
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

            let filter_branches = this.m_kd_branches.within(leaf.position[0], leaf.position[1], this.m_max_distance);
            let filter_length = filter_branches.length;
            
            for (let j = filter_length - 1; j >= 0; j--) {
                let branch = this.m_branches[filter_branches[j]];
                let distance  = vec2.distance(branch.position, leaf.position);

                if (distance < this.m_min_distance) {
                    leaf.reached = true;
                    closestBranch = null;
                    break;
                } else if  (distance < record && branch.candidate_count < branch.max_candidate) {
                    closestBranch = branch;
                    record = distance;
                }
            }

            if (closestBranch != null) {
                let newDir = vec2.subtract(vec2.create(), leaf.position, closestBranch.position);
                    vec2.normalize(newDir, newDir);

                closestBranch.direction = vec2.add(closestBranch.direction,  closestBranch.direction, newDir);

                closestBranch.count++;
                closestBranch.candidate_count++;
            }
        }

        let update_branch = 0;
        //Remove connect leaf
        for (let i = leave_lens - 1; i >= 0; i--) {

            if (this.m_leaves[i].reached) {
                this.m_leaves.splice(i, 1);
            }
        }

        for (let i = branch_lens - 1; i >= 0; i--) {
            var branch = this.m_branches[i];
            if (branch.count > 0) {
                let average_direction = branch.direction;
                update_branch++;

                vec2.scale(average_direction, average_direction, 1 / (branch.count + 1));
                //vec2.normalize(average_direction, average_direction);

                branch.set_direction(average_direction);

                let nextBranch = branch.next();
                
                //Record endpoints
                this.m_kd_endpoints[nextBranch.id] = nextBranch;
                if (branch.id in this.m_kd_endpoints) {
                    delete this.m_kd_endpoints[branch.id];      
                }

                this.m_branches.push(nextBranch);

                branch.reset();
            }
        }

        this.m_kd_candidates = new KDBush(this.m_leaves, (n) => n.position[0],(n) => n.position[1], this.m_leaves.length, Float32Array);
        this.m_kd_branches = new KDBush(this.m_branches, (n) => n.position[0],(n) => n.position[1], this.m_branches.length, Float32Array);

        return update_branch;
    }

    public calculate_branch_width() {
        let endpointKeys = Object.keys(this.m_kd_endpoints);
        let l = endpointKeys.length;
        
        for (let i = 0; i < l; i++) {
            let current_branch = this.m_kd_endpoints[ endpointKeys[i] ];
            current_branch.set_branch_type(current_branch.thickness);

            while (current_branch.parent != null) {
                
                let parent_branch = current_branch.parent;
                
                if (parent_branch.child_count <= current_branch.child_count) {
                    parent_branch.child_count = current_branch.child_count + 1;
                } else {
                  break;  
                }

                current_branch = parent_branch;
            }
        }
    }
}