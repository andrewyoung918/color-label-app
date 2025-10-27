import { useState, useEffect, useRef } from 'react'
import { Trash2, Palette, Tag, Download, Upload } from 'lucide-react'
import { useColorStore } from '@/stores/useColorStore'
import { usePaletteStore } from '@/stores/usePaletteStore'
import { useLabelStore } from '@/stores/useLabelStore'
import { useNavigate } from 'react-router-dom'
import ColorGrid from '@/components/ColorGrid'
import PaintInventory from '@/components/PaintInventory'
import { Color, PaintInventory as PaintInventoryType } from '@/types'

export default function LibraryPage() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [paletteModalOpen, setPaletteModalOpen] = useState(false)
  const [paletteName, setPaletteName] = useState('')

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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Color Library
            </h1>
            <p className="text-gray-600">
              Your saved colors for creating palettes and labels
            </p>
          </div>
          <div className="flex gap-2">
            {/* Import/Export Buttons */}
            <button
              onClick={handleExportLibrary}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              disabled={library.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
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
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isSelectionMode ? 'Cancel' : 'Select'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {isSelectionMode && selectedColors.size > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 animate-slide-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedColors.size} color{selectedColors.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleRemoveSelected}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
              <button
                onClick={() => setPaletteModalOpen(true)}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <Palette className="w-4 h-4" />
                Create Palette
              </button>
              <button
                onClick={handleCreateLabels}
                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center gap-1"
              >
                <Tag className="w-4 h-4" />
                Create Labels
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <ColorGrid
            colors={library}
            selectedColors={selectedColors}
            selectionMode={isSelectionMode}
            onToggleSelection={toggleColorSelection}
            onColorClick={handleColorClick}
            onEdit={handleEditName}
            emptyMessage="No colors in your library yet. Start by searching and adding colors!"
          />
        </div>
      </div>

      {/* Palette Name Modal */}
      {paletteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Palette</h2>
            <input
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter palette name..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setPaletteModalOpen(false)
                  setPaletteName('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Color Name</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Name
              </label>
              <p className="text-sm text-gray-600 mb-3">
                {editNameColor.name} - {editNameColor.brand}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter custom name (leave empty to use original)"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditNameColor(null)
                  setCustomName('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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