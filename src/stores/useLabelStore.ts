import { create } from 'zustand'
import { LabelConfig, Color } from '@/types'
import html2canvas from 'html2canvas'
import { getTemplate } from '@/utils/labelTemplates'

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
  removePreviewColor: (colorId: string) => void
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
  },
  exportLayout: {
    mode: 'sheet',
    sheetTemplate: 'avery-5163'
  },
  shape: 'rectangle',
  borderRadius: 0
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

  // Remove a color from preview
  removePreviewColor: (colorId: string) => {
    const { previewColors } = get()
    const updatedColors = previewColors.filter(color => color.id !== colorId)
    set({ previewColors: updatedColors })
  },

  // Export labels as individual images or grid
  exportLabels: async (format: 'png' | 'pdf', elementRef: HTMLElement) => {
    set({ exportLoading: true })

    try {
      const { config } = get()
      const exportLayout = config.exportLayout || { mode: 'individual' }

      if (format === 'png') {
        const labelElements = Array.from(elementRef.querySelectorAll(':scope > div')) as HTMLElement[]

        if (labelElements.length === 0) {
          console.error('No labels found to export')
          set({ exportLoading: false })
          return
        }

        if (exportLayout.mode === 'individual') {
          // Export each label individually (original behavior)
          for (let i = 0; i < labelElements.length; i++) {
            const labelElement = labelElements[i]
            const canvas = await html2canvas(labelElement, {
              scale: 3,
              backgroundColor: null,
              logging: false
            })

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
                setTimeout(() => resolve(), 100)
              }, 'image/png')
            })
          }
        } else if (exportLayout.mode === 'one-per-page') {
          // Export one label per page, centered on letter-size page
          const pageWidth = 816 // 8.5" at 96 DPI
          const pageHeight = 1056 // 11" at 96 DPI
          const timestamp = Date.now()

          // Capture each label first
          const labelCanvases = await Promise.all(
            labelElements.map(el => html2canvas(el, {
              scale: 3,
              backgroundColor: null,
              logging: false
            }))
          )

          // Create a page for each label
          for (let i = 0; i < labelCanvases.length; i++) {
            const labelCanvas = labelCanvases[i]

            // Create page canvas
            const pageCanvas = document.createElement('canvas')
            pageCanvas.width = pageWidth * 3 // Scale for quality
            pageCanvas.height = pageHeight * 3
            const ctx = pageCanvas.getContext('2d')!

            // Fill with white background
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

            // Center the label on the page
            const x = (pageCanvas.width - labelCanvas.width) / 2
            const y = (pageCanvas.height - labelCanvas.height) / 2
            ctx.drawImage(labelCanvas, x, y)

            // Download the page
            await new Promise<void>((resolve) => {
              pageCanvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `labels-document-page-${i + 1}-${timestamp}.png`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }
                setTimeout(() => resolve(), 100)
              }, 'image/png')
            })
          }
        } else if (exportLayout.mode === 'sheet') {
          // Export as sheet layout using template
          const templateId = exportLayout.sheetTemplate || 'avery-5163'
          const template = getTemplate(templateId)

          const columns = templateId === 'custom' ? (exportLayout.customColumns || 2) : template.columns
          const rows = templateId === 'custom' ? (exportLayout.customRows || 5) : template.rows
          const spacing = templateId === 'custom' ? (exportLayout.customSpacing || 24) : template.spacing
          const labelsPerPage = columns * rows

          // Capture each label first
          const labelCanvases = await Promise.all(
            labelElements.map(el => html2canvas(el, {
              scale: 3,
              backgroundColor: null,
              logging: false
            }))
          )

          // Create pages
          const numPages = Math.ceil(labelCanvases.length / labelsPerPage)

          for (let page = 0; page < numPages; page++) {
            const startIdx = page * labelsPerPage
            const endIdx = Math.min(startIdx + labelsPerPage, labelCanvases.length)
            const pageLabels = labelCanvases.slice(startIdx, endIdx)

            // Calculate canvas size
            const labelWidth = pageLabels[0].width
            const labelHeight = pageLabels[0].height
            const pageWidth = columns * labelWidth + (columns - 1) * spacing
            const pageHeight = rows * labelHeight + (rows - 1) * spacing

            // Create composite canvas
            const compositeCanvas = document.createElement('canvas')
            compositeCanvas.width = pageWidth
            compositeCanvas.height = pageHeight
            const ctx = compositeCanvas.getContext('2d')!

            // Fill with white background
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, pageWidth, pageHeight)

            // Draw labels in grid
            pageLabels.forEach((labelCanvas, idx) => {
              const col = idx % columns
              const row = Math.floor(idx / columns)
              const x = col * (labelWidth + spacing)
              const y = row * (labelHeight + spacing)
              ctx.drawImage(labelCanvas, x, y)
            })

            // Download the page
            await new Promise<void>((resolve) => {
              compositeCanvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `labels-page-${page + 1}-${Date.now()}.png`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }
                setTimeout(() => resolve(), 100)
              }, 'image/png')
            })
          }
        }
      } else if (format === 'pdf') {
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