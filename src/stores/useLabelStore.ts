import { create } from 'zustand'
import { LabelConfig, Color } from '@/types'
import html2canvas from 'html2canvas'

interface LabelStore {
  // State
  config: LabelConfig
  previewColors: Color[]
  exportLoading: boolean

  // Actions
  updateConfig: (updates: Partial<LabelConfig>) => void
  setPreviewColors: (colors: Color[]) => void
  setPreviewColorsFromInventory: (colors: Color[]) => void
  updateColorSheen: (colorId: string, sheen: Color['sheen']) => void
  exportLabels: (format: 'png' | 'pdf', elementRef: HTMLElement) => Promise<void>
  resetConfig: () => void
}

const defaultConfig: LabelConfig = {
  layout: 'detailed',
  showBrand: true,
  showCode: true,
  showRgb: false,
  showHex: true,
  showSheen: true,
  dimensions: {
    width: 6,
    height: 4
  },
  backgroundColor: 'color',
  textColor: 'auto',
  typography: {
    nameSize: 60,
    brandSize: 45,
    codeSize: 25,
    detailsSize: 25,
    fontFamily: 'mono',
    fontWeight: 'normal',
    alignment: 'left',
    lineHeight: 'normal'
  }
}

export const useLabelStore = create<LabelStore>((set, get) => ({
  // Initial state
  config: defaultConfig,
  previewColors: [],
  exportLoading: false,

  // Update label configuration
  updateConfig: (updates: Partial<LabelConfig>) => {
    const { config } = get()
    set({ config: { ...config, ...updates } })
  },

  // Set colors for preview
  setPreviewColors: (colors: Color[]) => {
    set({ previewColors: colors })
  },

  // Set colors from inventory - expand based on cans
  setPreviewColorsFromInventory: (colors: Color[]) => {
    const expandedColors: Color[] = []

    colors.forEach(color => {
      if (color.inventory) {
        // Generate one label per can with the correct sheen
        const sheens = ['flat', 'matte', 'eggshell', 'satin', 'semiGloss', 'gloss'] as const

        sheens.forEach(sheen => {
          const cans = color.inventory?.sheens[sheen]
          if (cans && cans.length > 0) {
            cans.forEach(can => {
              // Generate `quantity` labels for this can
              for (let i = 0; i < can.quantity; i++) {
                expandedColors.push({
                  ...color,
                  sheen,
                  // Add a unique ID suffix for each can
                  id: `${color.id}-${sheen}-${i}`
                })
              }
            })
          }
        })
      } else {
        // No inventory, just add the color once
        expandedColors.push(color)
      }
    })

    set({ previewColors: expandedColors })
  },

  // Update sheen for a specific color in preview
  updateColorSheen: (colorId: string, sheen: Color['sheen']) => {
    const { previewColors } = get()
    const updatedColors = previewColors.map(color =>
      color.id === colorId ? { ...color, sheen } : color
    )
    set({ previewColors: updatedColors })
  },

  // Export labels as individual images
  exportLabels: async (format: 'png' | 'pdf', elementRef: HTMLElement) => {
    set({ exportLoading: true })

    try {
      if (format === 'png') {
        // Find all label elements (children of the container)
        const labelElements = elementRef.querySelectorAll(':scope > div')

        if (labelElements.length === 0) {
          console.error('No labels found to export')
          set({ exportLoading: false })
          return
        }

        // Export each label individually
        for (let i = 0; i < labelElements.length; i++) {
          const labelElement = labelElements[i] as HTMLElement
          const canvas = await html2canvas(labelElement, {
            scale: 3, // High quality for printing
            backgroundColor: null, // Transparent background
            logging: false
          })

          // Convert to blob and download
          await new Promise<void>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `label-${i + 1}-${Date.now()}.png`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }
              // Small delay between downloads to avoid browser blocking
              setTimeout(() => resolve(), 100)
            }, 'image/png')
          })
        }
      } else if (format === 'pdf') {
        // For PDF, export as PNG for now
        console.log('PDF export not yet implemented, exporting as PNG instead')
        await get().exportLabels('png', elementRef)
      }
    } catch (error) {
      console.error('Failed to export labels:', error)
    } finally {
      set({ exportLoading: false })
    }
  },

  // Reset configuration to defaults
  resetConfig: () => {
    set({ config: defaultConfig })
  }
}))