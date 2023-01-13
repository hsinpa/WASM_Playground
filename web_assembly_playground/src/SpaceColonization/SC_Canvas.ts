import {SC_Node, SpaceColonization} from './SpaceColonization';
import SimpleCanvas from "../Hsinpa/SimpleCanvas";
import {CanvasHelper} from '../Canvas/CanvasHelper';
import { Rect } from './SC_Types';
import { SC_Branch } from './SC_Branch';

export default class SC_Canvas {

    private m_space_colonization : SpaceColonization;
    private m_simple_canvas: SimpleCanvas;
    private m_canvas_helper: CanvasHelper;

    constructor(canvas_dom_query: string) {
        this.m_simple_canvas = new SimpleCanvas(canvas_dom_query);
        this.m_canvas_helper = new CanvasHelper(this.m_simple_canvas.Context);
        this.m_space_colonization = new SpaceColonization(20, 100);


        let attractor_y = this.m_simple_canvas.ScreenHeight * 0.5;
        let attractor_spawn_rect = new Rect(this.m_simple_canvas.ScreenWidth * 0.2, 0, this.m_simple_canvas.ScreenWidth * 0.6, attractor_y);

        this.m_space_colonization.spawn_attractor(attractor_spawn_rect, 2000);
        this.m_space_colonization.spawn_free_branch(this.m_simple_canvas.ScreenWidth * 0.5, this.m_simple_canvas.ScreenHeight);


        window.requestAnimationFrame(this.render.bind(this));
    }

    public render() {
        this.m_canvas_helper.Clear(this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);

        this.draw_leaf(this.m_space_colonization.Leaves);
        this.draw_branch(this.m_space_colonization.Branches);
    
        let update_branch_num = this.m_space_colonization.grow_branch();

        if (update_branch_num == 0) return;

        window.requestAnimationFrame(this.render.bind(this));
    }

    private draw_leaf(leaves: SC_Node[]) {
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

            this.m_canvas_helper.DrawLine(branch.parent.position, branch.position, 1);
        }
    }


}