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
  exportLabels: (format: 'png' | 'pdf', elementRef: HTMLElement) => Promise<void>
  resetConfig: () => void
}

const defaultConfig: LabelConfig = {
  layout: 'default',
  showBrand: true,
  showCode: true,
  showRgb: false,
  fontSize: 'medium',
  dimensions: {
    width: 3,
    height: 2
  },
  backgroundColor: 'color',
  textColor: 'auto'
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

  // Export labels as image or PDF
  exportLabels: async (format: 'png' | 'pdf', elementRef: HTMLElement) => {
    set({ exportLoading: true })

    try {
      if (format === 'png') {
        // Use html2canvas to capture the element
        const canvas = await html2canvas(elementRef, {
          scale: 2, // High quality
          backgroundColor: '#ffffff',
          logging: false
        })

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `color-labels-${Date.now()}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        }, 'image/png')
      } else if (format === 'pdf') {
        // For PDF, we would need a library like jsPDF
        // For now, we'll just export as PNG
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