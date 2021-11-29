import './index.scss'
import vertexShaderCode from './vertex-shader.glsl'
import fragmentShaderCode from './fragment-shader.glsl'

function makeCanvas({width = 500, height = 500} = {}) {
  const {canvas, gl} = (() => {
    const _canvas = document.createElement('canvas')
    _canvas.width = width
    _canvas.height = height
    _canvas.setAttribute('id', 'canvas')
    const _gl = _canvas.getContext('webgl2')
    if (!_gl) {
      throw new Error('Could not get context')
    }
    return {gl: _gl, canvas: _canvas}
  })()

  function makeShader(shaderType: number, source: string) {
    const shader = gl.createShader(shaderType) as WebGLShader
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? 'error compiling shader')
    }
    return shader
  }

  function makeProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram() as WebGLProgram
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'error linking program')
    }
    gl.validateProgram(program)
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'error validating program')
    }
    return program
  }

  return {canvas, gl, makeShader, makeProgram}
}

const {canvas, gl, makeShader, makeProgram} = makeCanvas()
document.body.appendChild(canvas)

gl.clearColor(0.75, 0.85, 0.8, 1.0)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

const vertexShader = makeShader(gl.VERTEX_SHADER, vertexShaderCode)
const fragmentShader = makeShader(gl.FRAGMENT_SHADER, fragmentShaderCode)
const program = makeProgram(vertexShader, fragmentShader)
const triangleVertices = [
  [0.0, 0.5],
  [-0.5, -0.5],
  [0.5, -0.5],
].flat()

const vertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)
const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(
  positionAttribLocation,
  2,
  gl.FLOAT,
  false,
  2 * Float32Array.BYTES_PER_ELEMENT,
  0,
)

gl.enableVertexAttribArray(positionAttribLocation)

gl.useProgram(program)
gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length / 2)
