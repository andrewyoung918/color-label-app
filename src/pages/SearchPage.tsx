import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, Plus, Palette as PaletteIcon, FileText, X } from 'lucide-react'
import { useColorStore } from '@/stores/useColorStore'
import { usePaletteStore } from '@/stores/usePaletteStore'
import { useLabelStore } from '@/stores/useLabelStore'
import ColorGrid from '@/components/ColorGrid'

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)
  const [showPaletteModal, setShowPaletteModal] = useState(false)
  const [paletteName, setPaletteName] = useState('')

  const {
    searchResults,
    library,
    loading,
    searchColors,
    addToLibrary,
    loadLibraryFromStorage
  } = useColorStore()

  const { createPalette } = usePaletteStore()
  const { setPreviewColorsFromInventory } = useLabelStore()

  // Load library on mount
  useEffect(() => {
    loadLibraryFromStorage()
  }, [loadLibraryFromStorage])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Perform search when debounced value changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchColors(debouncedSearch)
    }
  }, [debouncedSearch, searchColors])

  const handleAddToLibrary = useCallback((color: any) => {
    addToLibrary(color)
  }, [addToLibrary])

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
    const colorsToAdd = searchResults.filter(c => selectedColors.has(c.id))
    colorsToAdd.forEach(color => addToLibrary(color))
    handleCancelSelection()
  }

  const handleCreatePalette = () => {
    const colorsForPalette = searchResults.filter(c => selectedColors.has(c.id))
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
    const selectedColorObjects = searchResults.filter(c => selectedColors.has(c.id))
    // Set labels using inventory data - will generate one label per can
    setPreviewColorsFromInventory(selectedColorObjects)
    navigate('/labels')
    handleCancelSelection()
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Paint Colors
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Find colors from major paint brands and add them to your library
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base sm:text-lg"
            placeholder="Search by color name, brand, or code..."
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Search Results
          </h2>
          {loading && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-xs sm:text-sm">Searching...</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {debouncedSearch.trim() ? (
              <ColorGrid
                colors={searchResults}
                libraryColors={library}
                selectedColors={selectedColors}
                selectionMode={selectionMode}
                onAddToLibrary={handleAddToLibrary}
                onToggleSelection={handleColorClick}
                emptyMessage="No colors found. Try a different search term."
              />
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Enter a search term to find colors
              </div>
            )}
          </div>
        )}
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