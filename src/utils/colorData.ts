import { Color } from '@/types'
import { hexToRgb, generateColorId } from './colors'

// Import color data from colornerd JSON files
import sherwinWilliamsData from 'colornerd/json/sherwin-williams.json'
import benjaminMooreData from 'colornerd/json/benjamin-moore.json'
import behrData from 'colornerd/json/behr.json'
import valsparData from 'colornerd/json/valspar.json'
import ppgData from 'colornerd/json/ppg.json'

interface ColorNerdEntry {
  name: string
  label: number | string
  hex: string
}

// Convert colornerd data to our Color format
function convertColorData(
  data: ColorNerdEntry[],
  brandName: string,
  brandCode: string
): Color[] {
  return data.map((entry) => {
    const hex = entry.hex.startsWith('#') ? entry.hex : `#${entry.hex}`
    const rgb = hexToRgb(hex)

    return {
      id: generateColorId({
        brand: brandName,
        name: entry.name,
        hex
      }),
      name: entry.name,
      brand: brandName,
      hex,
      rgb,
      code: `${brandCode}-${entry.label}`
    }
  })
}

// Load all colors from available brands
export function getAllColors(): Color[] {
  const allColors: Color[] = []

  // Sherwin Williams
  allColors.push(
    ...convertColorData(
      sherwinWilliamsData as ColorNerdEntry[],
      'Sherwin Williams',
      'SW'
    )
  )

  // Benjamin Moore
  allColors.push(
    ...convertColorData(
      benjaminMooreData as ColorNerdEntry[],
      'Benjamin Moore',
      'BM'
    )
  )

  // Behr
  allColors.push(
    ...convertColorData(
      behrData as ColorNerdEntry[],
      'Behr',
      'B'
    )
  )

  // Valspar
  allColors.push(
    ...convertColorData(
      valsparData as ColorNerdEntry[],
      'Valspar',
      'V'
    )
  )

  // PPG
  allColors.push(
    ...convertColorData(
      ppgData as ColorNerdEntry[],
      'PPG',
      'PPG'
    )
  )

  return allColors
}

// Search colors by term
export function searchColors(term: string): Color[] {
  if (!term.trim()) return []

  const allColors = getAllColors()
  const searchLower = term.toLowerCase()

  return allColors.filter(color =>
    color.name.toLowerCase().includes(searchLower) ||
    color.brand.toLowerCase().includes(searchLower) ||
    color.code?.toLowerCase().includes(searchLower) ||
    color.hex.toLowerCase().includes(searchLower)
  ).slice(0, 100) // Limit results for performance
}