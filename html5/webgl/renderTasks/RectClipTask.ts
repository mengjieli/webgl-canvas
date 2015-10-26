module webgl {

    export class RectClipTask extends RenderTask {

        private x:number;
        private y:number;
        private width:number;
        private height:number;
        private frameBuffer:WebGLFramebuffer;

        constructor(frameBuffer:WebGLFramebuffer,x:number,y:number,width:number,height:number) {
            super(null);
            this.frameBuffer = frameBuffer;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        public render():void {
            var gl = Stage.$webgl;
            //绑定当前帧缓冲纹理
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.stencilFunc(gl.NEVER,0x00,0xFF);
            gl.stencilOp(gl.INCR,gl.KEEP,gl.KEEP);
            var stencilTask = new RectShapeTask(Stage.$rectShapeProgram, this.width, this.height, {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                tx: this.x,
                ty: this.y
            }, 0xffff0000, BlendMode.OVERRIDE);
            var stencilProgram = stencilTask.program;
            stencilProgram.reset();
            stencilProgram.addTask(stencilTask);
            stencilProgram.render();
            gl.stencilFunc(gl.NOTEQUAL,0x01,0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
        }
    }
}