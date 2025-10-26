import { useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { usePaletteStore } from '@/stores/usePaletteStore'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

export default function PalettesPage() {
  const navigate = useNavigate()
  const { palettes, loadPalettesFromStorage, deletePalette } = usePaletteStore()

  useEffect(() => {
    loadPalettesFromStorage()
  }, [loadPalettesFromStorage])

  const handleNewPalette = () => {
    navigate('/library')
  }

  const handleDeletePalette = (e: React.MouseEvent, paletteId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this palette?')) {
      deletePalette(paletteId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Palettes Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Color Palettes
            </h1>
            <p className="text-gray-600">
              Organize your colors into beautiful palettes
            </p>
          </div>
          <button
            onClick={handleNewPalette}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Palette
          </button>
        </div>
      </div>

      {/* Palette Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {palettes.length > 0 ? (
          palettes.map((palette) => (
            <div
              key={palette.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Color Preview */}
              <div className="h-24 flex">
                {palette.colors.length > 0 ? (
                  palette.colors.slice(0, 6).map((color, index) => (
                    <div
                      key={color.id}
                      className="flex-1"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))
                ) : (
                  <div className="flex-1 bg-gray-200 flex items-center justify-center text-gray-400">
                    No colors
                  </div>
                )}
              </div>

              {/* Palette Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{palette.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {palette.colors.length} color{palette.colors.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created {format(new Date(palette.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeletePalette(e, palette.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete palette"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No palettes yet</h3>
            <p className="text-gray-600 text-center max-w-sm">
              Create your first palette by selecting colors from your library
            </p>
            <button
              onClick={handleNewPalette}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Library
            </button>
          </div>
        )}
      </div>
    </div>
  )
}