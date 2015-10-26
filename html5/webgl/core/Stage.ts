module webgl {
    export class Stage {

        private gl:WebGLRenderingContext;
        private children:Canvas[] = [];
        private tasks:BitmapTask[] = [];
        private topChildren:Canvas[] = [];
        private topTasks:BitmapTask[] = [];
        private runFlag:boolean = true;
        private _width:number;
        private _height:number;

        /**
         * 一个 stage 里面可以有好几个 canvas 按照顺序叠加显示
         * stage 分两层，一层是普通的 canvas 层，一层是 top，添加到 top ($addTopCanvasAt)的永远在普通的 canvas 层上。
         * @param gl
         * @param width
         * @param height
         */
        constructor(gl:WebGLRenderingContext, width:number, height:number) {
            if (Stage.instance) {
                return;
            }
            Stage.instance = this;
            this.gl = gl;
            this._width = width;
            this._height = height;
            this.init();
            this.startTick();
        }

        public get width():number {
            return this._width;
        }

        public get height():number {
            return this._height;
        }

        /**
         * 初始化 webgl 的基本参数，如果合并 3D 引擎后，这部分代码需要踢出去，看是做到一个公共库，还是做到 2d 或者 3d 里。需要合并的内容不多。
         */
        private init():void {
            var gl = this.gl;
            Stage.$webgl = gl;
            Stage.$bitmapProgram = new BitmapProgram(gl, this._width, this._height);
            Stage.$rectShapeProgram = new RectShapeProgram(gl, this._width, this._height);
            if (!Stage.$shareContext2D) {
                var canvas = document.createElement("canvas");
                canvas.width = this._width;
                canvas.height = this._height;
                Stage.$shareContext2D = canvas.getContext("2d");
            }
            gl.viewport(0, 0, this._width, this._height);
            gl.enable(gl.BLEND);
            gl.enable(gl.STENCIL_TEST);
            gl.blendColor(1.0, 1.0, 1.0, 1.0);
            //gl.enable(gl.CULL_FACE);
            gl.activeTexture(gl.TEXTURE0);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
            gl.clearColor(0.5, 0.5, 0.5, 1.0);
            t.MainCommand.getInstance();
        }

        //时间轴
        private startTick():void {
            var requestAnimationFrame =
                window["requestAnimationFrame"] ||
                window["webkitRequestAnimationFrame"] ||
                window["mozRequestAnimationFrame"] ||
                window["oRequestAnimationFrame"] ||
                window["msRequestAnimationFrame"];

            if (!requestAnimationFrame) {
                requestAnimationFrame = function (callback) {
                    return window.setTimeout(callback, 1000 / 60);
                };
            }
            var _this = this;
            requestAnimationFrame.call(window, onTick);
            function onTick():void {
                if (_this.runFlag) {
                    var time:number = (new Date()).getTime();
                    BlendMode.changeBlendMode(BlendMode.NONE);
                    Stage.$count = Stage.$draw = 0;
                    //渲染每个 Canvas (帧缓冲)
                    _this.preRender();
                    //把 Canvas (帧缓冲)绘制到舞台(屏幕)上
                    _this.$render();
                    //渲染计数
                    //FPSCount.getInstance().setRenderCount(Stage.$count);
                    //FPSCount.getInstance().setRenderDraw(Stage.$draw);
                    //FPSCount.useTime((new Date()).getTime() - time);
                    //FPSCount.addCount();
                }
                requestAnimationFrame.call(window, onTick);
            }
        }

        /**
         * 添加一个 Canvas 到舞台，每个 Canvas 相当于一张图片，所以渲染的时候加一个图片渲染任务就可以了。
         * @param canvas
         * @param index
         */
        public addCanvasAt(canvas:Canvas, index:number = -1) {
            var gl = this.gl;
            if (index == -1) {
                index = this.children.length;
            }
            this.children.splice(index, 0, canvas);
            if (canvas.$context2d == null) {
                this.tasks.splice(index, 0, null);
            } else {
                this.tasks.splice(index, 0, new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                    a: 1,
                    b: 0,
                    c: 0,
                    d: -1,
                    tx: 0,
                    ty: canvas.height
                }, 1.0, BlendMode.NORMAL));
            }
            canvas.$stage = this;
            //if (this.children.length == 0) {
            //    FPSCount.getInstance();
            //}
        }

        public $addTopCanvasAt(canvas:Canvas, index:number = -1) {
            var gl = this.gl;
            if (index == -1) {
                index = this.topChildren.length;
            }
            this.topChildren.splice(index, 0, canvas);
            if (canvas.$context2d == null) {
                this.topTasks.splice(index, 0, null);
            } else {
                this.topTasks.splice(index, 0, new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                    a: 1,
                    b: 0,
                    c: 0,
                    d: -1,
                    tx: 0,
                    ty: canvas.height
                }, 1.0, BlendMode.NORMAL));
            }
            canvas.$stage = this;
            //if (this.topChildren.length == 0) {
            //    FPSCount.getInstance();
            //}
        }

        $setCanvasTask(canvas:Canvas):void {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] == canvas) {
                    var gl = this.gl;
                    this.tasks[i] = new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: -1,
                        tx: 0,
                        ty: canvas.height
                    }, 1.0, BlendMode.NORMAL);
                    break;
                }
            }
            for (var i = 0; i < this.topChildren.length; i++) {
                if (this.topChildren[i] == canvas) {
                    var gl = this.gl;
                    this.topTasks[i] = new BitmapTask(Stage.$bitmapProgram, canvas.$context2d.$texture, {
                        a: 1,
                        b: 0,
                        c: 0,
                        d: -1,
                        tx: 0,
                        ty: canvas.height
                    }, 1.0, BlendMode.NORMAL);
                    break;
                }
            }
        }

        public removeCanvas(canvas:Canvas):void {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] == canvas) {
                    canvas.$stage = null;
                    this.children.splice(i, 1);
                    this.tasks.splice(i, 1);
                    break;
                }
            }
        }

        public $removeTopCanvas(canvas:Canvas):void {
            for (var i = 0; i < this.topChildren.length; i++) {
                if (this.topChildren[i] == canvas) {
                    canvas.$stage = null;
                    this.topChildren.splice(i, 1);
                    this.topTasks.splice(i, 1);
                    break;
                }
            }
        }

        public set clearColor(color:number) {
            this.gl.clearColor(color, color >> 8 | 0XFF, color | 0XFF, 1.0);
        }

        private _dirty:boolean = false;

        $setDirty():void {
            this._dirty = true;
        }

        /**
         * 渲染每个 Canvas
         */
        private preRender():void {
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                children[i].$context2d.$render();
            }
            children = this.topChildren;
            for (var i = 0; i < children.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                children[i].$context2d.$render();
            }
        }

        /**
         * 渲染到舞台
         */
        $render():void {
            //如果舞台没有 dirty（Canvas 没有渲染任务），舞台也不需要刷新。
            if (!this._dirty) {
                return;
            }
            this._dirty = false;
            var gl = this.gl;
            //绑定舞台的渲染纹理。
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            //清除舞台，这句如果和 3d 合并之后应该去掉
            gl.clear(gl.COLOR_BUFFER_BIT);
            //渲染每个 Canvas
            var program = Stage.$bitmapProgram;
            program.reset();
            program.offY = 0;
            //渲染普通的 Canvas 层
            var children = this.children;
            for (var i = 0; i < this.tasks.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                program.addTask(this.tasks[i]);
            }
            //渲染 top 层的 Canvas
            children = this.topChildren;
            for (var i = 0; i < this.topTasks.length; i++) {
                if (!children[i].$context2d) {
                    continue;
                }
                program.addTask(this.topTasks[i]);
            }
            program.render();
        }

        private static instance:Stage;

        public static getInstance():Stage {
            return Stage.instance;
        }

        public static create(gl:WebGLRenderingContext, width:number, height:number):void {
            new Stage(gl, width, height);
        }

        public static $count:number = 0;
        public static $draw:number = 0;

        public static $webgl:WebGLRenderingContext;
        //图片渲染程序，渲染程序基本是固定的几个，渲染任务是每次调用一个 drawImage 或则 fillText 之类的用来保存渲染命令的，其实也可以立马渲染，但是立马渲染就不能做合并操作的优化了。
        public static $bitmapProgram:BitmapProgram;
        //渲染一个矩形区域的程序，暂时只用来清部分屏幕 (clearRect)，叠加模式用 override （颜色覆盖），然后渲染一个颜色为 0x00000000 的矩形区域。
        public static $rectShapeProgram:RectShapeProgram;
        //HTML 的 CanvasRenderingContext2D
        public static $shareContext2D:any;
    }
}