import {SC_Node, SpaceColonization} from './SpaceColonization';
import SimpleCanvas from "../Hsinpa/SimpleCanvas";
import {CanvasHelper, ImageOption} from '../Canvas/CanvasHelper';
import { Rect } from './SC_Types';
import { SC_Branch, BranchEnum } from './SC_Branch';
import WebglResource from '../Hsinpa/WebglResource';
import { vec2 } from 'gl-matrix';
import {MersenneTwister19937, Random } from 'random-js';

export default class SC_Canvas {

    private m_space_colonization : SpaceColonization;
    private m_simple_canvas: SimpleCanvas;
    private m_canvas_helper: CanvasHelper;
    private m_resource: WebglResource;
    private m_rand_engine : Random;

    constructor(canvas_dom_query: string) {
        let seed = undefined;
        if (seed == undefined) {
            this.m_rand_engine = new Random(MersenneTwister19937.autoSeed());
        } else
            this.m_rand_engine = new Random(MersenneTwister19937.seed(seed));

        this.m_resource = new WebglResource();
        this.m_simple_canvas = new SimpleCanvas(canvas_dom_query);
        this.m_canvas_helper = new CanvasHelper(this.m_simple_canvas.Context);
        this.m_space_colonization = new SpaceColonization(20, 100, this.m_rand_engine);

        let attractor_y = this.m_simple_canvas.ScreenHeight * 0.5;
        let attractor_spawn_rect = new Rect(this.m_simple_canvas.ScreenWidth * 0.2, 0, this.m_simple_canvas.ScreenWidth * 0.6, attractor_y);

        this.m_space_colonization.spawn_attractor(attractor_spawn_rect, 200);
        this.m_space_colonization.spawn_free_branch(this.m_simple_canvas.ScreenWidth * 0.5, this.m_simple_canvas.ScreenHeight);


        window.requestAnimationFrame(this.render.bind(this));
    }

    public render() {
        this.m_canvas_helper.Clear(this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);

        this.draw_candidates(this.m_space_colonization.Leaves);
        this.draw_branch(this.m_space_colonization.Branches);
    
        let update_branch_num = this.m_space_colonization.grow_branch();

        //console.log("Update Branch Num " + update_branch_num);

        if (update_branch_num == 0) {
            this.on_branch_spawn_completed();
            return;
        };

        window.requestAnimationFrame(this.render.bind(this));
    }

    private draw_candidates(leaves: SC_Node[]) {
        // let leaves = this.m_space_colonization.Leaves;
        let leaves_lens = leaves.length;

        for (let l = 0; l < leaves_lens; l++) {
            let leave = leaves[l];
            this.m_canvas_helper.DrawSphere(leave.position[0], leave.position[1], 3);
        }
    }

    private draw_branch(branches: SC_Branch[]) {
        // let branches = this.m_space_colonization.Branches;
        let branch_lens = branches.length;

        for (let i = 0; i < branch_lens; i++) {
            let branch = branches[i];

            if (branch.parent == null) continue;

            this.m_canvas_helper.DrawLine(branch.parent.position, branch.position, branch.thickness);

            this.draw_leaf(branch);
        }
    }

    private async draw_leaf(source_branch: SC_Branch) {
        if (source_branch.branch_type == null || source_branch.branch_type.type ==  BranchEnum.Thick_Branch) return;

        let leaf_tex = await this.m_resource.GetImage("./assets/textures/leaf-01.png");

        let options: ImageOption = {base_scale: 0.5, target_scale: 1, dx : 0, dy: 0}
        let offset = vec2.clone(source_branch.position);

        options.translation = offset;

        let random_direction_x = source_branch.direction[0] + (this.m_rand_engine.real(-1, 1) * Math.PI * 0.2);
        let random_direction_y = source_branch.direction[1] + (this.m_rand_engine.real(-1, 1) * Math.PI * 0.2);

        let random_direction_nor = vec2.fromValues(random_direction_x, random_direction_y);
                                    vec2.normalize(random_direction_nor, random_direction_nor);

        options.rotation = Math.atan2(random_direction_nor[1], random_direction_nor[0]);
        options.dy = -leaf_tex.height * 0.5 * options.base_scale * options.target_scale;

        this.m_canvas_helper.DrawImage(leaf_tex, source_branch.position, options);
    }

    private async on_branch_spawn_completed() {
        this.m_space_colonization.calculate_branch_width();

        this.m_canvas_helper.Clear(this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);
        
        this.draw_branch(this.m_space_colonization.Branches);
    }

}