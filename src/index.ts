import './index.scss'
import vertexShaderCode from './vertex-shader.glsl'
import fragmentShaderCode from './fragment-shader.glsl'
import {glMatrix, mat4} from 'gl-matrix'
import {makeCanvas} from './make-canvas'
import {loadImage} from './load-img'
import susanTexture from 'assets/Susan.png'
import susanModel from 'assets/Susan.json'

const {canvas, gl, makeShader, makeProgram} = makeCanvas()
const img = await loadImage(susanTexture)

document.body.appendChild(canvas)

const vertexShader = makeShader('vertexShader', gl.VERTEX_SHADER, vertexShaderCode)
const fragmentShader = makeShader('fragmentShader', gl.FRAGMENT_SHADER, fragmentShaderCode)
const program = makeProgram(vertexShader, fragmentShader)

const susanVertices = susanModel.meshes[0].vertices
const susanFaces = susanModel.meshes[0].faces.flat()
const susanTextureCoordinates = susanModel.meshes[0].texturecoords[0]
const susanNormals = susanModel.meshes[0].normals

// buffer types
// VBO - vertex buffer object
// VAO - vertex array object
// EBO - element buffer object
// IBO - index buffer object

const positionVBO = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW)

const facesIBO = gl.createBuffer()
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, facesIBO)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanFaces), gl.STATIC_DRAW)

const textureVBO = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, textureVBO)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTextureCoordinates), gl.STATIC_DRAW)

const susanNormalsVBO = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalsVBO)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanNormals), gl.STATIC_DRAW)

gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO)
const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(
  positionAttribLocation,
  3,
  gl.FLOAT,
  false,
  3 * Float32Array.BYTES_PER_ELEMENT,
  0,
)
gl.enableVertexAttribArray(positionAttribLocation)

gl.bindBuffer(gl.ARRAY_BUFFER, textureVBO)
const textureCoordinatesAttribLocation = gl.getAttribLocation(program, 'vectTextureCoordinates')
gl.vertexAttribPointer(
  textureCoordinatesAttribLocation,
  2,
  gl.FLOAT,
  false,
  2 * Float32Array.BYTES_PER_ELEMENT,
  0,
)
gl.enableVertexAttribArray(textureCoordinatesAttribLocation)

gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalsVBO)
const normalAttributeLocation = gl.getAttribLocation(program, 'vertexNormal')
gl.vertexAttribPointer(
  normalAttributeLocation,
  3,
  gl.FLOAT,
  true,
  3 * Float32Array.BYTES_PER_ELEMENT,
  0,
)
gl.enableVertexAttribArray(normalAttributeLocation)

gl.enable(gl.DEPTH_TEST)
gl.enable(gl.CULL_FACE)

const boxTexture = gl.createTexture()
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
gl.bindTexture(gl.TEXTURE_2D, boxTexture)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
gl.bindTexture(gl.TEXTURE_2D, null)

gl.useProgram(program)

const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
const matViewUniformLocation = gl.getUniformLocation(program, 'mView')
const matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

const worldMatrix = new Float32Array(16)
const viewMatrix = new Float32Array(16)
const projectionMatrix = new Float32Array(16)
mat4.identity(worldMatrix)
mat4.lookAt(viewMatrix, [0, 5, -5], [0, 0, 0], [0, 1, 0])
mat4.perspective(projectionMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0)

gl.uniformMatrix4fv(matViewUniformLocation, false, viewMatrix)
gl.uniformMatrix4fv(matProjUniformLocation, false, projectionMatrix)

let angle = 0
const identityMatrix = new Float32Array(16)
mat4.identity(identityMatrix)

function renderLoop() {
  gl.clearColor(0.75, 0.85, 0.8, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  angle = (performance.now() / 1000 / 6) * 2 * Math.PI
  mat4.rotate(worldMatrix, identityMatrix, angle, [1, 0, 1])
  gl.uniformMatrix4fv(matWorldUniformLocation, false, worldMatrix)

  gl.useProgram(program)
  const ambientLightIntensityUniformLocation = gl.getUniformLocation(
    program,
    'ambientLightIntensity',
  )
  const sunlightColorUniformLocation = gl.getUniformLocation(program, 'sun.color')
  const sunlightDirectionUniformLocation = gl.getUniformLocation(program, 'sun.direction')
  const sunlightIntensityUniformLocation = gl.getUniformLocation(program, 'sun.intensity')
  gl.uniform3fv(ambientLightIntensityUniformLocation, [0.2, 0.2, 0.2])
  gl.uniform3fv(sunlightColorUniformLocation, [0.9, 0.9, 0.9])
  gl.uniform3fv(sunlightDirectionUniformLocation, [1.0, 4.0, -10.0])
  gl.uniform1f(sunlightIntensityUniformLocation, 1.0)

  gl.drawElements(gl.TRIANGLES, susanFaces.length, gl.UNSIGNED_SHORT, 0)
  gl.bindTexture(gl.TEXTURE_2D, boxTexture)
  gl.activeTexture(gl.TEXTURE0)
  requestAnimationFrame(renderLoop)
}
requestAnimationFrame(renderLoop)
