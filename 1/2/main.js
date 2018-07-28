// 2 将canvas的颜色设置为黑色
function main() {
	var canvas = document.getElementById("container");
	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	gl.clearColor(0.0, 0.0, 0.0, 1.0);// 指定清空canvas的颜色
	gl.clear(gl.COLOR_BUFFER_BIT);// 清空canvas
}
