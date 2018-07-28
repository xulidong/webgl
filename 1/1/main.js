// 1 画一个蓝色的矩形
function main() {
	var canvas = document.getElementById("container");
	var context = canvas.getContext("2d");
	context.fillStyle = "rgba(0, 0, 255, 1.0)";
	context.fillRect(120, 10, 150, 150);
}
