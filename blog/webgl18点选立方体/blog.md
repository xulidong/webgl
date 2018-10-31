# WebGL之旅（十七） 点选立方体

## 原理

这里用了一个比较巧妙(山寨)的方法判断是否点击到了立方体：

1. 获取鼠标点击的位置；
2. 将立方体绘制成红色（也可以是其他颜色）；
3. 判断鼠标点击位置的颜色
4. 恢复立方体的颜色

## 示例

由以上原理，当鼠标点击位置的颜色跟立方体重绘之后的颜色一致为红色时，则点击的位置就在立方体上。(如果背景色也为红色，就尴尬了)。

```javascript
function main() {
    var gl = getGL();
    var vsFile = "./res/shader/click.vert.glsl";
    var fsFile = "./res/shader/click.frag.glsl";
    initShaderProgram(gl, vsFile, fsFile, function (shaderProgram) {
        var n = initVertexBuffers(gl, shaderProgram);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        var u_Clicked = gl.getUniformLocation(shaderProgram, 'u_Clicked');
        gl.uniform1i(u_Clicked, 0);

        var viewMat = lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);
        var vpMat = multiMatrix44(projMat, viewMat);

        var u_MvpMatrix = gl.getUniformLocation(shaderProgram, 'u_MvpMatrix');
        gl.uniformMatrix4fv(u_MvpMatrix, false, vpMat);

        var tick = function() {
            draw(gl, n);
            requestAnimationFrame(tick);
        };
        tick();

        var canvas = document.getElementById("container");
        canvas.onmousedown = function(ev) {
            var x = ev.clientX, y = ev.clientY;
            var rect = ev.target.getBoundingClientRect();
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
                var x_in_canvas = x - rect.left;
                var y_in_canvas = rect.bottom - y;
                var click = check(gl, shaderProgram, n, x_in_canvas, y_in_canvas);
                if (click){
                    console.log('The cube was selected!');
                }
            }
        }
    })
}

function check(gl, shaderProgram, n, x, y) {
    var click = false;

    var u_Clicked = gl.getUniformLocation(shaderProgram, 'u_Clicked');
    gl.uniform1i(u_Clicked, 1);
    draw(gl, n);

    var pixels = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    if (pixels[0] === 255){
        click = true;
    }

    gl.uniform1i(u_Clicked, 0);
    draw(gl, n);

    return click;
}

function draw(gl, n) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}


function initVertexBuffers(gl, shaderProgram) {
    var vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
    ]);

    var colors = new Float32Array([
        0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82,
        0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,
        0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,
        0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84,
        0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56,
        0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93,
    ]);

    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);

    initArrayBuffer(gl, shaderProgram, vertices, gl.FLOAT, 3, 'a_Position');
    initArrayBuffer(gl, shaderProgram, colors, gl.FLOAT, 3, 'a_Color');

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}
```

如图，当点击的位置在立方体上时，会在控制台输出"The cube was selected!"。

## 三 选中立方体的面

原理：

1. 记录每个顶点所在面的编号
2. 鼠标点击后，将顶点所在面的编号写入颜色的Alpha中
3. 读取颜色的Alpha值，即为选中的选中的面
4. 重绘立方体，将选中的图设置为白色

## 四 示例

首先需要指定每个顶点所在的面的编号，然后在点击的时候将其设置在颜色中，通过颜色的Alpha值将选中的面传回js，然后在js中将选中的面绘制成白色。

```javascript
function main() {
    var gl = getGL();
    var vsFile = "./res/shader/click.vert.glsl";
    var fsFile = "./res/shader/click.frag.glsl";
    initShaderProgram(gl, vsFile, fsFile, function (shaderProgram) {
        var n = initVertexBuffers(gl, shaderProgram);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        var u_ClickedFace = gl.getUniformLocation(shaderProgram, 'u_ClickedFace');
        gl.uniform1i(u_ClickedFace, -1);

        var viewMat = lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        var projMat = getPerspectiveProjection(30, 16 / 9, 1, 100);
        var vpMat = multiMatrix44(projMat, viewMat);

        var u_MvpMatrix = gl.getUniformLocation(shaderProgram, 'u_MvpMatrix');
        gl.uniformMatrix4fv(u_MvpMatrix, false, vpMat);

        var tick = function() {
            draw(gl, n);
            requestAnimationFrame(tick);
        };
        tick();

        var canvas = document.getElementById("container");
        canvas.onmousedown = function(ev) {
            var x = ev.clientX, y = ev.clientY;
            var rect = ev.target.getBoundingClientRect();
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
                var x_in_canvas = x - rect.left;
                var y_in_canvas = rect.bottom - y;
                var face = checkFace(gl, shaderProgram, n, x_in_canvas, y_in_canvas);
                gl.uniform1i(u_ClickedFace, face);
            }
        }
    })
}

function checkFace(gl, shaderProgram, n, x, y) {
    var u_ClickedFace = gl.getUniformLocation(shaderProgram, 'u_ClickedFace');
    gl.uniform1i(u_ClickedFace, 0);
    draw(gl, n);

    var pixels = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels[3];// A中保存的是平面编号
}

function draw(gl, n) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}


function initVertexBuffers(gl, shaderProgram) {
    var vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
    ]);

    var colors = new Float32Array([
        0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82,
        0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,
        0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,
        0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84,
        0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56,
        0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93,
    ]);

    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);

    var faces = new Uint8Array([
        1, 1, 1, 1,
        2, 2, 2, 2,
        3, 3, 3, 3,
        4, 4, 4, 4,
        5, 5, 5, 5,
        6, 6, 6, 6,
    ]);

    initArrayBuffer(gl, shaderProgram, vertices, gl.FLOAT, 3, 'a_Position');
    initArrayBuffer(gl, shaderProgram, colors, gl.FLOAT, 3, 'a_Color');
    initArrayBuffer(gl, shaderProgram, faces, gl.UNSIGNED_BYTE, 1, 'a_Face');

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}
```

如图，选中的面会被绘制成白色。