export function lightOrDark(color: string): 'light' | 'dark' {
  // Variables for red, green, blue values
  let r: number, g: number, b: number

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    const colorArr = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)
    if (!colorArr) return 'light'
    r = parseInt(colorArr[1])
    g = parseInt(colorArr[2])
    b = parseInt(colorArr[3])
  } else {
    // If hex --> Convert it to RGB
    let hex = color.replace('#', '')
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((h) => h + h)
        .join('')
    }
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  }

  // HSP equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

  // Using the HSP value, determine whether the color is light or dark
  return hsp > 127.5 ? 'light' : 'dark'
}
