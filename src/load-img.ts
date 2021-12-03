export function loadImage(src: string) {
  const img = document.createElement('img')
  img.src = src
  return img
}
