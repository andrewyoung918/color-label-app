import { Color, Palette } from '@/types'

const STORAGE_KEYS = {
  LIBRARY: 'colorLabelApp_library',
  PALETTES: 'colorLabelApp_palettes',
  SETTINGS: 'colorLabelApp_settings',
} as const

/**
 * Save color library to localStorage
 */
export function saveLibrary(colors: Color[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(colors))
  } catch (error) {
    console.error('Failed to save library:', error)
  }
}

/**
 * Load color library from localStorage
 */
export function loadLibrary(): Color[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LIBRARY)
    if (!stored) return []

    const colors = JSON.parse(stored) as Color[]
    // Convert date strings back to Date objects
    return colors.map(color => ({
      ...color,
      addedAt: color.addedAt ? new Date(color.addedAt) : undefined
    }))
  } catch (error) {
    console.error('Failed to load library:', error)
    return []
  }
}

/**
 * Save palettes to localStorage
 */
export function savePalettes(palettes: Palette[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PALETTES, JSON.stringify(palettes))
  } catch (error) {
    console.error('Failed to save palettes:', error)
  }
}

/**
 * Load palettes from localStorage
 */
export function loadPalettes(): Palette[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PALETTES)
    if (!stored) return []

    const palettes = JSON.parse(stored) as Palette[]
    // Convert date strings back to Date objects
    return palettes.map(palette => ({
      ...palette,
      createdAt: new Date(palette.createdAt),
      updatedAt: new Date(palette.updatedAt)
    }))
  } catch (error) {
    console.error('Failed to load palettes:', error)
    return []
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}