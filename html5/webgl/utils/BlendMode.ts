module webgl {
    /**
     * 混合模式
     */
    export class BlendMode {

        //重置混合模式
        public static NONE:number = -1;

        //普通的混合
        public static NORMAL:number = 0;

        //叠加
        public static ADD:number = 1;

        //覆盖
        public static OVERRIDE:number = 10;

        private static blendMode:number = BlendMode.NORMAL;

        public static changeBlendMode(mode:number) {
            if (mode == BlendMode.blendMode) {
                return;
            }
            var gl = Stage.$webgl;
            if (mode == BlendMode.NORMAL) {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            } else if (mode == BlendMode.ADD) {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFunc(gl.ONE, gl.ONE);
            } else if (mode == BlendMode.OVERRIDE) {
                gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
                gl.blendFunc(gl.ONE, gl.ZERO);
            }
            BlendMode.blendMode = mode;
        }
    }
}