class SimpleCanvas {
    protected _canvasDom : HTMLCanvasElement;
    protected _context : CanvasRenderingContext2D;
    protected screenHeight : number;
    protected screenWidth : number;

    public IsProgramValid : boolean = false;

    public get ScreenHeight() { return this._canvasDom.height; }

    public get ScreenWidth() { return this._canvasDom.width; }

    public get Context() { return this._context; }

    constructor(queryString :string) {
        this._canvasDom = document.querySelector(queryString);
        this.IsProgramValid = this._canvasDom != null;

        if (this.IsProgramValid) {
            this._context = this._canvasDom.getContext("2d");
            this.RegisterDomEvent();    
            this.SetCanvasSize();
        }
    }

    protected RegisterDomEvent() {
        window.addEventListener('resize', () => {
            this.SetCanvasSize();
        });
    }

    protected SetCanvasSize() {
        this.SetCanvasToSceenSize(this._canvasDom);
    }

    public SetCanvasToSceenSize(canvas : HTMLCanvasElement) {
        canvas.width = this._canvasDom.clientWidth;
        canvas.height = this._canvasDom.clientHeight;
    }
}

export default SimpleCanvas;