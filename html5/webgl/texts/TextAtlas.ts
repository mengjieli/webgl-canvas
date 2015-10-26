module webgl {

    /**
     * 文本内容管理(主要是文本纹理管理)
     * 一个 TextAtlas 对应一种 fontColor、fontFamily、fontSize、bold、italic，这些值只要一个改变就会创建不同的 TextAtlas
     * 文字在 Texture 是按照从上到下、从左到右一个个拍的，每一行文字的纹理高度取最高的那个，然后紧接着排下一行文字纹理。
     * 一张文字纹理的大小目前是 512 x 512，排满后会申请一个新的纹理来存储新的文字纹理。
     * 如果想看当前有哪些文字纹理的话可以打开 addNewTexture() 里的 document.body.appendChild(this.canvas); 就可以了。
     */
    export class TextAtlas {

        constructor(fontColor:String, fontFamily:string, fontSize:number, bold:boolean, italic:boolean) {
            this._fontColor = fontColor;
            this._fontFamily = fontFamily;
            this._fontSize = fontSize;
            this._bold = bold;
            this._italic = italic;
            this.charHeight = fontSize;
            this.addNewTexture();
        }

        private _fontColor:String;
        public get fontColor():String {
            return this._fontColor;
        }

        private _fontFamily:string;
        public get fontFamily():string {
            return this._fontFamily;
        }

        private _fontSize:number;
        public get fontSize():number {
            return this._fontSize;
        }

        private _bold:boolean;
        public get bold():boolean {
            return this._bold;
        }

        private _italic:boolean;
        public get italic():boolean {
            return this._italic;
        }

        private size = 512;
        private charHeight;
        private canvas;
        private context2d;
        private texture:WebGLTexture;
        private startX:number = 0;
        private startY:number = 0;
        private dirtyTextures:WebGLTexture[] = [];
        private dirtyTextureIds = {};
        private dirtyCanvas = [];
        private lineHeight:number = 0;
        private dirty:boolean = false;

        /**
         * 添加一张新的纹理用于存储文字纹理
         */
        private addNewTexture():void {
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.canvas.height = this.size;
            this.context2d = this.canvas.getContext("2d");
            this.context2d.clearRect(0, 0, this.size, this.size);
            this.context2d.scale(1, 1);
            this.context2d.textAlign = "left";
            this.context2d.textBaseline = "top";
            this.context2d.font = (this._bold ? "bold " : "") + (this._italic ? "italic " : "") + this._fontSize + "px " + this._fontFamily;
            this.context2d.fillStyle = this._fontColor;
            this.texture = webgl.CanvasRenderingContext2D.createTexture(this.canvas);
            this.startX = this.startY = 0;
            this.lineHeight = 0;
            //document.body.appendChild(this.canvas);
        }

        private chars = {};

        /**
         * 获取文字信息
         * 有新的文字信息后不会立马更新对应的 Texture，会在第一个 Canvas 绘制(render)时更新
         * @param char
         * @param realTime
         * @returns {any}
         */
        public getChar(char:string, realTime:boolean):TextAtlasInfo {
            if (!this.chars[char]) {
                var context2d = Stage.$shareContext2D;
                context2d.font = (this._bold ? "bold " : "") + (this._italic ? "italic " : "") + this._fontSize + "px " + this._fontFamily;
                //由于中文文字也会超出基线下方，字体每大 50 号多一像素
                var charHeight = Math.ceil(this.charHeight * 1.02);
                //gjpqy会超出基线下方，字体每大 5 号多一像素
                if (char == "g" || char == "j" || char == "p" || char == "q" || char == "y") {
                    charHeight = Math.ceil(this.charHeight * 1.2);
                }
                //Q会超出基线下方，字体每大 15 号多一像素
                if (char == "Q") {
                    charHeight += Math.ceil(this.charHeight * 0.066);
                }
                var w = Stage.$shareContext2D.measureText(char).width;
                if (w + this.startX > this.size) {
                    this.startX = 0;
                    this.startY += this.lineHeight;
                    this.lineHeight = 0;
                }
                if (this.startY + charHeight > this.size) {
                    this.addNewTexture();
                }
                if (charHeight > this.lineHeight) {
                    this.lineHeight = charHeight;
                }
                //产生一个新的文字信息
                this.chars[char] = new TextAtlasInfo(new Texture(this.texture, this.size, this.size, this.startX, this.startY, Math.ceil(w), charHeight), this.startX, this.startY, w, charHeight, char);
                this.context2d.fillText(char, this.startX, this.startY);
                this.startX += Math.ceil(w);
                if (!this.dirtyTextureIds[this.texture["id"]]) {
                    this.dirtyTextureIds[this.texture["id"]] = true;
                    this.dirtyTextures.push(this.texture);
                    this.dirtyCanvas.push(this.canvas);
                }
                if (realTime) {
                    this.update();
                } else {
                    if (!this.dirty) {
                        TextAtlas.updateList.push(this);
                        this.dirty = true;
                    }
                }
            }
            return this.chars[char];
        }

        /**
         * 更新对应的纹理
         */
        public update():void {
            if (this.dirtyTextures.length) {
                while (this.dirtyTextures.length) {
                    var texture = this.dirtyTextures.pop();
                    delete this.dirtyTextureIds[texture["id"]];
                    webgl.CanvasRenderingContext2D.updateTexture(texture, this.dirtyCanvas.pop());
                }
            }
            this.dirty = false;
        }

        private static updateList:TextAtlas[] = [];

        public static $checkUpdate():void {
            while (TextAtlas.updateList.length) {
                TextAtlas.updateList.pop().update();
            }
        }

        private static atlases = {};

        public static getChar(fontColor:String, fontFamily:string, fontSize:number, bold:boolean, italic:boolean, char:string, realTime:boolean):TextAtlasInfo {
            var key = fontFamily + fontSize + (bold ? "1" : "0") + (italic ? "1" : "0");
            if (!TextAtlas.atlases[key]) {
                TextAtlas.atlases[key] = new TextAtlas(fontColor, fontFamily, fontSize, bold, italic);
            }
            return TextAtlas.atlases[key].getChar(char, realTime);
        }
    }
}