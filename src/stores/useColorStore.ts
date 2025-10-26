import { create } from 'zustand'
import { Color } from '@/types'
import { saveLibrary, loadLibrary } from '@/utils/storage'
import { generateColorId } from '@/utils/colors'

interface ColorStore {
  // State
  searchResults: Color[]
  library: Color[]
  selectedColors: Set<string>
  searchTerm: string
  loading: boolean

  // Actions
  searchColors: (term: string) => Promise<void>
  addToLibrary: (color: Color) => void
  removeFromLibrary: (colorId: string) => void
  toggleColorSelection: (colorId: string) => void
  clearSelection: () => void
  loadLibraryFromStorage: () => void
}

export const useColorStore = create<ColorStore>((set, get) => ({
  // Initial state
  searchResults: [],
  library: [],
  selectedColors: new Set(),
  searchTerm: '',
  loading: false,

  // Search for colors using colornerd
  searchColors: async (term: string) => {
    set({ searchTerm: term, loading: true })

    try {
      // Import colornerd dynamically
      const colornerd = await import('colornerd')

      // Search across all brands
      const results: Color[] = []

      // Get colors from different brands
      const brands = ['benjamin-moore', 'sherwin-williams', 'behr', 'valspar']

      for (const brand of brands) {
        try {
          // Try to get colors from each brand
          const brandColors = await colornerd.default.getColors(brand)

          // Filter by search term
          const filtered = brandColors.filter((color: any) => {
            const searchLower = term.toLowerCase()
            return (
              color.name?.toLowerCase().includes(searchLower) ||
              color.code?.toLowerCase().includes(searchLower) ||
              color.hex?.toLowerCase().includes(searchLower)
            )
          })

          // Map to our Color type
          filtered.forEach((color: any) => {
            const mappedColor: Color = {
              id: generateColorId({ brand, name: color.name, hex: color.hex }),
              name: color.name || 'Unknown',
              brand: brand.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              hex: color.hex || '#000000',
              rgb: color.rgb || [0, 0, 0],
              code: color.code
            }
            results.push(mappedColor)
          })
        } catch (error) {
          console.warn(`Failed to fetch colors from ${brand}:`, error)
        }
      }

      set({ searchResults: results, loading: false })
    } catch (error) {
      console.error('Failed to search colors:', error)

      // Fallback with mock data for development
      const mockColors: Color[] = [
        {
          id: 'mock-1',
          name: 'Naval',
          brand: 'Sherwin Williams',
          hex: '#253342',
          rgb: [37, 51, 66],
          code: 'SW 6244'
        },
        {
          id: 'mock-2',
          name: 'Hale Navy',
          brand: 'Benjamin Moore',
          hex: '#434F5B',
          rgb: [67, 79, 91],
          code: 'HC-154'
        },
        {
          id: 'mock-3',
          name: 'Sea Salt',
          brand: 'Sherwin Williams',
          hex: '#CDD4D1',
          rgb: [205, 212, 209],
          code: 'SW 6204'
        }
      ].filter(color =>
        color.name.toLowerCase().includes(term.toLowerCase()) ||
        color.brand.toLowerCase().includes(term.toLowerCase())
      )

      set({ searchResults: mockColors, loading: false })
    }
  },

  // Add a color to the library
  addToLibrary: (color: Color) => {
    const { library } = get()

    // Check if color already exists
    if (library.some(c => c.id === color.id)) {
      return
    }

    const newColor = {
      ...color,
      addedAt: new Date()
    }

    const newLibrary = [...library, newColor]
    set({ library: newLibrary })
    saveLibrary(newLibrary)
  },

  // Remove a color from the library
  removeFromLibrary: (colorId: string) => {
    const { library } = get()
    const newLibrary = library.filter(c => c.id !== colorId)
    set({ library: newLibrary })
    saveLibrary(newLibrary)
  },

  // Toggle color selection
  toggleColorSelection: (colorId: string) => {
    const { selectedColors } = get()
    const newSelection = new Set(selectedColors)

    if (newSelection.has(colorId)) {
      newSelection.delete(colorId)
    } else {
      newSelection.add(colorId)
    }

    set({ selectedColors: newSelection })
  },

  // Clear all selections
  clearSelection: () => {
    set({ selectedColors: new Set() })
  },

  // Load library from localStorage
  loadLibraryFromStorage: () => {
    const library = loadLibrary()
    set({ library })
  }
}))