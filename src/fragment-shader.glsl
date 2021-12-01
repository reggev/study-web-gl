precision mediump float;

varying vec2 fragmentTextureCoordinates;
uniform sampler2D inputImageTexture;

void main() {
  gl_FragColor = texture2D(inputImageTexture, fragmentTextureCoordinates.xy);
}
