import { Color } from '@/types'

// Determine color temperature
export function getColorTemperature(color: Color): 'warm' | 'cool' | 'neutral' {
  const [r, g, b] = color.rgb

  // Convert to HSL to better determine temperature
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === rNorm) {
      hue = 60 * (((gNorm - bNorm) / delta) % 6)
    } else if (max === gNorm) {
      hue = 60 * ((bNorm - rNorm) / delta + 2)
    } else {
      hue = 60 * ((rNorm - gNorm) / delta + 4)
    }
  }
  if (hue < 0) hue += 360

  // Warm: 0-60 (red-yellow) and 300-360 (magenta-red)
  // Cool: 180-300 (cyan-blue-purple)
  // Neutral: 60-180 (yellow-green-cyan) or very low saturation
  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))

  // Very low saturation colors are neutral (grays, off-whites, etc)
  if (saturation < 0.15) return 'neutral'

  if ((hue >= 0 && hue < 60) || hue >= 300) {
    return 'warm'
  } else if (hue >= 180 && hue < 300) {
    return 'cool'
  } else {
    return 'neutral'
  }
}

// Determine lightness category
export function getLightnessCategory(color: Color): 'light' | 'medium' | 'dark' {
  const [r, g, b] = color.rgb
  const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255

  if (lightness > 0.7) return 'light'
  if (lightness > 0.3) return 'medium'
  return 'dark'
}

// Determine saturation category
export function getSaturationCategory(color: Color): 'muted' | 'moderate' | 'vibrant' {
  const [r, g, b] = color.rgb
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min

  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))

  if (saturation < 0.3) return 'muted'
  if (saturation < 0.7) return 'moderate'
  return 'vibrant'
}

// Check if color is suitable for exteriors (if data available)
export function isExteriorSuitable(color: Color): boolean {
  // This would come from the color data if available
  // For now, return true for all
  return true
}
