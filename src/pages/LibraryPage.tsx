import { useState, useEffect, useRef, useMemo } from 'react'
import { Trash2, Palette, Tag, Download, Upload, SlidersHorizontal, X } from 'lucide-react'
import { useColorStore } from '@/stores/useColorStore'
import { usePaletteStore } from '@/stores/usePaletteStore'
import { useLabelStore } from '@/stores/useLabelStore'
import { useNavigate } from 'react-router-dom'
import { groupColorsByFamily, ColorFamily, getColorFamilyDisplayName } from '@/utils/colorCategories'
import ColorGrid from '@/components/ColorGrid'
import PaintInventory from '@/components/PaintInventory'
import { Color, PaintInventory as PaintInventoryType } from '@/types'

type SortOption = 'recent' | 'name' | 'brand' | 'family'

export default function LibraryPage() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [paletteModalOpen, setPaletteModalOpen] = useState(false)
  const [paletteName, setPaletteName] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [selectedFamilies, setSelectedFamilies] = useState<Set<ColorFamily>>(new Set())
  const [selectedSheens, setSelectedSheens] = useState<Set<string>>(new Set())

  const {
    library,
    selectedColors,
    loadLibraryFromStorage,
    removeFromLibrary,
    toggleColorSelection,
    clearSelection
  } = useColorStore()

  const { createPalette } = usePaletteStore()
  const { setPreviewColors } = useLabelStore()

  // Load library on mount
  useEffect(() => {
    loadLibraryFromStorage()
  }, [loadLibraryFromStorage])

  // Get unique brands and families from library
  const availableBrands = useMemo(() => {
    const brands = new Set(library.map(c => c.brand))
    return Array.from(brands).sort()
  }, [library])

  const colorsByFamily = useMemo(() => groupColorsByFamily(library), [library])
  const availableFamilies = useMemo(() => {
    return Object.keys(colorsByFamily).filter(f => colorsByFamily[f as ColorFamily].length > 0) as ColorFamily[]
  }, [colorsByFamily])

  const availableSheens = useMemo(() => {
    const sheens = new Set<string>()
    library.forEach(color => {
      if (color.sheen) sheens.add(color.sheen)
    })
    return Array.from(sheens).sort()
  }, [library])

  // Toggle filter functions
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

  const toggleSheen = (sheen: string) => {
    setSelectedSheens(prev => {
      const next = new Set(prev)
      if (next.has(sheen)) {
        next.delete(sheen)
      } else {
        next.add(sheen)
      }
      return next
    })
  }

  const clearFilters = () => {
    setSelectedBrands(new Set())
    setSelectedFamilies(new Set())
    setSelectedSheens(new Set())
  }

  const hasActiveFilters = selectedBrands.size > 0 || selectedFamilies.size > 0 || selectedSheens.size > 0

  // Apply sorting and filtering
  const sortedAndFilteredLibrary = useMemo(() => {
    let filtered = [...library]

    // Apply filters
    if (selectedBrands.size > 0) {
      filtered = filtered.filter(c => selectedBrands.has(c.brand))
    }

    if (selectedFamilies.size > 0) {
      filtered = filtered.filter(color => {
        for (const [family, colors] of Object.entries(colorsByFamily)) {
          if (colors.some(c => c.id === color.id)) {
            return selectedFamilies.has(family as ColorFamily)
          }
        }
        return false
      })
    }

    if (selectedSheens.size > 0) {
      filtered = filtered.filter(c => c.sheen && selectedSheens.has(c.sheen))
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        // Most recent first (by addedAt date)
        return filtered.sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0
          const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0
          return dateB - dateA
        })

      case 'name':
        // Sort by name A-Z
        return filtered.sort((a, b) => {
          const nameA = (a.customName || a.name).toLowerCase()
          const nameB = (b.customName || b.name).toLowerCase()
          return nameA.localeCompare(nameB)
        })

      case 'brand':
        // Sort by brand A-Z
        return filtered.sort((a, b) => a.brand.localeCompare(b.brand))

      case 'family':
        // Sort by color family
        return filtered.sort((a, b) => {
          let familyA = 'other'
          let familyB = 'other'

          for (const [family, colors] of Object.entries(colorsByFamily)) {
            if (colors.some(c => c.id === a.id)) familyA = family
            if (colors.some(c => c.id === b.id)) familyB = family
          }

          return familyA.localeCompare(familyB)
        })

      default:
        return filtered
    }
  }, [library, sortBy, selectedBrands, selectedFamilies, selectedSheens, colorsByFamily])

  const handleRemoveSelected = () => {
    selectedColors.forEach(colorId => {
      removeFromLibrary(colorId)
    })
    clearSelection()
    setIsSelectionMode(false)
  }

  const handleCreatePalette = () => {
    if (paletteName.trim() && selectedColors.size > 0) {
      const selectedColorObjects = library.filter(c => selectedColors.has(c.id))
      createPalette(paletteName, selectedColorObjects)
      setPaletteModalOpen(false)
      setPaletteName('')
      clearSelection()
      setIsSelectionMode(false)
      navigate('/palettes')
    }
  }

  const handleCreateLabels = () => {
    const selectedColorObjects = library.filter(c => selectedColors.has(c.id))
    setPreviewColors(selectedColorObjects)
    navigate('/labels')
  }

  // New state for inventory modal
  const [inventoryColor, setInventoryColor] = useState<Color | null>(null)
  // New state for edit name modal
  const [editNameColor, setEditNameColor] = useState<Color | null>(null)
  const [customName, setCustomName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export library to JSON
  const handleExportLibrary = () => {
    const dataStr = JSON.stringify(library, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `color-library-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Import library from JSON
  const handleImportLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedColors = JSON.parse(e.target?.result as string) as Color[]
          // Add imported colors to library (avoiding duplicates)
          const existingIds = new Set(library.map(c => c.id))
          const newColors = importedColors.filter(c => !existingIds.has(c.id))

          // Add new colors to the library
          newColors.forEach(color => {
            useColorStore.getState().addToLibrary(color)
          })

          alert(`Imported ${newColors.length} new colors!`)
        } catch (error) {
          alert('Failed to import library. Please check the file format.')
        }
      }
      reader.readAsText(file)
    }
  }

  // Update color inventory
  const handleUpdateInventory = (colorId: string, inventory: PaintInventoryType) => {
    useColorStore.getState().updateColorInventory(colorId, inventory)
  }

  // Handle color click - open inventory
  const handleColorClick = (color: Color) => {
    if (!isSelectionMode) {
      setInventoryColor(color)
    }
  }

  // Handle print label from inventory
  const handlePrintLabel = (color: Color) => {
    setPreviewColors([color])
    setInventoryColor(null)
    navigate('/labels')
  }

  // Handle edit name
  const handleEditName = (e: React.MouseEvent, color: Color) => {
    e.stopPropagation()
    setEditNameColor(color)
    setCustomName(color.customName || '')
  }

  // Save custom name
  const handleSaveCustomName = () => {
    if (editNameColor) {
      useColorStore.getState().updateCustomName(editNameColor.id, customName)
      setEditNameColor(null)
      setCustomName('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Library Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Color Library
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {sortedAndFilteredLibrary.length} of {library.length} colors {hasActiveFilters && '(filtered)'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Import/Export Buttons */}
              <button
                onClick={handleExportLibrary}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                disabled={library.length === 0}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportLibrary}
                className="hidden"
              />
              {library.length > 0 && (
                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode)
                    clearSelection()
                  }}
                  className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  {isSelectionMode ? 'Cancel' : 'Select'}
                </button>
              )}
            </div>
          </div>

          {/* Sort and Filter Controls */}
          {library.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="brand">Brand (A-Z)</option>
                  <option value="family">Color Family</option>
                </select>
              </div>

              <button
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                  hasActiveFilters || filterPanelOpen
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {hasActiveFilters && `(${selectedBrands.size + selectedFamilies.size + selectedSheens.size})`}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Filter Panel */}
          {filterPanelOpen && library.length > 0 && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 animate-slide-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Brand Filter */}
                {availableBrands.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Brands</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {availableBrands.map(brand => (
                        <label
                          key={brand}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.has(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Family Filter */}
                {availableFamilies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Color Families</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {availableFamilies.map(family => (
                        <label
                          key={family}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFamilies.has(family)}
                            onChange={() => toggleFamily(family)}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white capitalize">{getColorFamilyDisplayName(family)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sheen Filter */}
                {availableSheens.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Sheens</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {availableSheens.map(sheen => (
                        <label
                          key={sheen}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSheens.has(sheen)}
                            onChange={() => toggleSheen(sheen)}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white capitalize">
                            {sheen === 'semiGloss' ? 'Semi-Gloss' : sheen.charAt(0).toUpperCase() + sheen.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {isSelectionMode && selectedColors.size > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 animate-slide-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {selectedColors.size} color{selectedColors.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRemoveSelected}
                className="px-3 py-1.5 text-xs sm:text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
              <button
                onClick={() => setPaletteModalOpen(true)}
                className="px-3 py-1.5 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Create </span><span>Palette</span>
              </button>
              <button
                onClick={handleCreateLabels}
                className="px-3 py-1.5 text-xs sm:text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex items-center gap-1"
              >
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">Create </span><span>Labels</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <ColorGrid
            colors={sortedAndFilteredLibrary}
            selectedColors={selectedColors}
            selectionMode={isSelectionMode}
            onToggleSelection={toggleColorSelection}
            onColorClick={handleColorClick}
            onEdit={handleEditName}
            emptyMessage={hasActiveFilters ? "No colors match the selected filters" : "No colors in your library yet. Start by searching and adding colors!"}
          />
        </div>
      </div>

      {/* Palette Name Modal */}
      {paletteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Palette</h2>
            <input
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter palette name..."
              autoFocus
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setPaletteModalOpen(false)
                  setPaletteName('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePalette}
                disabled={!paletteName.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paint Inventory Modal */}
      {inventoryColor && (
        <PaintInventory
          color={inventoryColor}
          onUpdateInventory={handleUpdateInventory}
          onClose={() => setInventoryColor(null)}
          onPrintLabel={() => handlePrintLabel(inventoryColor)}
        />
      )}

      {/* Edit Name Modal */}
      {editNameColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Color Name</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Name
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {editNameColor.name} - {editNameColor.brand}
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter custom name (leave empty to use original)"
                autoFocus
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                onClick={() => {
                  setEditNameColor(null)
                  setCustomName('')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomName}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}