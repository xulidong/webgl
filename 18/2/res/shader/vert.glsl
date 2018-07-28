attribute vec4 a_Position;
attribute vec4 a_Color;
attribute float a_Face;
uniform mat4 u_MvpMatrix;
uniform int u_ClickedFace;
varying vec4 v_Color;
void main() {
  gl_Position = u_MvpMatrix * a_Position;
  int face = int(a_Face);
  vec3 color = (face == u_ClickedFace) ? vec3(1.0) : a_Color.rgb;
  if(u_ClickedFace == 0) {
    v_Color = vec4(color, a_Face/255.0);
  } else {
    v_Color = vec4(color, a_Color.a);
  }
}