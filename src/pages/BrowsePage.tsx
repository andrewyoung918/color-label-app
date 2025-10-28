import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal, X, Plus, Palette as PaletteIcon, FileText } from 'lucide-react'
import { getAllColors } from '@/utils/colorData'
import { groupColorsByFamily, getColorFamilyDisplayName, getColorFamilyHex, ColorFamily } from '@/utils/colorCategories'
import { getColorTemperature, getLightnessCategory, getSaturationCategory } from '@/utils/colorAnalysis'
import { useColorStore } from '@/stores/useColorStore'
import { usePaletteStore } from '@/stores/usePaletteStore'
import { useLabelStore } from '@/stores/useLabelStore'
import ColorGrid from '@/components/ColorGrid'

const ITEMS_PER_PAGE = 100

type Temperature = 'warm' | 'cool' | 'neutral'
type Lightness = 'light' | 'medium' | 'dark'
type Saturation = 'muted' | 'moderate' | 'vibrant'

export default function BrowsePage() {
  const navigate = useNavigate()
  const [selectedFamilies, setSelectedFamilies] = useState<Set<ColorFamily>>(new Set())
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [selectedTemperatures, setSelectedTemperatures] = useState<Set<Temperature>>(new Set())
  const [selectedLightness, setSelectedLightness] = useState<Set<Lightness>>(new Set())
  const [selectedSaturations, setSelectedSaturations] = useState<Set<Saturation>>(new Set())
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [showPaletteModal, setShowPaletteModal] = useState(false)
  const [paletteName, setPaletteName] = useState('')
  const { library, addToLibrary } = useColorStore()
  const { createPalette } = usePaletteStore()
  const { setPreviewColorsFromInventory } = useLabelStore()
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

  const handleColorClick = (colorId: string) => {
    if (!selectionMode) {
      // First click enables selection mode
      setSelectionMode(true)
      setSelectedColors(new Set([colorId]))
    } else {
      // Toggle selection
      const newSelection = new Set(selectedColors)
      if (newSelection.has(colorId)) {
        newSelection.delete(colorId)
      } else {
        newSelection.add(colorId)
      }
      setSelectedColors(newSelection)

      // Exit selection mode if no colors selected
      if (newSelection.size === 0) {
        setSelectionMode(false)
      }
    }
  }

  const handleCancelSelection = () => {
    setSelectedColors(new Set())
    setSelectionMode(false)
  }

  const handleBulkAddToLibrary = () => {
    const colorsToAdd = allDisplayColors.filter(c => selectedColors.has(c.id))
    colorsToAdd.forEach(color => addToLibrary(color))
    handleCancelSelection()
  }

  const handleCreatePalette = () => {
    const colorsForPalette = allDisplayColors.filter(c => selectedColors.has(c.id))
    if (colorsForPalette.length > 0) {
      if (paletteName.trim()) {
        createPalette(paletteName.trim(), colorsForPalette)
        setPaletteName('')
        setShowPaletteModal(false)
        handleCancelSelection()
        navigate('/palettes')
      }
    }
  }

  const handleMakeLabels = () => {
    const selectedColorObjects = allDisplayColors.filter(c => selectedColors.has(c.id))
    // Set labels using inventory data - will generate one label per can
    setPreviewColorsFromInventory(selectedColorObjects)
    navigate('/labels')
    handleCancelSelection()
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Browse Colors
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Explore our complete database of {allColors.length.toLocaleString()} paint colors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                hasActiveFilters || showFilters
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">
                {showFilters ? 'Hide' : 'Show'} Filters
              </span>
              {hasActiveFilters && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-semibold">
                  {selectedFamilies.size + selectedBrands.size + selectedTemperatures.size + selectedLightness.size + selectedSaturations.size}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`grid gap-4 sm:gap-6 ${showFilters ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 animate-fade-in">

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
        )}

        {/* Color Grid */}
        <div className={showFilters ? 'lg:col-span-3' : 'col-span-1'}>
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
                selectedColors={selectedColors}
                selectionMode={selectionMode}
                onAddToLibrary={addToLibrary}
                onToggleSelection={handleColorClick}
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

      {/* Bulk Action Bar */}
      {selectionMode && selectedColors.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-primary-500 shadow-2xl z-50 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {selectedColors.size} color{selectedColors.size !== 1 ? 's' : ''} selected
                </div>
                <button
                  onClick={handleCancelSelection}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
                <button
                  onClick={handleBulkAddToLibrary}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add to Library
                </button>
                <button
                  onClick={() => setShowPaletteModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <PaletteIcon className="w-4 h-4" />
                  Make Palette
                </button>
                <button
                  onClick={handleMakeLabels}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Make Labels
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Palette Modal */}
      {showPaletteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Palette</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Creating palette with {selectedColors.size} color{selectedColors.size !== 1 ? 's' : ''}
            </p>
            <input
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && paletteName.trim()) handleCreatePalette()
                if (e.key === 'Escape') setShowPaletteModal(false)
              }}
              placeholder="Enter palette name..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowPaletteModal(false)
                  setPaletteName('')
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePalette}
                disabled={!paletteName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Palette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}