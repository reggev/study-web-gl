precision mediump float;

attribute vec2 vertPosition;

varying vec3 fragColor;
void main() {
  gl_Position = vec4(vertPosition, 0.0, 1.0);
}
