import { create } from 'zustand'
import { Palette, Color } from '@/types'
import { savePalettes, loadPalettes } from '@/utils/storage'
import { v4 as uuidv4 } from 'uuid'

interface PaletteStore {
  // State
  palettes: Palette[]
  activePalette: Palette | null

  // Actions
  createPalette: (name: string, colors: Color[]) => void
  updatePalette: (id: string, updates: Partial<Palette>) => void
  deletePalette: (id: string) => void
  loadPalette: (id: string) => void
  loadPalettesFromStorage: () => void
  addColorToPalette: (paletteId: string, color: Color) => void
  removeColorFromPalette: (paletteId: string, colorId: string) => void
  reorderPaletteColors: (paletteId: string, startIndex: number, endIndex: number) => void
}

export const usePaletteStore = create<PaletteStore>((set, get) => ({
  // Initial state
  palettes: [],
  activePalette: null,

  // Create a new palette
  createPalette: (name: string, colors: Color[]) => {
    const newPalette: Palette = {
      id: uuidv4(),
      name,
      colors,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const { palettes } = get()
    const newPalettes = [...palettes, newPalette]
    set({ palettes: newPalettes })
    savePalettes(newPalettes)
  },

  // Update an existing palette
  updatePalette: (id: string, updates: Partial<Palette>) => {
    const { palettes } = get()
    const newPalettes = palettes.map(p =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    )
    set({ palettes: newPalettes })
    savePalettes(newPalettes)
  },

  // Delete a palette
  deletePalette: (id: string) => {
    const { palettes, activePalette } = get()
    const newPalettes = palettes.filter(p => p.id !== id)
    set({
      palettes: newPalettes,
      activePalette: activePalette?.id === id ? null : activePalette
    })
    savePalettes(newPalettes)
  },

  // Load a palette as active
  loadPalette: (id: string) => {
    const { palettes } = get()
    const palette = palettes.find(p => p.id === id)
    set({ activePalette: palette || null })
  },

  // Load palettes from localStorage
  loadPalettesFromStorage: () => {
    const palettes = loadPalettes()
    set({ palettes })
  },

  // Add a color to a palette
  addColorToPalette: (paletteId: string, color: Color) => {
    const { palettes } = get()
    const newPalettes = palettes.map(p => {
      if (p.id === paletteId) {
        // Check if color already exists in palette
        if (p.colors.some(c => c.id === color.id)) {
          return p
        }
        return {
          ...p,
          colors: [...p.colors, color],
          updatedAt: new Date()
        }
      }
      return p
    })
    set({ palettes: newPalettes })
    savePalettes(newPalettes)
  },

  // Remove a color from a palette
  removeColorFromPalette: (paletteId: string, colorId: string) => {
    const { palettes } = get()
    const newPalettes = palettes.map(p => {
      if (p.id === paletteId) {
        return {
          ...p,
          colors: p.colors.filter(c => c.id !== colorId),
          updatedAt: new Date()
        }
      }
      return p
    })
    set({ palettes: newPalettes })
    savePalettes(newPalettes)
  },

  // Reorder colors within a palette
  reorderPaletteColors: (paletteId: string, startIndex: number, endIndex: number) => {
    const { palettes } = get()
    const newPalettes = palettes.map(p => {
      if (p.id === paletteId) {
        const colors = Array.from(p.colors)
        const [removed] = colors.splice(startIndex, 1)
        colors.splice(endIndex, 0, removed)
        return {
          ...p,
          colors,
          updatedAt: new Date()
        }
      }
      return p
    })
    set({ palettes: newPalettes })
    savePalettes(newPalettes)
  }
}))