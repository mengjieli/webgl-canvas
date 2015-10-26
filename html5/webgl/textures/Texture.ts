module webgl {

    /**
     * 纹理信息
     * 包含一个真正的 2D 纹理 WebGLTexture 和纹理的别的信息，比如是否是里面的某一块(sourceX、sourceY、sourceWidth、sourceHeight)，目前没有做取某一块并旋转的功能
     */
    export class Texture {

        private static id:number = 0;

        constructor(texture:WebGLTexture, width:number, height:number, sourceX?:number, sourceY?:number, sourceWidth?:number, sourceHeight?:number) {
            this._texture = texture;
            this._width = +width | 0;
            this._height = +height | 0;
            this._sourceX = +sourceX | 0;
            this._sourceY = +sourceY | 0;
            this._sourceWidth = +sourceWidth | 0;
            this._sourceHeight = +sourceHeight | 0;
            if (!this._sourceWidth) {
                this._sourceWidth = this._width;
            }
            if (!this._sourceHeight) {
                this._sourceHeight = this._height;
            }
            this._startX = this._sourceX / this._width;
            this._startY = this._sourceY / this._height;
            this._endX = (this._sourceX + this._sourceWidth) / this._width;
            this._endY = (this._sourceY + this._sourceHeight) / this._height;
            this._id = Texture.id;
            Texture.id++;
        }

        private _id:number = 0;
        public get id():number {
            return this._id;
        }

        private _texture:WebGLTexture;
        public get texture():WebGLTexture {
            return this._texture;
        }

        public set texture(val:WebGLTexture) {
            this._texture = val;
        }

        private _width:number;
        public get width():number {
            return this._width;
        }

        public set width(val:number) {
            this._width = +val | 0;
        }

        private _height:number;
        public get height():number {
            return this._height;
        }

        public set height(val:number) {
            this._height = +val | 0;
        }

        private _sourceX:number;
        public get sourceX():number {
            return this._sourceX;
        }

        public set sourceX(val:number) {
            this._sourceX = +val | 0;
        }

        private _sourceY:number;
        public get sourceY():number {
            return this._sourceY;
        }

        public set sourceY(val:number) {
            this._sourceY = +val | 0;
        }

        private _sourceWidth:number;
        public get sourceWidth():number {
            return this._sourceWidth;
        }

        public set sourceWidth(val:number) {
            this._sourceWidth = +val | 0;
        }

        private _sourceHeight:number;
        public get sourceHeight():number {
            return this._sourceHeight;
        }

        public set sourceHeight(val:number) {
            this._sourceHeight = +val | 0;
        }

        private _startX:number;
        public get startX():number {
            return this._startX;
        }

        private _startY:number;
        public get startY():number {
            return this._startY;
        }

        private _endX:number;
        public get endX():number {
            return this._endX;
        }

        private _endY:number;
        public get endY():number {
            return this._endY;
        }

        public dispose():void {
            Stage.$webgl.deleteTexture(this._texture);
            this._texture = null;
        }
    }
}