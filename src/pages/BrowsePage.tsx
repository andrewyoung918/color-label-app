import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { getAllColors } from '@/utils/colorData'
import { groupColorsByFamily, getColorFamilyDisplayName, getColorFamilyHex, ColorFamily } from '@/utils/colorCategories'
import { useColorStore } from '@/stores/useColorStore'
import ColorGrid from '@/components/ColorGrid'

const ITEMS_PER_PAGE = 100

export default function BrowsePage() {
  const [selectedFamily, setSelectedFamily] = useState<ColorFamily | 'all'>('all')
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const { library, addToLibrary } = useColorStore()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Get all colors and group them
  const allColors = useMemo(() => getAllColors(), [])
  const colorsByFamily = useMemo(() => groupColorsByFamily(allColors), [allColors])

  // Get all colors to display based on selection
  const allDisplayColors = selectedFamily === 'all'
    ? allColors
    : colorsByFamily[selectedFamily]

  // Get the visible slice of colors
  const displayColors = allDisplayColors.slice(0, displayCount)
  const hasMore = displayCount < allDisplayColors.length

  const families = Object.keys(colorsByFamily) as ColorFamily[]

  // Reset display count when family changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [selectedFamily])

  // Load more items
  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE)
    }
  }, [hasMore])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore])

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
                  : `${getColorFamilyDisplayName(selectedFamily)}`
                }
              </h2>
              <div className="text-sm text-gray-500">
                Showing {displayColors.length} of {allDisplayColors.length} colors
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <ColorGrid
                colors={displayColors}
                libraryColors={library}
                onAddToLibrary={addToLibrary}
                emptyMessage="No colors found in this category"
              />
            </div>

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="mt-6 text-center py-4">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                  Loading more colors...
                </div>
              </div>
            )}

            {!hasMore && displayColors.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                All {allDisplayColors.length} colors loaded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}