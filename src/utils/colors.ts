/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0]
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Calculate the contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const l1 = getLuminance(rgb1)
  const l2 = getLuminance(rgb2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Get the relative luminance of a color
 */
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(val => {
    const normalized = val / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Determine the best contrasting text color (black or white) for a given background
 */
export function getContrastColor(hex: string): 'black' | 'white' {
  const rgb = hexToRgb(hex)
  const luminance = getLuminance(rgb)
  return luminance > 0.5 ? 'black' : 'white'
}

/**
 * Check if a color is valid hex
 */
export function isValidHex(hex: string): boolean {
  return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex)
}

/**
 * Format hex color with # prefix
 */
export function formatHex(hex: string): string {
  if (!hex) return '#000000'
  return hex.startsWith('#') ? hex : `#${hex}`
}

/**
 * Generate a unique ID for a color
 */
export function generateColorId(color: { brand: string; name: string; hex: string }): string {
  return `${color.brand.toLowerCase().replace(/\s+/g, '-')}-${color.name.toLowerCase().replace(/\s+/g, '-')}-${color.hex.replace('#', '')}`
}