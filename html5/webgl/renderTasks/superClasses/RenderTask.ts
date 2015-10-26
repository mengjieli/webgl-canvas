module webgl {
    export class RenderTask {

        constructor(program:Program,blendMode?:number) {
            this._program = program;
            this._blendMode = +blendMode|0;
        }

        private _program:Program;
        public get program():Program {
            return this._program;
        }

        private _blendMode:number;
        public get blendMode():number {
            return this._blendMode;
        }

        public render():void {

        }
    }
}