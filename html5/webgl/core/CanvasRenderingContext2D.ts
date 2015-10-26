module webgl {

    export class CanvasRenderingContext2D {

        private _canvas:Canvas;
        private gl:WebGLRenderingContext;
        /**
         * 帧缓冲
         */
        private frameBuffer:WebGLFramebuffer;
        private depthRenderbuffer:WebGLRenderbuffer;
        /**
         * 帧纹理
         */
        private frameTexture:Texture;

        private bitmapProgram:BitmapProgram;

        $addedToStage:boolean = false;


        /**
         * 默认为不开启，开启后性能会降低. 如果启用，每调用一次 drawImage 等都会刷新一次屏幕，如果不开启会在 stage 里面每帧统一刷新一次屏幕。
         */
        private realTime:boolean = false;

        private deleteTextures:Texture[] = [];

        constructor(canvas:Canvas, options?:any) {
            this.canvas = canvas;
            this.bitmapProgram = Stage.$bitmapProgram;
            if (options && "realTime" in options) {
                this.realTime = !!options["realTime"];
            }
        }

        /**
         * 初始化，主要是初始化帧缓冲，一个 Context2D 就对应一个帧缓冲
         * 帧缓冲必须绑定一个纹理，可以不绑定深度缓冲区
         */
        private init():void {
            var gl = this.gl;
            if (!gl) {
                return;
            }
            //初始化帧缓冲
            this.frameBuffer = gl.createFramebuffer();
            var depthRenderbuffer = gl.createRenderbuffer();
            this.depthRenderbuffer = depthRenderbuffer;
            //初始化帧缓冲绑定的纹理
            var texture = CanvasRenderingContext2D.createRenderTexture(this._width, this._height);
            this.frameTexture = new Texture(texture, this._width, this._height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, this._width, this._height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                console.log("frame buffer error : " + gl.checkFramebufferStatus(gl.FRAMEBUFFER));
                return;
            }
            this.clearStencil();
        }

        /**
         * 清除内存，释放帧缓冲
         */
        private clear():void {
            var gl = this.gl;
            if (!gl) {
                return;
            }
            this.frameTexture.dispose();
            gl.deleteFramebuffer(this.frameBuffer);
            this.frameTexture = null;
            this.frameBuffer = null;
            this.gl = null;
            this._width = 0;
            this._height = 0;
            this.offY = 0;
        }

        /**
         * 这个环境可以绘制于其上的 Canvas 元素。
         */
        public get canvas():Canvas {
            return this._canvas;
        }

        private _inDraw:boolean = true;
        public set inDraw(val:boolean) {
            this._inDraw = !!val;
        }

        private offY = 0;

        /**
         * 设置要渲染哪个 Canvas，修改 Canvas 后必须重置帧缓冲，大小问题
         * @param canvas
         */
        public set canvas(canvas:Canvas) {
            if (this._canvas == canvas) {
                return;
            }
            this.clear();
            this._canvas = canvas;
            if (!canvas) {
                return;
            }
            this._width = canvas.width;
            this._height = canvas.height;
            this.offY = Stage.getInstance().height - this._height;
            this.gl = Stage.$webgl;
            this.init();
        }

        private _width:number;

        public set $width(val:number) {
            this._width = +val | 0;
        }

        private _height:number;

        public set $height(val:number) {
            this._height = +val | 0;
        }

        public get $texture():Texture {
            return this.frameTexture;
        }

        /**
         * 绘制图像，包含了绘制图像的3个方法，这里只是一些数字转换问题和纹理处理问题，主要的内容还是在 drawTexture 里。
         * 如果调用 drawImage ,每调用一次 drawImage 都会创建一个新的 Texture ，在绘制结束后自动释放。所以建议引擎里的 Bitmap 持有一个 Texture ，这样绘制时不用再创建 Texture ，效率会高 N 倍。
         * 不过这个也可以优化，比如调用 drawImage 后创建的 Texture ，做一个失效机制，比如当 Texture 内存大于多少时释放一些最早创建的 Texture，这样效率也会高很多。
         * @param image
         * @param sx
         * @param sy
         * @param sWidth
         * @param sHeight
         * @param dx
         * @param dy
         * @param dWidth
         * @param dHeight
         */
        public drawImage(image:HTMLImageElement|Canvas, sx:number, sy:number, sWidth?:number, sHeight?:number, dx?:number, dy?:number, dWidth?:number, dHeight?:number):void {
            var texture:Texture;
            if (image instanceof Canvas) {
                texture = (<Canvas>image).$context2d.$texture;
            } else {
                if (arguments.length == 9) {
                    texture = new Texture(CanvasRenderingContext2D.createTexture(<HTMLImageElement>image), image.width, image.height, sx, sy, sWidth, sHeight);
                } else {
                    texture = new Texture(CanvasRenderingContext2D.createTexture(<HTMLImageElement>image), image.width, image.height);
                }
                this.deleteTextures.push(texture);
            }
            var source = this._transform;
            var matrix = {a: source.a, b: source.b, c: source.c, d: source.d, tx: source.tx, ty: source.ty};
            if (arguments.length == 3) {
                matrix.tx += matrix.a * sx + matrix.b * sy;
                matrix.ty += matrix.c * sx + matrix.d * sy;
            } else if (arguments.length == 5) {
                matrix.tx += matrix.a * sx + matrix.b * sy;
                matrix.ty += matrix.c * sx + matrix.d * sy;
                var scaleX = sWidth / texture.width;
                var scaleY = sHeight / texture.height;
                matrix.a *= scaleX;
                matrix.b *= scaleY;
                matrix.c *= scaleX;
                matrix.d *= scaleY;
            } else if (arguments.length == 9) {
                matrix.tx += matrix.a * dx + matrix.b * dy;
                matrix.ty += matrix.c * dx + matrix.d * dy;
            }
            this.drawTexture(texture, matrix);
        }

        private tasks:RenderTask[] = [];

        private noDrawTaskLength:number = 0;

        /**
         * 渲染主体
         */
        public $render():void {
            var gl = this.gl;
            var tasks = this.tasks;
            var task:RenderTask;
            var program:Program;
            if (!tasks.length) {
                return;
            }
            //渲染计数器
            if (this._inDraw) {
                Stage.$count += tasks.length - this.noDrawTaskLength;
            }
            //检查文字纹理
            TextAtlas.$checkUpdate();
            //绑定当前帧缓冲纹理
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            //反转任务后，从尾部开始执行
            tasks.reverse();
            var hasRender = false;
            //渲染任务
            while (tasks.length) {
                task = tasks.pop();
                //如果是清屏的任务，直接执行就可以。
                if (task.program == null) {
                    if (program) {
                        program.render();
                        program = null;
                    }
                    task.render();
                    continue;
                }
                hasRender = true;
                //其它任务就看能否合并，如果不能合并就执行之前的任务。这里还有个优化没来的及做，就是图片如果纹理不同，但是区域没有跟之前的合并还是能继续合并渲染任务。
                if (!program) {
                    program = task.program;
                    program.reset();
                    program.offY = this.offY;
                }
                if (program != task.program) {
                    //draw 计数（合并过之后的）
                    if (this._inDraw) {
                        Stage.$draw += program.drawCount;
                    }
                    program.render();
                    program = task.program;
                    program.reset();
                    program.offY = this.offY;
                }
                program.addTask(task);
            }
            //执行最后的那个渲染 program。
            if (program) {
                //draw 计数（合并过之后的）
                if (this._inDraw) {
                    Stage.$draw += program.drawCount;
                }
                program.render();
            }
            while (this.deleteTextures.length) {
                this.deleteTextures.pop().dispose();
            }
            this.noDrawTaskLength = 0;
            if (hasRender) {
                Stage.getInstance().$setDirty();
            }
        }

        /**
         * 全局透明度
         * @type {number}
         * @private
         */
        private _globalAlpha:number = 1.0;
        public set globalAlpha(val:number) {
            this._globalAlpha = +val;
        }

        public get globalAlpha():number {
            return this._globalAlpha;
        }

        private _transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

        public setTransform(a:number, b:number, c:number, d:number, e:number, f:number):void {
            var matrix = this._transform;
            matrix.a = a;
            matrix.b = c;
            matrix.c = b;
            matrix.d = d;
            matrix.tx = e;
            matrix.ty = f;
        }

        public transform(a:number, b:number, c:number, d:number, e:number, f:number):void {
            var matrix = this._transform;
            var ma = matrix.a * a + matrix.b * b;
            var mb = matrix.a * c + matrix.b * d;
            var mc = matrix.c * a + matrix.d * b;
            var md = matrix.c * c + matrix.d * d;
            matrix.tx = matrix.a * e + matrix.b * f + matrix.tx;
            matrix.ty = matrix.c * e + matrix.d * f + matrix.ty;
            matrix.a = ma;
            matrix.b = mb;
            matrix.c = mc;
            matrix.d = md;
        }

        public translate(x:number, y:number):void {
            var matrix = this._transform;
            matrix.tx += matrix.a * x + matrix.b * y;
            matrix.ty += matrix.c * x + matrix.d * y;
        }

        public scale(x:number, y:number):void {
            var matrix = this._transform;
            matrix.a *= x;
            matrix.b *= y;
            matrix.c *= x;
            matrix.d *= y;
        }

        public rotate(rotation:number):void {
            rotation = -rotation;
            var sin = Math.sin(rotation);
            var cos = Math.cos(rotation);
            var matrix = this._transform;
            var a = matrix.a * cos - matrix.b * sin;
            var b = matrix.a * sin + matrix.b * cos;
            var c = matrix.c * cos - matrix.d * sin;
            var d = matrix.c * sin + matrix.d * cos;
            matrix.a = a;
            matrix.b = b;
            matrix.c = c;
            matrix.d = d;
        }

        private states = [];

        public save():void {
            this.states.push({
                "globalAlpha": this._globalAlpha,
                "transform": {
                    "a": this._transform.a,
                    "b": this._transform.b,
                    "c": this._transform.c,
                    "d": this._transform.d,
                    "tx": this._transform.tx,
                    "ty": this._transform.ty
                }
            });
        }

        public resotre():void {
            var state = this.states.pop();
            this.globalAlpha = state.globalAlpha;
            this.setTransform(state.transform.a, state.transform.c, state.transform.b, state.transform.d, state.transform.tx, state.transform.ty);
        }

        /**
         * 清除一块矩形区域内的像素颜色
         * @param x
         * @param y
         * @param width
         * @param height
         */
        public clearRect(x:number, y:number, width:number, height:number):void {
            if (x <= 0 && y <= 0 && x + width >= this._width && y + height >= this._height) {
                this.clearAll();
                return;
            }
            var task = new RectShapeTask(Stage.$rectShapeProgram, width, height, {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                tx: x,
                ty: y
            }, 0x00000000, BlendMode.OVERRIDE);
            this.tasks.push(task);
            if (this.realTime) {
                this.realTimeRender();
            }
        }

        private realTimeRender():void {
            this.$render();
            if (this.$addedToStage) {
                Stage.getInstance().$render();
            }
        }

        private _fillStyle:string = "#000000";
        public get fillStyle():string {
            return this._fillStyle;
        }

        public set fillStyle(val:string) {
            this._fillStyle = val;
        }

        private _font:string = "10px sans-serif";
        public get font():string {
            return this._font;
        }

        public set font(val:string) {
            this._font = val;
        }

        private _textAlign:string = "start";
        public get textAlign():string {
            return this._textAlign;
        }

        public set textAlign(val:string) {
            this._textAlign = val;
        }

        private _textBaseline:string = "alphabetic";
        public get textBaseline():string {
            return this._textBaseline;
        }

        public set textBaseline(val:string) {
            this._textBaseline = val;
        }

        public fillText(text:string, x:number, y:number, maxWidth?:number):void {
            var source = this._transform;
            var matrix = {a: source.a, b: source.b, c: source.c, d: source.d, tx: source.tx, ty: source.ty};
            matrix.tx += matrix.a * x + matrix.b * y;
            matrix.ty += matrix.c * x + matrix.d * y;
            this.fillTextMatrix(text, matrix, maxWidth);
        }

        //////////////////////////更多的 API 支持//////////////////////////////
        private _blendMode:number = 0;
        public get blendMode():number {
            return this._blendMode;
        }

        public set blendMode(val:number) {
            this._blendMode = +val | 0;
        }

        /**
         * 清除模板缓冲区
         * 主要功能是清除所有的遮罩
         */
        public clearStencil():void {
            this.tasks.push(ClearStencilTask.getInstance());
        }

        /**
         * 添加一个矩形区域当做遮罩
         * @param x
         * @param y
         * @param width
         * @param height
         */
        public addRectClip(x:number, y:number, width:number, height:number):void {
            this.tasks.push(new RectClipTask(this.frameBuffer, x, y, width, height));
        }

        public addImageClip(image:HTMLImageElement, x:number, y:number):void {
            this.addTextureClip(new Texture(CanvasRenderingContext2D.createTexture(image), image.width, image.height), x, y);
        }

        /**
         * 添加一个图像纹理当做遮罩，并且图像颜色 alpha 为 0 的地方不属于遮罩内
         * @param texture
         */
        public addTextureClip(texture:Texture, x:number, y:number):void {
            this.tasks.push(new TextureClipTask(this.frameBuffer, texture, x, y));
        }

        /**
         * 直接绘制纹理，绘制纹理会比绘制 HtmlImage 要快，因为绘制 HtmlImage 需要创建纹理，每次创建的纹理只利用一次，很浪费 CPU 资源。
         * 这里直接传 matrix ，不会受到 translate、rotate、scale 的影响，所以无论之前 context2d.translate(tx,ty) 传了什么值都不会影响绘制的位置。
         * @param texture 需要绘制的纹理。
         * @param matrix 仿射变换矩阵。
         */
        public drawTexture(texture:Texture, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}):void {
            this.tasks.push(new BitmapTask(this.bitmapProgram, texture, matrix, this._globalAlpha, this._blendMode));
            if (this.realTime) {
                this.realTimeRender();
            }
        }

        /**
         * 绘制文字。
         * 这里直接传 matrix ，不会受到 translate、rotate、scale 的影响，所以无论之前 context2d.translate(tx,ty) 传了什么值都不会影响绘制的位置。
         * 文字缩放后会自动采用最清晰的字体，然后进行缩小或者不缩放。
         * 注意，测试发现 canvas 测量值不支持 12 像素以下的字体，所以当字体小于 12 时会自动赋值为 12。
         * @param text 文字内容。
         * @param matrix 仿射变换矩阵。
         * @param maxWidth 文字的最大宽度，如果不传就不会换行。
         */
        public fillTextMatrix(text:string, matrix:{a:number;b:number;c:number;d:number;tx:number;ty:number}, maxWidth?:number):void {
            maxWidth = +maxWidth | 0;
            var size = parseInt(this._font.slice(0, this._font.search("px")));
            size = size < 12 ? 12 : size;
            var realSizeW = Math.ceil(size * Math.sqrt(matrix.a * matrix.a + matrix.c * matrix.c));
            var realSizeH = Math.ceil(size * Math.sqrt(matrix.b * matrix.b + matrix.d * matrix.d));
            var realSize = realSizeW > realSizeH ? realSizeW : realSizeH;
            var fontScale = realSize / size;
            var offY = Math.floor(size / 10);
            matrix.a /= fontScale;
            matrix.d /= fontScale;
            matrix.b /= fontScale;
            matrix.c /= fontScale;
            var family = this._font.slice(this._font.search("px") + 3, this._font.length);
            var bold = this._font.indexOf("");
            var startX = 0;
            var textWidth = 0;
            var textures = [];
            var matrixs = [];
            var textHeight = 0;
            for (var i = 0; i < text.length; i++) {
                var atlas = TextAtlas.getChar(this._fillStyle, family, realSize, this._font.search("bold") >= 0 ? true : false, this._font.search("italic") >= 0 ? true : false, text.charAt(i), this.realTime);
                textHeight = atlas.height;
                textWidth += atlas.width;
            }
            var scaleX = maxWidth && textWidth > maxWidth ? maxWidth / textWidth : 1;
            for (var i = 0; i < text.length; i++) {
                var atlas = TextAtlas.getChar(this._fillStyle, family, realSize, this._font.search("bold") >= 0 ? true : false, this._font.search("italic") >= 0 ? true : false, text.charAt(i), this.realTime);
                textures.push(atlas.texture);
                matrixs.push({
                    a: matrix.a * scaleX,
                    b: matrix.b,
                    c: matrix.c,
                    d: matrix.d,
                    tx: matrix.a * startX + matrix.tx,
                    ty: matrix.c * startX + matrix.ty + offY,
                });
                startX += atlas.width * scaleX;
            }
            for (i = 0; i < textures.length; i++) {
                if (this._textAlign == "center") {
                    matrixs[i].tx -= textWidth / 2;
                } else if (this._textAlign == "right" || this._textAlign == "end") {
                    matrixs[i].tx -= textWidth;
                }
                if (this._textBaseline == "middle") {
                    matrixs[i].ty -= textHeight / 2;
                } else if (this._textBaseline == "alphabetic") {
                    matrixs[i].ty -= textHeight;
                }
                this.drawTexture(textures[i], matrixs[i]);
            }
        }

        public clearAll():void {
            this.tasks.push(ClearTask.getInstance());
            this.noDrawTaskLength++;
            if (this.realTime) {
                this.realTimeRender();
            }
        }

        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        private static textureId:number = 0;

        /**
         * 这里并没有加 image 对应 texture 的对应表，也就是说调用两次 createTexture，传同一个 image，会创建两个 texture，还可以进一步优化。
         * @param image
         * @returns {WebGLTexture}
         */
        public static createTexture(image:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageData):WebGLTexture {
            var gl = Stage.$webgl;
            var texture = gl.createTexture();
            texture["id"] = CanvasRenderingContext2D.textureId;
            CanvasRenderingContext2D.textureId++;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>image);
            gl.bindTexture(gl.TEXTURE_2D, null);
            return texture;
        }

        public static updateTexture(texture:WebGLTexture, image:HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageData):void {
            var gl = Stage.$webgl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>image);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        public static createRenderTexture(width:number, height:number):WebGLTexture {
            var gl = Stage.$webgl;
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            return texture;
        }
    }
}