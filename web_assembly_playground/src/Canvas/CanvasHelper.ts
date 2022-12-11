import { vec2 } from "gl-matrix";

//start from center
export class RoundRectStruct {
    x: number;
    y: number;
    radius: number;
    length: number;
    angle: number;
    rest_angle: number;
    max_angle: number;
    sign: number;

    private m_angle_vector: vec2;
    private m_position_vector: vec2;

    constructor(x: number, y: number, radius: number, length: number, rest_angle:number, max_angle: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.length = length;
        this.angle = rest_angle;
        this.rest_angle = rest_angle;
        this.max_angle = Math.abs(max_angle);
        this.sign = Math.sign(max_angle);

        this.m_position_vector = vec2.fromValues(x, y);
        this.m_angle_vector = vec2.create();
    }

    public EndPoint() {
        this.m_angle_vector[0] = Math.cos(this.angle);
        this.m_angle_vector[1] = Math.sin(this.angle);

        this.m_position_vector[0] = this.m_angle_vector[0] * this.length;
        this.m_position_vector[1] = 0;
        return this.m_position_vector;
    }
}

export class CanvasHelper {
    private m_ctx: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.m_ctx = context;
    }

    DrawRoundRect(roundRect: RoundRectStruct) {
        //this.m_ctx.translate();

        // Rotated rectangle
        // this.m_ctx.rotate(45 * Math.PI / 180);
        // this.m_ctx.fillStyle = 'red';
        // this.m_ctx.fillRect(100, 0, 80, 20);

        this.m_ctx.translate(roundRect.x + roundRect.radius, roundRect.y);        
        this.m_ctx.rotate( -(roundRect.sign * roundRect.angle));
        this.m_ctx.fillStyle = "green";
        this.m_ctx.fillRect(0, -roundRect.radius, roundRect.length, roundRect.radius * 2);

        this.DrawSphere(0, 0, roundRect.radius);
        this.DrawSphere(roundRect.length, 0, roundRect.radius);

        this.m_ctx.resetTransform();			
    }

    DrawSphere(x, y, radius)
	{
		this.m_ctx.beginPath();			
		this.m_ctx.arc(
			x, y, radius, 0.0, 2.0 * Math.PI
        ); 
        this.m_ctx.closePath();
        this.m_ctx.fill();
	}
}