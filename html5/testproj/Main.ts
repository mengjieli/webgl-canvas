module game {
    export class Main {

        private canvas:webgl.Canvas;
        private context2d:webgl.CanvasRenderingContext2D;

        private h5Canvas:HTMLCanvasElement;

        constructor() {
            var canvas = <any>document.getElementById("engine");
            this.h5Canvas = canvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            //初始化舞台
            webgl.Stage.create(this.getWebGL(canvas), canvas.width, canvas.height);

            //初始化 canvas,可以选择是否加到舞台显示 Stage.addCanvasAt(canvas);
            this.canvas = new webgl.Canvas(window.innerWidth, window.innerHeight);
            webgl.Stage.getInstance().addCanvasAt(this.canvas);

            //获取 context2d
            this.context2d = <any>this.canvas.getContext("2d");

            //加载图片
            new ImageLoader(["resources/128x128_1.png", "resources/128x128_2.png", "resources/flower.png"], this.loadImageComplete, this);
        }

        private loadImageComplete(images:HTMLImageElement[]):void {
            var t1 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[0]), images[0].width, images[0].height);
            var t2 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[1]), images[1].width, images[1].height);
            var t3 = new webgl.Texture(webgl.CanvasRenderingContext2D.createTexture(images[2]), images[2].width, images[2].height);


            var loop = 100;
            for (var i = 0; i < loop; i++) {
                new MoveBitmap(t1, this.context2d);
                new MoveBitmap(t2, this.context2d);
            }
            this.context2d.addRectClip(85,85,80,80);
            this.context2d.drawTexture(t1, {a: 1, b: 0, c: 0, d: 1, tx: 80, ty: 80});


            this.context2d.addImageClip(images[2],100,100);
            this.context2d.addRectClip(100,100,150,150);
            this.context2d.drawTexture(t2, {a: 1, b: 0, c: 0, d: 1, tx: 200, ty: 200});
            //this.context2d.drawTexture(t3, {a: 1, b: 0, c: 0, d: 1, tx: 100, ty: 80});
            //this.context2d.clearRect(175,175,10,10);


            /*var cxt2d = this.context2d;
            setTimeout(function(){
                cxt2d.clearRect(200,200,10,10);
                cxt2d.drawTexture(t1, {a: 1, b: 0, c: 0, d: 1, tx: 250, ty: 250});
            },1000);*/
        }

        // webgl 的环境获取写在外面主要考虑需要和 3D 的合并。
        private getWebGL(domcanvas:HTMLCanvasElement):WebGLRenderingContext {
            var names = ["experimental-webgl", "webgl"];
            var options = {"antialias": false, "stencil": true};
            var gl:WebGLRenderingContext;
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = <any>domcanvas.getContext(names[i], options);
                } catch (e) {
                }
                if (gl) {
                    break;
                }
            }
            if (!gl) {
                console.log("Error : 当前环境不支持 WebGL");
                alert("Error : 当前环境不支持 WebGL 111");
            }
            return gl;
        }
    }
}
new game.Main();