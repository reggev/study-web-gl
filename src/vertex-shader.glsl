precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vectTextureCoordinates;
varying vec2 fragmentTextureCoordinates;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragmentTextureCoordinates = vectTextureCoordinates;
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
