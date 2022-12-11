import { vec2, vec3 } from "gl-matrix";
import { KeycodeLookupTable, InputEventTitle } from "./KeycodeTable";



export const InputMovementType = Object.freeze({
    Left : vec2.fromValues(2, 0),
    Right : vec2.fromValues(0, 2),
})

export interface InputMovementCallback {
    (direction: vec2): void;
}

export interface InputMouseCallback {
    (mouse_delta: number[]): void;
}

export interface InputMouseClickCallback {
    (): void;
}
  
export class InputHandler {

    private _buttonState = Object.create({});

    private _keyboardCallback : InputMovementCallback;
    private _cacheKeyboardDirection : vec2 = vec2.create();

    constructor() {

    }

    public get MovementDirection() {return this._cacheKeyboardDirection; }

    public GetButtonState(actionName : string) : boolean {
        return false;
    }

    public RegisterButtonEvent(callback : InputMouseClickCallback) {
        window.addEventListener('click', e => {
            callback();
        });  
    }

    public RegisterMouseMovement(canvasDom : HTMLBodyElement, callback : InputMouseCallback) {
        canvasDom.requestPointerLock();

        let deltaArray = [0, 0];
        window.addEventListener('mousemove', e => {
            deltaArray[0] = e.movementX;
            deltaArray[1] = e.movementY;

            callback(deltaArray);
        });
    }

    public RegisterMovementEvent(callback : InputMovementCallback) {

        let self = this;
        this._keyboardCallback = callback;

        window.addEventListener("keydown", e => {
            let lowerCaseKey = e.key.toLowerCase();
            if (lowerCaseKey in KeycodeLookupTable) {
                this.SetKeyboardState(KeycodeLookupTable[lowerCaseKey], true);
            }
        } );

        window.addEventListener("keyup", e => {
            let lowerCaseKey = e.key.toLowerCase();

            if (lowerCaseKey in KeycodeLookupTable)
                this.SetKeyboardState(KeycodeLookupTable[lowerCaseKey], false);
        } );
    }

    public OnUpdate() {
        //Reset to zero
        this._cacheKeyboardDirection[0] = -1;
        this._cacheKeyboardDirection[1] = -1;
        
        if (this._buttonState.hasOwnProperty(InputEventTitle.left)) {
            vec2.add(this._cacheKeyboardDirection, this._cacheKeyboardDirection,InputMovementType.Left);
        }

        if (this._buttonState.hasOwnProperty(InputEventTitle.right)) {
            vec2.add(this._cacheKeyboardDirection, this._cacheKeyboardDirection,InputMovementType.Right);
        }
        // console.log(this._cacheKeyboardDirection);

        if (this._keyboardCallback != null)
            this._keyboardCallback(this._cacheKeyboardDirection);
    }

    private SetKeyboardState(keyCode : string, state : boolean) {
        if (state)
            this._buttonState[keyCode] = true;
        else 
            delete this._buttonState[keyCode];
    }
}