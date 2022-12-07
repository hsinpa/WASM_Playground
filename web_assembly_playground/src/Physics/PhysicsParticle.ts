import { vec2 } from "gl-matrix";
import SimpleCanvas from "../Hsinpa/SimpleCanvas";
import {Particle2DStruct} from './PhysicsStruct';

export default class PhysicsParticle {
    private m_simple_canvas: SimpleCanvas;
    private m_particles: Particle2DStruct[];
    public TimeStamp : number;
    public DeltaTime: number;

    public constructor(canvas_dom_query: string) {
        this.m_simple_canvas = new SimpleCanvas(canvas_dom_query);
        this.m_particles = this.PrepareParticles(10, this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);
        console.log(`Canvas height ${this.m_simple_canvas.ScreenWidth}, width ${this.m_simple_canvas.ScreenHeight}`)

        window.requestAnimationFrame(this.Render.bind(this));

    }

    public Render(timestamp: number) {
        this.DeltaTime = (timestamp - this.TimeStamp) * 0.001;
        this.TimeStamp = timestamp;

        this.m_simple_canvas.Context.clearRect(0, 0, this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);

        let spawn_count = this.m_particles.length;
        for (let i = 0; i < spawn_count; i++) {
            this.DrawSphere(this.m_simple_canvas.Context, this.m_particles[i].position, this.m_particles[i].radius);        
        }

        window.requestAnimationFrame(this.Render.bind(this));
    }

    private DrawSphere(context: CanvasRenderingContext2D, position: vec2, radius: number) {
        let x = position[0];
        let y = position[1];

        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
    }

    private PrepareParticles(spawn_count: number, screen_width: number, screen_height: number) {
        let particles : Particle2DStruct[] = [];
        
        for (let i = 0; i < spawn_count; i++) {
            let randomPositionX = (Math.random() * screen_width);
            let randomPositionY = (Math.random() * screen_height);

            let particle : Particle2DStruct = {velocity : vec2.fromValues(0,0), acceleration: vec2.fromValues(0,0), position: vec2.fromValues(randomPositionX, randomPositionY), radius: 10 };

            particles.push(particle);
        }

        return particles;
    }

}