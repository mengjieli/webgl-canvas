module webgl {

    export class BitmapProgram extends Program {

        private program:WebGLProgram;
        private buffer:WebGLBuffer;
        private a_Position:any;
        private a_TexCoord:any;
        private a_Alpha:any;
        private u_PMatrix:any;
        private u_alphaZeroPass:any;
        private gl:WebGLRenderingContext;

        /**
         * 图片渲染程序
         * @param gl
         * @param stageWidth
         * @param stageHeight
         */
        constructor(gl:WebGLRenderingContext, stageWidth:number, stageHeight:number) {
            super();
            //初始化作色器、program
            this.initProgram(gl);
            //初始化作色器固定变量 和 获取作色器中得变量
            this.initAttriLocation(gl, stageWidth, stageHeight);
            this.gl = gl;
        }

        /**
         * 初始化作色器、program
         * 1. 初始化 shader
         * 2. 初始化 program
         * 目前没有加 filter (滤镜) 的功能，后续可以继续扩展这两个 shader
         * @param gl
         */
        private initProgram(gl:WebGLRenderingContext):void {

            var vertexSource = `
             attribute vec2 a_TexCoord;
             attribute vec4 a_Position;
             attribute float a_Alpha;
             uniform mat4 u_PMatrix;
             varying vec2 v_TexCoord;
             varying float v_Alpha;
             varying vec2 v_Position;
             void main(void)
             {
                gl_Position = u_PMatrix*a_Position;
                v_Position = vec2(a_Position[0],a_Position[1]);
                v_TexCoord = a_TexCoord;
                v_Alpha = a_Alpha;
             }
             `;


            var fragmentSource = `
             precision mediump float;
             varying vec2 v_TexCoord;
             varying float v_Alpha;
             varying vec2 v_Position;
             uniform sampler2D u_Sampler;
             uniform int u_alphaZeroPass;
             void main(void)
             {
                gl_FragColor = texture2D(u_Sampler,v_TexCoord)*v_Alpha;
                if(u_alphaZeroPass != 0 && gl_FragColor[3] == 0.0) {
                    discard;
                }
             }
             `;

            var vertexShader = Program.createShader(gl, gl.VERTEX_SHADER, vertexSource);
            var fragmentShader = Program.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            this.program = Program.createWebGLProgram(gl, vertexShader, fragmentShader);
        }

        public changeSize(gl:WebGLRenderingContext, width:number, height:number):void {
            var projectionMatrix = this.projectionMatrix;
            projectionMatrix[0] = 2 / width;
            projectionMatrix[5] = -2 / height;
            gl.uniformMatrix4fv(this.u_PMatrix, false, projectionMatrix);
        }

        private projectionMatrix:Float32Array = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1]);

        /**
         * 初始化作色器固定变量 和 获取作色器中得变量
         * 主要初始化投影矩阵，投影矩阵不用每次调用都初始化，只要设置一次即可，除非舞台 (Stage) 的大小改变 (glViewPort)
         * 获取一些变量。
         * @param gl
         * @param width
         * @param height
         */
        private initAttriLocation(gl:WebGLRenderingContext, width:number, height:number):void {
            var projectionMatrix = this.projectionMatrix;
            projectionMatrix[0] = 2 / width;
            projectionMatrix[5] = -2 / height;

            var program = this.program;
            program["name"] = "bitmap program";
            gl.useProgram(this.program);

            if (!this.buffer) {
                this.buffer = gl.createBuffer();
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            this.a_Position = gl.getAttribLocation(program, "a_Position");
            gl.enableVertexAttribArray(this.a_Position);
            gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, $size * 5, 0);

            this.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
            gl.enableVertexAttribArray(this.a_TexCoord);
            gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, $size * 5, $size * 2);

            this.a_Alpha = gl.getAttribLocation(program, "a_Alpha");
            gl.enableVertexAttribArray(this.a_Alpha);
            gl.vertexAttribPointer(this.a_Alpha, 1, gl.FLOAT, false, $size * 5, $size * 4);

            this.u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
            gl.uniformMatrix4fv(this.u_PMatrix, false, projectionMatrix);

            this.u_alphaZeroPass = gl.getUniformLocation(program, "u_alphaZeroPass");
            gl.uniform1i(this.u_alphaZeroPass,0.0);
        }


        private textures:WebGLTexture[] = [];
        private count = [];
        private positionData = [];
        private blendMode = [];
        private alphaZeroPass = [];

        public get drawCount():number {
            return this.count.length;
        }

        public reset():void {
            var _this = this;
            _this.textures = [];
            _this.count = [];
            _this.positionData = [];
            _this.blendMode = [];
            _this.alphaZeroPass = [];
        }

        /**
         * 添加渲染任务，合并任务也是在这里进行。
         * @param task
         */
        public addTask(task:RenderTask):void {
            var bitmapTask = <BitmapTask>task;
            var texture = bitmapTask.texture;
            var matrix = bitmapTask.matrix;
            if (!texture) {
                return;
            }

            if (!this.textures.length || this.textures[this.textures.length - 1] != texture.texture ||
                this.blendMode[this.blendMode.length - 1] != task.blendMode ||
                this.alphaZeroPass[this.alphaZeroPass.length-1] != bitmapTask.alphaZeroPass) {
                this.textures.push(texture.texture);
                this.positionData.push([]);
                this.count.push(0);
                this.blendMode.push(task.blendMode);
                this.alphaZeroPass.push(bitmapTask.alphaZeroPass);
            }

            var index = this.count[this.count.length - 1] * 30;
            var positionData = this.positionData[this.positionData.length - 1];
            var width = texture.sourceWidth;
            var height = texture.sourceHeight;

            positionData[index] = matrix.b * height + matrix.tx;
            positionData[1 + index] = matrix.d * height + matrix.ty;
            positionData[2 + index] = texture.startX;
            positionData[3 + index] = texture.endY;
            positionData[4 + index] = bitmapTask.alpha;

            positionData[20 + index] = positionData[5 + index] = matrix.tx;
            positionData[21 + index] = positionData[6 + index] = matrix.ty;
            positionData[22 + index] = positionData[7 + index] = texture.startX;
            positionData[23 + index] = positionData[8 + index] = texture.startY;
            positionData[24 + index] = positionData[9 + index] = bitmapTask.alpha;

            positionData[15 + index] = positionData[10 + index] = matrix.a * width + matrix.b * height + matrix.tx;
            positionData[16 + index] = positionData[11 + index] = matrix.c * width + matrix.d * height + matrix.ty;
            positionData[17 + index] = positionData[12 + index] = texture.endX;
            positionData[18 + index] = positionData[13 + index] = texture.endY;
            positionData[19 + index] = positionData[14 + index] = bitmapTask.alpha;

            positionData[25 + index] = matrix.a * width + matrix.tx;
            positionData[26 + index] = matrix.c * width + matrix.ty;
            positionData[27 + index] = texture.endX;
            positionData[28 + index] = texture.startY;
            positionData[29 + index] = bitmapTask.alpha;

            this.count[this.count.length - 1]++;
        }

        /**
         * 渲染
         */
        public render():void {
            var _this = this;
            var gl = _this.gl;
            gl.useProgram(_this.program);
            //必须绑定 buffer 并且制定 buffer 的内容分配，之前测试的时候如果没有重新绑定 buffer 是不能正确设置 buffer 里面的值的。
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(_this.a_Position, 2, gl.FLOAT, false, $size * 5, 0);
            gl.vertexAttribPointer(_this.a_TexCoord, 2, gl.FLOAT, false, $size * 5, $size * 2);
            gl.vertexAttribPointer(_this.a_Alpha, 1, gl.FLOAT, false, $size * 5, $size * 4);
            if (this._offY) {
                var positionData = this.positionData;
                var pdata;
                var index = 0;
                for (var p = 0, plen = positionData.length; p < plen; p++) {
                    pdata = positionData[p];
                    for (var q = 0, qlen = pdata.length / 30; q < qlen; q++) {
                        index = q * 30;
                        pdata[index + 1] += this._offY;
                        pdata[index + 6] += this._offY;
                        pdata[index + 11] += this._offY;
                        pdata[index + 16] += this._offY;
                        pdata[index + 21] += this._offY;
                        pdata[index + 26] += this._offY;
                    }
                }
            }
            //开始渲染任务
            for (var i = 0, len = _this.textures.length; i < len; i++) {
                gl.uniform1i(this.u_alphaZeroPass,this.alphaZeroPass[i]?0:1);
                //切换混合模式
                BlendMode.changeBlendMode(this.blendMode[i]);
                //绑定当前需要渲染的纹理
                gl.bindTexture(gl.TEXTURE_2D, _this.textures[i]);
                //分配 buffer 内容
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_this.positionData[i]), gl.STATIC_DRAW);
                //真正的绘制，之前测试 drawElements 并不比 drawArrays 快，其实也很正常，因为二维里面顶点数据共用并不多，
                //一个矩形也就对角线的两个顶点各被共用两次(两个三角形共用)，远小于 3D 里面的立方体一个顶点被 6 个三角形共用。
                gl.drawArrays(gl.TRIANGLES, 0, 6 * _this.count[i]);
            }
        }
    }
}