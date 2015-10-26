var fs = require("fs");

var fileBefore = "/Users/egret/Documents/Program/HTML5/webgl-canvas/html5/";
var outfile = "/Users/egret/Documents/Program/HTML5/webgl-canvas/bin-debug";

var files = [


    "webgl/utils/BlendMode.ts",

    "webgl/textures/Texture.ts",

    "webgl/renderTasks/superClasses/RenderTask.ts",
    "webgl/renderTasks/BitmapTask.ts",
    "webgl/renderTasks/RectShapeTask.ts",
    "webgl/renderTasks/ClearTask.ts",
    "webgl/renderTasks/ClearStencilTask.ts",
    "webgl/renderTasks/RectClipTask.ts",
    "webgl/renderTasks/TextureClipTask.ts",

    "webgl/programs/superClasses/Program.ts",
    "webgl/programs/BitmapProgram.ts",
    "webgl/programs/RectShapeProgram.ts",

    "webgl/core/CanvasRenderingContext2D.ts",
    "webgl/core/Canvas.ts",
    "webgl/core/Stage.ts",

    "webgl/texts/TextAtlas.ts",
    "webgl/texts/TextAtlasInfo.ts",

    "webgl/commands/Command.ts",
    "webgl/commands/ExtendCommand.ts",
    "webgl/commands/MainCommand.ts",

    "testproj/utils/ImageLoader.ts",
    "testproj/geom/Matrix.ts",
    "testproj/MoveBitmap.ts",

    "testproj/Main.ts"
];

var content = "tsc --target es5 --sourceMap ";
var jscontent = "";
for(var i = 0; i < files.length; i++) {
    content += fileBefore + files[i] + " ";
    jscontent += "document.write(\"<script src='bin-debug/" + files[i].slice(0,files[i].length-2) + "js'><\/script>\");\n";
}
content += "--outDir " + outfile;

fs.writeFile("build.sh",content);
fs.writeFile("main.js",jscontent);