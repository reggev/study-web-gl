precision mediump float;

struct DirectionalLight {
  vec3 direction;
  vec3 color;
  float intensity;
};

varying vec2 fragmentTextureCoordinates;
varying vec3 fragmentNormal;
uniform sampler2D inputImageTexture;
uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;

void main() {

  vec3 surfaceNormal = normalize(fragmentNormal);
  vec3 normalizedSunlightDirection = normalize(sun.direction);
  vec4 texel = texture2D(inputImageTexture, fragmentTextureCoordinates);

  vec3 lightIntensity =
      ambientLightIntensity +
      sun.intensity * sun.color *
          max(dot(surfaceNormal, normalizedSunlightDirection), 0.0);

  gl_FragColor = texel * vec4(lightIntensity, texel.a);
}
