precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vectTextureCoordinates;
attribute vec3 vertexNormal;

varying vec2 fragmentTextureCoordinates;
varying vec3 fragmentNormal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fragmentTextureCoordinates = vectTextureCoordinates;
  fragmentNormal = (mWorld * vec4(vertexNormal, 0.0)).xyz;
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
