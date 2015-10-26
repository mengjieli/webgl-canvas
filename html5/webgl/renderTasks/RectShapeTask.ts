module webgl {

    export class RectShapeTask extends RenderTask {

        constructor(program:RectShapeProgram, width:number, height:number, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}, fillColor:number,blendMode:number) {
            super(program,blendMode);
            this._width = width;
            this._height = height;
            this._matrix = matrix;
            this._fillColor = fillColor;
        }

        private _texture:Texture;
        public get texture():Texture {
            return this._texture;
        }

        private _width:number;
        public get width():number {
            return this._width;
        }

        private _height:number;
        public get height():number {
            return this._height;
        }

        private _matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number};
        public get matrix():{a:number;b:number;c:number;d:number;tx:number;ty:number} {
            return this._matrix;
        }

        private _fillColor:number;

        public get fillColor():number {
            return this._fillColor;
        }
    }
}