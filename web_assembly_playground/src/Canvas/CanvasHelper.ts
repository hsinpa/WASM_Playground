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
        this.max_angle = (max_angle);
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
        this.m_ctx.rotate( -(roundRect.angle));
        this.m_ctx.fillStyle = "green";
        this.m_ctx.fillRect(0, -roundRect.radius, roundRect.length, roundRect.radius * 2);

        this.DrawSphere(0, 0, roundRect.radius);
        this.DrawSphere(roundRect.length, 0, roundRect.radius);

        this.m_ctx.resetTransform();			
    }

    DrawSphere(x : number, y : number, radius: number)
	{
		this.m_ctx.beginPath();			
		this.m_ctx.arc(
			x, y, radius, 0.0, 2.0 * Math.PI
        ); 
        this.m_ctx.closePath();
        this.m_ctx.fill();
	}

    DrawLine(point_a : vec2, point_b : vec2, thickness: number) {
        this.m_ctx.lineWidth = thickness;

        this.m_ctx.beginPath();
        this.m_ctx.moveTo(point_a[0], point_a[1]);
        this.m_ctx.lineTo(point_b[0], point_b[1]);
        this.m_ctx.stroke();
    }

    DrawWire(position: vec2, radius: number, border: number ) {
        let x = position[0];
        let y = position[1];

        this.m_ctx.lineWidth = border;
        this.m_ctx.beginPath();
        this.m_ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.m_ctx.strokeStyle = "blue";
        this.m_ctx.stroke();
        
        this.m_ctx.lineWidth = 1;
    }

    Clear(width: number, height: number) {
        this.m_ctx.clearRect(0,0, width, height);
    }
}