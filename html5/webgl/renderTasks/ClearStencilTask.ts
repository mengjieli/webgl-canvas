module webgl {
    export class ClearStencilTask extends RenderTask {
        constructor() {
            super(null);
        }

        public render():void {
            var gl = Stage.$webgl;
            gl.clearStencil(0x01);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.stencilFunc(gl.ALWAYS,0x00,0xFF);
        }

        private static instance:ClearStencilTask;
        public static getInstance():ClearStencilTask {
            if(!ClearStencilTask.instance) {
                ClearStencilTask.instance = new ClearStencilTask();
            }
            return ClearStencilTask.instance;
        }
    }
}