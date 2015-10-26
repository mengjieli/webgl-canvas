module t {
    export class Command {

        constructor(name:string) {
            this._name = name;
        }

        private _name:string = "未命名";
        public get name():string {
            return this._name;
        }

        public list():void {
            console.log("您可以执行如下命令 : ")
            var keys = Object.keys(this.commonds);
            for(var i = 0; i < keys.length; i++) {
                var cmd:Command = this.commonds[keys[i]];
                console.log(keys[i] + ". " + cmd.name);
            }
        }

        private runFunc:Function;
        private runThis:any;

        public registerSh(func:Function,thisObj:any=null):Command {
            this.runFunc = func;
            this.runThis = thisObj;
            return this;
        }

        public sh(...args):void {
            if(this.runFunc) {
                this.runFunc.apply(this.runThis,args);
            } else {
                console.log("空命令");
            }
        }

        private commonds = {};
        public register(cmd:Command,id:number):void {
            this.commonds[id] = cmd;
        }

        public getCommond(id:number):Command {
            return this.commonds[id];
        }
    }
}