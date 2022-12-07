import { vec2, vec3 } from "gl-matrix";
import SimpleCanvas from "../Hsinpa/SimpleCanvas";
import {Particle2DStruct, PlaneStruct} from './PhysicsStruct';
import {PlaneEquationDetection, IntersectionPlane} from './PhysicsUtility';

export default class PhysicsParticle {
    private m_simple_canvas: SimpleCanvas;
    private m_particles: Particle2DStruct[];
    private m_floor: PlaneStruct;
    public TimeStamp : number = 0;
    public DeltaTime: number = 0;

    public constructor(canvas_dom_query: string) {
        this.m_simple_canvas = new SimpleCanvas(canvas_dom_query);
        this.m_particles = this.PrepareParticles(100, this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);
        this.m_floor = {position: vec3.fromValues(0,this.m_simple_canvas.ScreenHeight, 0), normal: vec3.fromValues(0, -1, 0)};
        console.log(`Canvas height ${this.m_simple_canvas.ScreenWidth}, width ${this.m_simple_canvas.ScreenHeight}`)
        
        window.requestAnimationFrame(this.Render.bind(this));
    }

    public Render(timestamp: number) {
        this.DeltaTime = (timestamp - this.TimeStamp) * 0.001;
        this.TimeStamp = timestamp;

        this.m_simple_canvas.Context.clearRect(0, 0, this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);

        let spawn_count = this.m_particles.length;
        for (let i = 0; i < spawn_count; i++) {
            this.Simulate(this.m_particles[i]);
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

    private Simulate(particle: Particle2DStruct) {
        let gravity = 9.8;
        let lastVelocity = vec2.clone(particle.velocity);
        let lastPosition = vec2.clone(particle.position);

        particle.acceleration = vec2.set(particle.acceleration, 0, gravity);

        let acceleration_delta = vec2.scale(vec2.create(), particle.acceleration, this.DeltaTime);
        particle.velocity = vec2.add(particle.velocity, particle.velocity, acceleration_delta);

        let average_velocity = vec2.add(vec2.create(), lastVelocity, particle.velocity);
        average_velocity = vec2.scale(average_velocity, average_velocity, 0.5);
        average_velocity = vec2.scale(average_velocity, average_velocity, this.DeltaTime);

        particle.position = vec2.add(particle.position, particle.position, particle.velocity);

        //Collision Detection
        this.ProcessCollision(particle, lastPosition, lastVelocity);
    }

    private ProcessCollision(particle: Particle2DStruct, lastPosition: vec2, lastVelocity: vec2) {
        lastVelocity = vec2.normalize(lastVelocity, lastVelocity);
        let last_pos_3d = vec3.fromValues(lastPosition[0], lastPosition[1], 0);
        let last_velocity_3d = vec3.fromValues(-lastVelocity[0], -lastVelocity[1], 0);
        let particle_pos_3d = vec3.fromValues(particle.position[0], particle.position[1], 0);
        let collision_value = PlaneEquationDetection(this.m_floor.position, this.m_floor.normal, particle_pos_3d);

        if (collision_value < 0) {
            let t = IntersectionPlane(this.m_floor.position, this.m_floor.normal, last_pos_3d, last_velocity_3d);
            let collision_point = vec3.add(last_pos_3d, last_pos_3d, vec3.scale(last_velocity_3d, last_velocity_3d, t));

            particle.position[0] = collision_point[0];
            particle.position[1] = collision_point[1];

            particle.velocity = this.ProcessCollisionForce(particle, this.m_floor);
        }
    }

    private ProcessCollisionForce(particle: Particle2DStruct, collider: PlaneStruct) {
        //Calculate Elastic Force
        let particle_velocity_3d = vec3.fromValues(particle.velocity[0], particle.velocity[1], 0);
        let elastic_force = vec3.scale(vec3.create(), collider.normal, vec3.dot(particle_velocity_3d, collider.normal) ); 
        let post_elastic_force = vec3.scale(vec3.create(), elastic_force, -particle.elasticity);

        let friction_force = vec3.subtract(vec3.create(), particle_velocity_3d, elastic_force);
        let post_friction_force = vec3.scale(friction_force, friction_force, 1 - particle.friction);

        return vec2.fromValues(post_elastic_force[0] +  post_friction_force[0], 
                                post_elastic_force[1] +  post_friction_force[1]);
    }

    private PrepareParticles(spawn_count: number, screen_width: number, screen_height: number) {
        let particles : Particle2DStruct[] = [];
        
        for (let i = 0; i < spawn_count; i++) {
            let randomPositionX = (Math.random() * screen_width);
            let randomPositionY = (Math.random() * screen_height);

            let particle : Particle2DStruct = {
                velocity : vec2.fromValues(0,0), 
                acceleration: vec2.fromValues(0,0), 
                position: vec2.fromValues(randomPositionX, randomPositionY), 
                radius: 10,
                mass: 1,
                elasticity: 0.5,
                friction: 0.5
            };

            particles.push(particle);
        }

        return particles;
    }

}