module t {
    export class ExtendCommand {

        private root:Command;

        constructor(root:MainCommand) {
            this.root = root;
            this.addWebGLCommands();
            this.addCreateCommands();
        }

        private addWebGLCommands():void {
            var root = this.root;
            var cmd = new Command("webgl");
            root.register(cmd, 2);
            //创建子命令
            var canvas = document.createElement("canvas");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            var context2d:CanvasRenderingContext2D = canvas.getContext("2d");

            cmd.register((new Command("查看当前 Canvas 信息")).registerSh(function (...args) {
                console.log(canvas);
            }), 1);

            cmd.register((new Command("查看当前 CanvasRenderingContext2D 信息")).registerSh(function (...args) {
                console.log(context2d);
            }), 2);

            cmd.register((new Command("修改 CanvasRenderingContext2D 信息")).registerSh(function (...args) {
                if(args.length == 2) {
                    context2d[args[0]] = args[1];
                    console.log("context2d." + args[0] + " = " + context2d[args[0]]);
                } else {
                    console.log("当前参数不对，参数信息：1. 属性名称  2. 属性值");
                    console.log("arguments : ",args);
                }
            }), 3);

            cmd.register((new Command("清除 Canvas")).registerSh(function (...args) {
                context2d.clearRect(0,0,canvas.width,canvas.height);
            }), 4);

            cmd.register((new Command("测量文字宽度")).registerSh(function (...args) {
                for(var i = 0; i < args.length; i++) {
                    console.log(context2d.measureText(args[i]).width);
                }
            }), 5);


            //cmd.register((new Command("显示文字")).registerSh(function (...args) {
            //    if(args.length == 1) {
            //        context2d.fillText(args[0],0,0);
            //    }
            //    else if(args.length == 2) {
            //        context2d.fillText(args[0],args[1],0);
            //    }
            //    else if(args.length == 3) {
            //        context2d.fillText(args[0],args[1],args[2]);
            //    } else {
            //        console.log("参数个数不正确，可以接受1、2、3个参数。");
            //        console.log("arguments : ",args);
            //    }
            //}), 6);
        }

        private addCreateCommands():void {
            var root = this.root;
            var cmd = new Command("创建对象");
            root.register(cmd, 4);
            //创建子命令
            cmd.register((new Command("CanvasRenderingContext2D")).registerSh(function () {
                console.log((document.createElement("canvas")).getContext("2d"));
            }), 1)
        }
    }
}