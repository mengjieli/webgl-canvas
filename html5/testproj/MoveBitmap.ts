module game {

    export class MoveBitmap {

        private texture:webgl.Texture;
        private x:number;
        private y:number;
        private maxvx:number = 100;
        private vx:number;
        private maxWidth:number;
        private maxHeight:number;
        private context2d:webgl.CanvasRenderingContext2D;
        private matrix = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

        constructor(texture:webgl.Texture, context2d:webgl.CanvasRenderingContext2D) {
            this.texture = texture;
            this.context2d = context2d;
            MoveBitmap.context2d = context2d;
            var w:number = window.innerWidth;
            var h:number = window.innerHeight;
            this.maxWidth = w;
            this.maxHeight = h;
            this.x = Math.random() * (w - texture.width);
            this.y = Math.random() * (h - texture.height);
            this.maxvx = (0.5 + 1.5 * Math.random())*1;
            if (Math.random() > 0.5) {
                this.vx = this.maxvx;
            } else {
                this.vx = -this.maxvx;
            }
            MoveBitmap.startTick(this);
        }

        public update():void {
            this.x += this.vx;
            if (this.x < 0) {
                this.x = 0;
                this.vx = this.maxvx;
            }
            else if (this.x > this.maxWidth - this.texture.width) {
                this.x = this.maxWidth - this.texture.width;
                this.vx = -this.maxvx;
            }
            this.matrix.tx = this.x;
            this.matrix.ty = this.y;
            this.context2d.drawTexture(this.texture, this.matrix);
        }

        private static hasStartTick:boolean = false;

        private static startTick(bitmap:MoveBitmap):void {
            MoveBitmap.bitmaps.push(bitmap);
            if (MoveBitmap.hasStartTick) {
                return;
            }
            MoveBitmap.hasStartTick = true;
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

            requestAnimationFrame.call(window, onTick);
            function onTick():void {
                MoveBitmap.update();
                requestAnimationFrame.call(window, onTick);
            }
        }

        private static bitmaps:MoveBitmap[] = [];
        private static context2d:webgl.CanvasRenderingContext2D;

        private static update():void {
            //MoveBitmap.context2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
            MoveBitmap.context2d.clearAll();
            var bitmaps = MoveBitmap.bitmaps;
            for (var i = 0, len = bitmaps.length; i < bitmaps.length; i++) {
                bitmaps[i].update();
            }
        }
    }
}