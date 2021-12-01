export function makeImg(src: string) {
  const img = document.createElement('img')
  img.src = src
  img.height = 0
  img.width = 0
  return img
}
