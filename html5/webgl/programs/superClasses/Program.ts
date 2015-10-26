module webgl {

    export var $size = (new Float32Array([0.0])).BYTES_PER_ELEMENT;

    export class Program {

        constructor() {

        }

        public reset():void {

        }

        public addTask(task:RenderTask):void {

        }

        /**
         * offY 是来自于 Canvas 的高度不等于最初的 glViewPort 的高度时需要用到的值。如果这个 Canvas 没有显示到舞台也没关系了，不会影响到任何性能。
         * offY 不能合并到 glsl 里是因为 canvas 的宽高会改变，所以没法一开始就写死。
         * @type {number}
         * @private
         */
        protected _offY:number = 0;
        public set offY(val:number) {
            this._offY = val;
        }

        public render():void {

        }

        public get drawCount():number {
            return 0;
        }

        /**
         * 创建应用程序。创建应用程序步骤如下：
         * 1. 创建应用程序，gl.createProgram()
         * 2. 绑定着色器，至少要绑定顶点着色器和片段着色器，gl.attachShader(program,shader)
         * 3. 链接程序，gl.linkProgram(program)
         *
         * 其它：
         * 在着色器真正起作用前还需要调用 gl.useProgram(program)
         * gl.getProgramParameter(program,status) 可以查询程序状态。
         * gl.getProgramInfoLog(program) 可以查询程序日志。
         * 如果着色器链接失败，可以调用 gl.deleteProgram(program) 删除程序。
         *
         * @param vertexShader 顶点着色器
         * @param fragmentShader 片段着色器
         * @returns {WebGLProgram}
         */
        public static createWebGLProgram(gl:WebGLRenderingContext,vertexShader:WebGLShader, fragmentShader:WebGLShader):WebGLProgram {
            var program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.log("Link program error : ", gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return null;
            }
            return program;
        }

        /**
         * 创建着色器。创建着色器步骤如下：
         * 1. 创建着色器，gl.createShader(shaderType)
         * 2. 指定着色器程序，gl.shaderSource(shader,source)
         * 3. 编译着色器，gl.compileShader(shader);
         *
         * 其它补充：
         * gl.getShaderParameter(shader,status) 可以查询着色器状态。
         * gl.getShaderInfoLog(shader) 可以查询着色器日志。
         * 如果编译着色器失败，可以调用 gl.deleteShader(shader) 删除着色器。
         *
         * @param type 着色器类型 gl.VERTEX_SHADER 或 gl.FRAGMENT_SHADER
         * @param source 着色器程序
         * @returns {WebGLShader}
         */
        public static createShader(gl:WebGLRenderingContext,type:number, source:string):WebGLShader {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log("Compile shader error : ", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }
    }
}