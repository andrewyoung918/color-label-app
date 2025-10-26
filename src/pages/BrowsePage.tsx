import { useState, useMemo } from 'react'
import { getAllColors } from '@/utils/colorData'
import { groupColorsByFamily, getColorFamilyDisplayName, getColorFamilyHex, ColorFamily } from '@/utils/colorCategories'
import { useColorStore } from '@/stores/useColorStore'
import ColorGrid from '@/components/ColorGrid'

export default function BrowsePage() {
  const [selectedFamily, setSelectedFamily] = useState<ColorFamily | 'all'>('all')
  const { library, addToLibrary } = useColorStore()

  // Get all colors and group them
  const allColors = useMemo(() => getAllColors(), [])
  const colorsByFamily = useMemo(() => groupColorsByFamily(allColors), [allColors])

  // Get colors to display based on selection
  const displayColors = selectedFamily === 'all'
    ? allColors
    : colorsByFamily[selectedFamily]

  const families = Object.keys(colorsByFamily) as ColorFamily[]

  return (
    <div className="space-y-6">
      {/* Browse Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Colors
        </h1>
        <p className="text-gray-600">
          Explore our complete database of {allColors.length.toLocaleString()} paint colors organized by color family
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Color Family Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Color Families</h2>

            {/* All Colors Option */}
            <button
              onClick={() => setSelectedFamily('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-2 ${
                selectedFamily === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">All Colors</span>
                <span className="text-sm text-gray-500">{allColors.length}</span>
              </div>
            </button>

            {/* Color Families */}
            <div className="space-y-1">
              {families.map(family => {
                const colors = colorsByFamily[family]
                if (colors.length === 0) return null

                return (
                  <button
                    key={family}
                    onClick={() => setSelectedFamily(family)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedFamily === family
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorFamilyHex(family) }}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-medium">{getColorFamilyDisplayName(family)}</span>
                        <span className="text-sm text-gray-500">{colors.length}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Colors:</span>
                <span className="font-medium">{allColors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Library:</span>
                <span className="font-medium text-green-600">{library.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brands:</span>
                <span className="font-medium">5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Color Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedFamily === 'all'
                  ? 'All Colors'
                  : `${getColorFamilyDisplayName(selectedFamily)} (${displayColors.length})`
                }
              </h2>
              <div className="text-sm text-gray-500">
                Showing {Math.min(100, displayColors.length)} of {displayColors.length} colors
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <ColorGrid
                colors={displayColors.slice(0, 100)}
                libraryColors={library}
                onAddToLibrary={addToLibrary}
                emptyMessage="No colors found in this category"
              />
            </div>

            {displayColors.length > 100 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Showing first 100 colors. Use search to find specific colors.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}