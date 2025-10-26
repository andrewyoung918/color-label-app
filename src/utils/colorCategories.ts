import { Color } from '@/types'
import { hexToRgb } from './colors'

export type ColorFamily =
  | 'reds'
  | 'pinks'
  | 'oranges'
  | 'yellows'
  | 'greens'
  | 'blues'
  | 'purples'
  | 'browns'
  | 'grays'
  | 'whites'
  | 'blacks'

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [h * 360, s * 100, l * 100]
}

/**
 * Categorize a color into a color family based on its hue, saturation, and lightness
 */
export function categorizeColor(hex: string): ColorFamily {
  const rgb = hexToRgb(hex)
  const [hue, saturation, lightness] = rgbToHsl(rgb[0], rgb[1], rgb[2])

  // Handle achromatic colors first (low saturation)
  if (saturation < 10) {
    if (lightness > 90) return 'whites'
    if (lightness < 10) return 'blacks'
    return 'grays'
  }

  // Special case for browns (orange hue with lower lightness)
  if (hue >= 15 && hue <= 50 && lightness < 50) {
    return 'browns'
  }

  // Categorize by hue
  if (hue >= 0 && hue < 15) return 'reds'
  if (hue >= 15 && hue < 35) return 'oranges'
  if (hue >= 35 && hue < 65) return 'yellows'
  if (hue >= 65 && hue < 150) return 'greens'
  if (hue >= 150 && hue < 250) return 'blues'
  if (hue >= 250 && hue < 290) return 'purples'
  if (hue >= 290 && hue < 330) return 'pinks'
  if (hue >= 330 && hue <= 360) return 'reds'

  return 'grays' // Fallback
}

/**
 * Group colors by their families
 */
export function groupColorsByFamily(colors: Color[]): Record<ColorFamily, Color[]> {
  const groups: Record<ColorFamily, Color[]> = {
    reds: [],
    pinks: [],
    oranges: [],
    yellows: [],
    greens: [],
    blues: [],
    purples: [],
    browns: [],
    grays: [],
    whites: [],
    blacks: []
  }

  colors.forEach(color => {
    const family = categorizeColor(color.hex)
    groups[family].push(color)
  })

  return groups
}

/**
 * Get display name for color family
 */
export function getColorFamilyDisplayName(family: ColorFamily): string {
  const names: Record<ColorFamily, string> = {
    reds: 'Reds',
    pinks: 'Pinks',
    oranges: 'Oranges',
    yellows: 'Yellows',
    greens: 'Greens',
    blues: 'Blues',
    purples: 'Purples',
    browns: 'Browns',
    grays: 'Grays',
    whites: 'Whites',
    blacks: 'Blacks'
  }
  return names[family]
}

/**
 * Get a representative color for each family (for UI display)
 */
export function getColorFamilyHex(family: ColorFamily): string {
  const colors: Record<ColorFamily, string> = {
    reds: '#DC2626',
    pinks: '#EC4899',
    oranges: '#EA580C',
    yellows: '#EAB308',
    greens: '#16A34A',
    blues: '#2563EB',
    purples: '#9333EA',
    browns: '#92400E',
    grays: '#6B7280',
    whites: '#F9FAFB',
    blacks: '#111827'
  }
  return colors[family]
}