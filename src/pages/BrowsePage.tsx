import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { getAllColors } from '@/utils/colorData'
import { groupColorsByFamily, getColorFamilyDisplayName, getColorFamilyHex, ColorFamily } from '@/utils/colorCategories'
import { getColorTemperature, getLightnessCategory, getSaturationCategory } from '@/utils/colorAnalysis'
import { useColorStore } from '@/stores/useColorStore'
import ColorGrid from '@/components/ColorGrid'

const ITEMS_PER_PAGE = 100

type Temperature = 'warm' | 'cool' | 'neutral'
type Lightness = 'light' | 'medium' | 'dark'
type Saturation = 'muted' | 'moderate' | 'vibrant'

export default function BrowsePage() {
  const [selectedFamilies, setSelectedFamilies] = useState<Set<ColorFamily>>(new Set())
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [selectedTemperatures, setSelectedTemperatures] = useState<Set<Temperature>>(new Set())
  const [selectedLightness, setSelectedLightness] = useState<Set<Lightness>>(new Set())
  const [selectedSaturations, setSelectedSaturations] = useState<Set<Saturation>>(new Set())
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const { library, addToLibrary } = useColorStore()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Get all colors and group them
  const allColors = useMemo(() => getAllColors(), [])
  const colorsByFamily = useMemo(() => groupColorsByFamily(allColors), [allColors])

  // Get unique brands
  const brands = useMemo(() => {
    const brandSet = new Set(allColors.map(c => c.brand))
    return Array.from(brandSet).sort()
  }, [allColors])

  // Helper functions for toggling filters
  const toggleFamily = (family: ColorFamily) => {
    setSelectedFamilies(prev => {
      const next = new Set(prev)
      if (next.has(family)) {
        next.delete(family)
      } else {
        next.add(family)
      }
      return next
    })
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => {
      const next = new Set(prev)
      if (next.has(brand)) {
        next.delete(brand)
      } else {
        next.add(brand)
      }
      return next
    })
  }

  const toggleTemperature = (temp: Temperature) => {
    setSelectedTemperatures(prev => {
      const next = new Set(prev)
      if (next.has(temp)) {
        next.delete(temp)
      } else {
        next.add(temp)
      }
      return next
    })
  }

  const toggleLightness = (light: Lightness) => {
    setSelectedLightness(prev => {
      const next = new Set(prev)
      if (next.has(light)) {
        next.delete(light)
      } else {
        next.add(light)
      }
      return next
    })
  }

  const toggleSaturation = (sat: Saturation) => {
    setSelectedSaturations(prev => {
      const next = new Set(prev)
      if (next.has(sat)) {
        next.delete(sat)
      } else {
        next.add(sat)
      }
      return next
    })
  }

  const clearAllFilters = () => {
    setSelectedFamilies(new Set())
    setSelectedBrands(new Set())
    setSelectedTemperatures(new Set())
    setSelectedLightness(new Set())
    setSelectedSaturations(new Set())
  }

  // Get all colors to display based on selections
  const allDisplayColors = useMemo(() => {
    let filtered = allColors

    // Filter by color families
    if (selectedFamilies.size > 0) {
      filtered = filtered.filter(color => {
        // Find which family this color belongs to
        for (const [family, colors] of Object.entries(colorsByFamily)) {
          if (colors.some(c => c.id === color.id)) {
            return selectedFamilies.has(family as ColorFamily)
          }
        }
        return false
      })
    }

    // Filter by brands
    if (selectedBrands.size > 0) {
      filtered = filtered.filter(c => selectedBrands.has(c.brand))
    }

    // Filter by temperature
    if (selectedTemperatures.size > 0) {
      filtered = filtered.filter(c => selectedTemperatures.has(getColorTemperature(c)))
    }

    // Filter by lightness
    if (selectedLightness.size > 0) {
      filtered = filtered.filter(c => selectedLightness.has(getLightnessCategory(c)))
    }

    // Filter by saturation
    if (selectedSaturations.size > 0) {
      filtered = filtered.filter(c => selectedSaturations.has(getSaturationCategory(c)))
    }

    return filtered
  }, [allColors, colorsByFamily, selectedFamilies, selectedBrands, selectedTemperatures, selectedLightness, selectedSaturations])

  // Get the visible slice of colors
  const displayColors = allDisplayColors.slice(0, displayCount)
  const hasMore = displayCount < allDisplayColors.length

  const families = Object.keys(colorsByFamily) as ColorFamily[]

  // Check if any filters are active
  const hasActiveFilters = selectedFamilies.size > 0 || selectedBrands.size > 0 ||
    selectedTemperatures.size > 0 || selectedLightness.size > 0 || selectedSaturations.size > 0

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [selectedFamilies, selectedBrands, selectedTemperatures, selectedLightness, selectedSaturations])

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
    <div className="space-y-4 sm:space-y-6">
      {/* Browse Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Browse Colors
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Explore our complete database of {allColors.length.toLocaleString()} paint colors organized by color family
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Clear All Filters ({selectedFamilies.size + selectedBrands.size + selectedTemperatures.size + selectedLightness.size + selectedSaturations.size})
            </button>
          )}

          {/* Color Families Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Color Families</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {families.map(family => {
                const colors = colorsByFamily[family]
                if (colors.length === 0) return null
                const isSelected = selectedFamilies.has(family)

                return (
                  <label
                    key={family}
                    className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFamily(family)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: getColorFamilyHex(family) }}
                    />
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getColorFamilyDisplayName(family)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{colors.length}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Brands</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {brands.map(brand => {
                const brandColors = allColors.filter(c => c.brand === brand)
                const isSelected = selectedBrands.has(brand)

                return (
                  <label
                    key={brand}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{brand}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{brandColors.length}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Temperature Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Temperature</h2>
            <div className="space-y-2">
              {(['warm', 'cool', 'neutral'] as Temperature[]).map(temp => {
                const isSelected = selectedTemperatures.has(temp)
                return (
                  <label
                    key={temp}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTemperature(temp)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize">{temp}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Lightness Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Lightness</h2>
            <div className="space-y-2">
              {(['light', 'medium', 'dark'] as Lightness[]).map(light => {
                const isSelected = selectedLightness.has(light)
                return (
                  <label
                    key={light}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleLightness(light)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize">{light}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Saturation Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Saturation</h2>
            <div className="space-y-2">
              {(['muted', 'moderate', 'vibrant'] as Saturation[]).map(sat => {
                const isSelected = selectedSaturations.has(sat)
                return (
                  <label
                    key={sat}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSaturation(sat)}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize">{sat}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 mt-3 sm:mt-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Statistics</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Colors:</span>
                <span className="font-medium text-gray-900 dark:text-white">{allColors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Filtered:</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">{allDisplayColors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">In Library:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{library.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Brands:</span>
                <span className="font-medium text-gray-900 dark:text-white">{brands.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Color Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {hasActiveFilters ? 'Filtered Colors' : 'All Colors'}
              </h2>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
              <div ref={loadMoreRef} className="mt-4 sm:mt-6 text-center py-4">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
                  Loading more colors...
                </div>
              </div>
            )}

            {!hasMore && displayColors.length > 0 && (
              <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                All {allDisplayColors.length} colors loaded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}