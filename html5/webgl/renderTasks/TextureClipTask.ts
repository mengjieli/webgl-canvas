module webgl {

    export class TextureClipTask extends RenderTask {

        private x:number;
        private y:number;
        private texture:Texture;
        private frameBuffer:WebGLFramebuffer;

        constructor(frameBuffer:WebGLFramebuffer,texture:Texture,x:number,y:number) {
            super(null);
            this.frameBuffer = frameBuffer;
            this.x = x;
            this.y = y;
            this.texture = texture;
        }

        public render():void {
            var gl = Stage.$webgl;
            //绑定当前帧缓冲纹理
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.stencilFunc(gl.NEVER,0x00,0xFF);
            gl.stencilOp(gl.INCR,gl.KEEP,gl.KEEP);
            var stencilTask = new BitmapTask(Stage.$bitmapProgram, this.texture, {a: 1, b: 0, c: 0, d: 1, tx: this.x, ty: this.y}, 1, BlendMode.NONE,false);
            var stencilProgram = stencilTask.program;
            stencilProgram.reset();
            stencilProgram.addTask(stencilTask);
            stencilProgram.render();
            gl.stencilFunc(gl.NOTEQUAL,0x01,0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
        }
    }
}