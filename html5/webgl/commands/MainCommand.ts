module t {

    export class MainCommand extends Command {

        constructor() {
            super("root");

            this.register(new Command("webgl"),2);
            this.register(new Command("用户"),9);

            new ExtendCommand(this);
        }

        private get current():Command {
            var cmd:Command;
            if(this.commondList.length == 0) {
                cmd = this;
            } else {
                cmd = this.commondList[this.commondList.length-1];
            }
            return cmd;
        }

        private commondList:Command[] = [];

        public ls():void {
            this.current.list();
        }

        public sh(...args):void {
            if(this.current == this) {
                console.log("当前已是根命令，无可执行命令。");
            } else {
                this.current.sh.apply(this,args);
            }
        }

        public shid(id:number,...args):void {
            var cmd = this.current.getCommond(id);
            if(cmd) {
                cmd.sh.apply(cmd,args);
            } else {
                console.log("没有找到 id 为 " + id + "的命令，请检查 id 是否正确。");
                this.ls();
            }
        }

        public cd(id:number):void {
            var cmd = this.current.getCommond(id);
            if(cmd) {
                this.commondList.push(cmd);
                this.pwd();
                cmd.list();
            } else {
                console.log("没有找到 id 为 " + id + "的命令，请检查 id 是否正确。");
                this.ls();
            }
        }

        public pwd():void {
            var str = "当前位置 : root/";
            for(var i = 0; i < this.commondList.length; i++) {
                str += this.commondList[i].name + "/";
            }
            console.log(str);
        }

        public cdl():void {
            this.commondList.pop();
            this.pwd();
        }

        public cdr():void {
            this.commondList.length = 0;
            this.pwd();
        }

        private static instance:MainCommand;
        public static getInstance():MainCommand {
            if(!MainCommand.instance) {
                MainCommand.instance = new MainCommand();
            }
            return MainCommand.instance;
        }
    }

    var deviceString = "--------------------------------------------";

    export function ls():string {
        MainCommand.getInstance().ls();
        return deviceString;
    }

    export function pwd():string {
        MainCommand.getInstance().pwd();
        return deviceString;
    }

    export function sh(...args):string {
        MainCommand.getInstance().sh.apply(MainCommand.getInstance(),args);
        return deviceString;
    }

    export function shid(id:number,...args):string {
        MainCommand.getInstance().shid.apply(MainCommand.getInstance(),arguments);
        return deviceString;
    }

    export function cd(id:number):string {
        MainCommand.getInstance().cd(id);
        return deviceString;
    }

    export function cdl():string {
        MainCommand.getInstance().cdl();
        return deviceString;
    }

    export function cdr():string {
        MainCommand.getInstance().cdr();
        return deviceString;
    }

    export function help():string {
        console.log("t.ls() 显示当前命令信息，和命令列表。");
        console.log("t.pwd() 显示当前命令层级。");
        console.log("t.sh(...args) 执行当前命令。");
        console.log("t.shid(id,...args) 执行当前命令集下面的某个命令。");
        console.log("t.cd(id) 进入当前命令集下面的子命令。");
        console.log("t.cdl() 返回上一层。");
        console.log("t.cdr() 返回根命令。");
        return deviceString;
    }
}