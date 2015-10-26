module webgl {

    /**
     * 单个文字信息比如字母 a 就对应一个 TextAtlasInfo，字母 b 又是另外一个 TextAtlasInfo
     */
    export class TextAtlasInfo {
        constructor(texture:Texture,x:number,y:number,width:number,height:number,char:string) {
            this._texture = texture;
            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;
            this._char = char;
        }

        private _char:string;
        public get char():string {
            return this._char;
        }

        private _texture:Texture;
        public get texture():Texture {
            return this._texture;
        }

        private _x:number;
        public get x():number {
            return this._x;
        }

        private _y:number;
        public get y():number {
            return this._y;
        }

        private _width:number;
        public get width():number {
            return this._width;
        }

        private _height:number;
        public get height():number {
            return this._height;
        }
    }
}