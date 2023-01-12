import { vec2 } from "gl-matrix";

export class Rect {
    private x : number;
    private y: number;

    private m_width: number;
    private m_height: number;

    private m_center: vec2 = vec2.create();

    public constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.m_width = width;
        this.m_height = height;
    }

    public get width() { return this.m_width; }
    public get height() { return this.m_height; }
    public get width_half() { return this.m_width * 0,5; }
    public get height_half() { return this.m_height * 0.5; }

    public get center() {
        this.m_center[0] = this.x + (this.width_half)
        this.m_center[1] = this.y + (this.height_half)

        return this.m_center;
    }

    public get xMin() {
        return this.x;
    }

    public get xMax() {
        return this.x + this.m_width;
    }


    public get yMin() {
        return this.y;
    }

    public get yMax() {
        return this.y + this.m_height;
    }
}