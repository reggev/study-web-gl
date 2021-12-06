export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement('img')
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = reject
  })
}
