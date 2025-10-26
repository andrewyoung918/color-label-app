import { create } from 'zustand'
import { Color, PaintInventory } from '@/types'
import { saveLibrary, loadLibrary } from '@/utils/storage'
import { searchColors as searchColorData } from '@/utils/colorData'

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
  updateColorInventory: (colorId: string, inventory: PaintInventory) => void
}

export const useColorStore = create<ColorStore>((set, get) => ({
  // Initial state
  searchResults: [],
  library: [],
  selectedColors: new Set(),
  searchTerm: '',
  loading: false,

  // Search for colors using real colornerd data
  searchColors: async (term: string) => {
    set({ searchTerm: term, loading: true })

    // Simulate async search for better UX
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      // Use the real colornerd data
      const results = searchColorData(term)
      set({ searchResults: results, loading: false })
    } catch (error) {
      console.error('Failed to search colors:', error)
      set({ searchResults: [], loading: false })
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
  },

  // Update color inventory
  updateColorInventory: (colorId: string, inventory: PaintInventory) => {
    const { library } = get()
    const newLibrary = library.map(c =>
      c.id === colorId ? { ...c, inventory } : c
    )
    set({ library: newLibrary })
    saveLibrary(newLibrary)
  }
}))