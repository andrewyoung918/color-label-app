import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePaletteStore } from '@/stores/usePaletteStore'
import { ArrowLeft, Trash2, Copy, FileText } from 'lucide-react'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import { Palette } from '@/types'

export default function PaletteDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { palettes, deletePalette } = usePaletteStore()
  const [palette, setPalette] = useState<Palette | null>(null)

  useEffect(() => {
    const foundPalette = palettes.find(p => p.id === id)
    if (foundPalette) {
      setPalette(foundPalette)
    } else {
      // Palette not found, go back to palettes page
      navigate('/palettes')
    }
  }, [id, palettes, navigate])

  if (!palette) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading palette...</div>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this palette?')) {
      deletePalette(palette.id)
      navigate('/palettes')
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20

    // Title
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text(palette.name, margin, margin + 10)

    // Metadata
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100)
    doc.text(`Created: ${format(new Date(palette.createdAt), 'MMMM d, yyyy')}`, margin, margin + 20)
    doc.text(`Colors: ${palette.colors.length}`, margin, margin + 25)

    // Reset text color
    doc.setTextColor(0)

    // Color swatches and details
    let yPosition = margin + 40
    const swatchSize = 25
    const colorsPerRow = 3
    const spacing = (pageWidth - 2 * margin - colorsPerRow * swatchSize) / (colorsPerRow - 1)

    palette.colors.forEach((color, index) => {
      const row = Math.floor(index / colorsPerRow)
      const col = index % colorsPerRow
      const x = margin + col * (swatchSize + spacing)
      const y = yPosition + row * (swatchSize + 35)

      // Draw color swatch
      const rgb = color.rgb
      doc.setFillColor(rgb[0], rgb[1], rgb[2])
      doc.rect(x, y, swatchSize, swatchSize, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(x, y, swatchSize, swatchSize, 'S')

      // Add color details below swatch
      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      doc.text(color.name, x, y + swatchSize + 5, { maxWidth: swatchSize })

      doc.setFont(undefined, 'normal')
      doc.setFontSize(8)
      doc.text(color.brand, x, y + swatchSize + 9, { maxWidth: swatchSize })

      if (color.code) {
        doc.text(color.code, x, y + swatchSize + 13, { maxWidth: swatchSize })
      }

      doc.setTextColor(100)
      doc.text(color.hex.toUpperCase(), x, y + swatchSize + 17, { maxWidth: swatchSize })
      doc.setTextColor(0)

      // Add new page if needed
      if (row > 0 && row % 5 === 0 && col === colorsPerRow - 1 && index < palette.colors.length - 1) {
        doc.addPage()
        yPosition = margin
      }
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150)
    const footerText = `Generated on ${format(new Date(), 'MMMM d, yyyy')} • Color Label App`
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Save the PDF
    doc.save(`${palette.name.replace(/\s+/g, '-')}-palette.pdf`)
  }

  const copyColorList = () => {
    const colorList = palette.colors
      .map(c => `${c.name} - ${c.brand} (${c.hex})`)
      .join('\n')
    navigator.clipboard.writeText(colorList)
    alert('Color list copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <button
            onClick={() => navigate('/palettes')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Palettes
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyColorList}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy List</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Export </span><span>PDF</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{palette.name}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>{palette.colors.length} colors</span>
            <span className="hidden sm:inline">•</span>
            <span>Created {format(new Date(palette.createdAt), 'MMM d, yyyy')}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Updated {format(new Date(palette.updatedAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Color Preview Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="h-16 sm:h-20 flex">
          {palette.colors.map((color) => (
            <div
              key={color.id}
              className="flex-1"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Color Cards Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Colors in Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {palette.colors.map((color) => (
            <div key={color.id} className="space-y-2">
              <div
                className="aspect-square rounded-lg shadow-md border border-gray-200 relative group"
                style={{ backgroundColor: color.hex }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
                  <span className="text-white font-mono text-sm">{color.hex}</span>
                </div>
              </div>
              <div className="px-1 sm:px-2">
                <h3 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">{color.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{color.brand}</p>
                {color.code && <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{color.code}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Details List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Color Details</h2>
        <div className="space-y-2 sm:space-y-3">
          {palette.colors.map((color, index) => (
            <div
              key={color.id}
              className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 w-6 sm:w-8 flex-shrink-0">{index + 1}</div>
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-300 dark:border-gray-600 flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{color.name}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {color.brand} • {color.code || 'No code'} • {color.hex.toUpperCase()}
                </div>
              </div>
              <div className="hidden md:block text-xs sm:text-sm font-mono text-gray-500 dark:text-gray-500 flex-shrink-0">
                RGB({color.rgb.join(', ')})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}