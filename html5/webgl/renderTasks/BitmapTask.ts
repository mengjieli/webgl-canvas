module webgl {

    export class BitmapTask extends RenderTask {

        constructor(program:BitmapProgram, texture:Texture, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}, alpha:number,blendMode:number,alphaZeroPass:boolean=true) {
            super(program,blendMode);
            this._texture = texture;
            this._matrix = matrix;
            this._alpha = alpha;
            this._alphaZeroPass = alphaZeroPass;
        }

        private _texture:Texture;
        public get texture():Texture {
            return this._texture;
        }

        private _matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number};
        public get matrix():{a:number;b:number;c:number;d:number;tx:number;ty:number} {
            return this._matrix;
        }

        private _alpha:number;
        public get alpha():number {
            return this._alpha;
        }

        public _alphaZeroPass:boolean;
        public get alphaZeroPass():boolean {
            return this._alphaZeroPass;
        }
    }
}