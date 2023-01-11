import { vec2, vec3 } from "gl-matrix";
import SimpleCanvas from "../Hsinpa/SimpleCanvas";
import {Particle2DStruct, PlaneStruct, FlipperStruct, WireStruct} from './PhysicsStruct';
import {PlaneEquationDetection, IntersectionPlane, Clamp, RandomRange} from './PhysicsUtility';
import {CanvasHelper, RoundRectStruct} from '../Canvas/CanvasHelper';
import {InputHandler, InputMovementCallback} from '../Hsinpa/Input/InputHandler';

export default class PhysicsParticle {
    private m_simple_canvas: SimpleCanvas;
    private m_particles: Particle2DStruct[];
    private m_floor: PlaneStruct;
    private m_canvas_helper: CanvasHelper;
    private m_fliper_left: FlipperStruct;
    private m_fliper_right: FlipperStruct;

    private m_input_handler : InputHandler;
    private m_wire_struct : WireStruct;

    public TimeStamp : number = 0;
    public DeltaTime: number = 0;

    public constructor(canvas_dom_query: string) {
        this.m_simple_canvas = new SimpleCanvas(canvas_dom_query);
        this.m_canvas_helper = new CanvasHelper(this.m_simple_canvas.Context);
        this.m_particles = this.PrepareParticles(1, this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);
        
        this.m_wire_struct = { position: vec2.fromValues(this.m_simple_canvas.ScreenWidth / 2, this.m_simple_canvas.ScreenHeight / 2), radius: 100 };
        this.m_floor = {position: vec3.fromValues(0,this.m_simple_canvas.ScreenHeight, 0), normal: vec3.fromValues(0, -1, 0)};
        this.m_fliper_left = { shape: new RoundRectStruct(10, 500, 10, 90, Math.PI * -0.1, Math.PI * 0.1), angular_velocity: 10};
        this.m_fliper_right = { shape: new RoundRectStruct(230, 500, 10, 90, Math.PI * -0.9, Math.PI * -1.1), angular_velocity: 10};

        console.log(`Flipper left ${this.m_fliper_left.shape.sign}`);
        console.log(`Flipper right ${this.m_fliper_right.shape.sign}`);

        this.m_input_handler = new InputHandler();
        this.m_input_handler.RegisterMovementEvent(null);
        console.log(`Canvas height ${this.m_simple_canvas.ScreenWidth}, width ${this.m_simple_canvas.ScreenHeight}`)
        
        window.requestAnimationFrame(this.Render.bind(this));
    }

    public Render(timestamp: number) {
        this.m_input_handler.OnUpdate();
        this.DeltaTime = (timestamp - this.TimeStamp) * 0.001;
        this.TimeStamp = timestamp;

        this.m_simple_canvas.Context.clearRect(0, 0, this.m_simple_canvas.ScreenWidth, this.m_simple_canvas.ScreenHeight);

        let spawn_count = this.m_particles.length;
        for (let i = 0; i < spawn_count; i++) {
            this.Simulate(this.m_particles[i]);
            this.DrawSphere(this.m_simple_canvas.Context, this.m_particles[i].position, this.m_particles[i].radius);        
        }
        
        this.m_canvas_helper.DrawRoundRect(this.m_fliper_left.shape);
        this.m_canvas_helper.DrawRoundRect(this.m_fliper_right.shape);
        this.m_canvas_helper.DrawWire(this.m_wire_struct.position, this.m_wire_struct.radius, 2);

        this.SimulateFlipper(this.m_input_handler.MovementDirection[0], this.m_input_handler.MovementDirection[1]);

        window.requestAnimationFrame(this.Render.bind(this));
    }

    private DrawSphere(context: CanvasRenderingContext2D, position: vec2, radius: number) {
        let x = position[0];
        let y = position[1];

        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'red';
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

        particle = this.ProcessWireSolver(lastPosition, particle, this.m_wire_struct);

        //Collision Detection
        this.ProcessCollision(particle, lastPosition, lastVelocity);
    }

    private SimulateFlipper(left_flipper: number, right_flipper: number) {
        let left_angle = this.m_fliper_left.shape.angle + (left_flipper * this.m_fliper_left.angular_velocity * this.DeltaTime);
            left_angle = Clamp(left_angle, this.m_fliper_left.shape.max_angle, this.m_fliper_left.shape.rest_angle);

        let right_angle = this.m_fliper_right.shape.angle - (right_flipper * this.m_fliper_right.angular_velocity * this.DeltaTime);
            right_angle = Clamp(right_angle, this.m_fliper_right.shape.rest_angle, this.m_fliper_right.shape.max_angle);

        this.m_fliper_left.shape.angle = left_angle;
        this.m_fliper_right.shape.angle = right_angle;
    }

    private ProcessWireSolver(lastParticlePosition: vec2, particle: Particle2DStruct, wire: WireStruct) {
        let dist = vec2.distance(wire.position, particle.position);
        
        if (dist < wire.radius || isNaN(dist)) {
            return particle;
        }

        let wireDist = dist - wire.radius; 
        let diff = vec2.subtract(vec2.create(), wire.position, particle.position);
        let normal = vec2.normalize(diff, diff);
  
        let move_offset = vec2.scale(vec2.create(), normal, wireDist);
        particle.position = vec2.add(particle.position, particle.position, move_offset);

        particle.velocity = vec2.subtract(vec2.create(), particle.position, lastParticlePosition);
        particle.velocity[0] = particle.velocity[0];
        particle.velocity[1] = particle.velocity[1];
        

        return particle;
    }

    private ProcessCollision(particle: Particle2DStruct, lastPosition: vec2, lastVelocity: vec2) {

        lastVelocity = vec2.normalize(lastVelocity, lastVelocity);
        let last_velocity_3d = vec3.fromValues(-lastVelocity[0], -lastVelocity[1], 0);
        let particle_pos_3d = vec3.fromValues(particle.position[0], particle.position[1], 0);
        let collision_value = PlaneEquationDetection(this.m_floor.position, this.m_floor.normal, particle_pos_3d);

        let last_pos_3d = vec3.fromValues(lastPosition[0], lastPosition[1] , 0);

        if (collision_value < particle.radius) {
            // let t = IntersectionPlane(this.m_floor.position, this.m_floor.normal, last_pos_3d, last_velocity_3d);
            let collision_point = vec3.add(last_pos_3d, last_pos_3d, vec3.scale(last_velocity_3d, last_velocity_3d, particle.radius - collision_value));

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
                velocity : vec2.fromValues( RandomRange(1, 2),0), 
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