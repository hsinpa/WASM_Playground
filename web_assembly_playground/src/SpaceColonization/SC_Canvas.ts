import {SpaceColonization} from './SpaceColonization';
import SimpleCanvas from "../Hsinpa/SimpleCanvas";
import {CanvasHelper} from '../Canvas/CanvasHelper';
import { Rect } from './SC_Types';

export default class SC_Canvas {

    private m_space_colonization : SpaceColonization;
    private m_simple_canvas: SimpleCanvas;
    private m_canvas_helper: CanvasHelper;

    constructor(canvas_dom_query: string) {
        this.m_simple_canvas = new SimpleCanvas(canvas_dom_query);
        this.m_canvas_helper = new CanvasHelper(this.m_simple_canvas.Context);
        this.m_space_colonization = new SpaceColonization(50, 100);


        let attractor_y = this.m_simple_canvas.ScreenHeight * 0.6;
        let attractor_spawn_rect = new Rect(this.m_simple_canvas.ScreenWidth * 0.2, 0, this.m_simple_canvas.ScreenWidth * 0.6, attractor_y);

        this.m_space_colonization.spawn_attractor(attractor_spawn_rect, 40);
        this.m_space_colonization.spawn_free_branch(this.m_simple_canvas.ScreenWidth * 0.5, this.m_simple_canvas.ScreenHeight)
    }

    public render() {
        //Draw leaf
        let leaves = this.m_space_colonization.Leaves;
        let leaves_lens = leaves.length;

        for (let l = 0; l < leaves_lens; l++) {
            let leave = leaves[l];
            this.m_canvas_helper.DrawSphere(leave.position[0], leave.position[1], 3);
        }

        //Draw branches
        let branches = this.m_space_colonization.Branches;
        let branch_lens = branches.length;

        console.log("branch_lens " + branch_lens);

        for (let i = 0; i < branch_lens; i++) {
            let branch = branches[i];

            if (branch.parent == null) continue;

            this.m_canvas_helper.DrawLine(branch.parent.position, branch.position, 1);
        }
    }
}