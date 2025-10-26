import { Color } from '@/types'
import { getContrastColor } from '@/utils/colors'
import { Plus, Check, Square, CheckSquare, Edit2 } from 'lucide-react'
import { useState } from 'react'

interface ColorCardProps {
  color: Color
  isInLibrary?: boolean
  isSelected?: boolean
  selectionMode?: boolean
  onAddToLibrary?: (color: Color) => void
  onToggleSelection?: (colorId: string) => void
  onClick?: () => void
  onEdit?: (e: React.MouseEvent) => void
}

export default function ColorCard({
  color,
  isInLibrary = false,
  isSelected = false,
  selectionMode = false,
  onAddToLibrary,
  onToggleSelection,
  onClick,
  onEdit
}: ColorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const textColor = getContrastColor(color.hex)

  const handleClick = () => {
    if (selectionMode && onToggleSelection) {
      onToggleSelection(color.id)
    } else if (onClick) {
      onClick()
    }
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToLibrary) {
      onAddToLibrary(color)
    }
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Display */}
      <div
        className="h-32 relative"
        style={{ backgroundColor: color.hex }}
      >
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="absolute top-2 left-2">
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-white drop-shadow-md" />
            ) : (
              <Square className="w-5 h-5 text-white drop-shadow-md" />
            )}
          </div>
        )}

        {/* Add to Library Button */}
        {!selectionMode && !isInLibrary && onAddToLibrary && isHovered && (
          <button
            onClick={handleAddClick}
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </button>
        )}

        {/* In Library Indicator */}
        {isInLibrary && (
          <div className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md">
            <Check className="w-4 h-4 text-green-600" />
          </div>
        )}

        {/* Color Hex on Hover */}
        {isHovered && (
          <div
            className={`absolute bottom-2 left-2 text-xs font-mono ${
              textColor === 'white' ? 'text-white' : 'text-black'
            } drop-shadow-md`}
          >
            {color.hex}
          </div>
        )}
      </div>

      {/* Color Information */}
      <div className="p-3 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate">
              {color.customName || color.name}
            </h3>
            {color.customName && (
              <p className="text-xs text-gray-500 truncate italic">
                {color.name}
              </p>
            )}
          </div>
          {onEdit && isHovered && !selectionMode && (
            <button
              onClick={onEdit}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              title="Edit name"
            >
              <Edit2 className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 truncate mt-1">{color.brand}</p>
        {color.code && (
          <p className="text-xs text-gray-500 mt-1">{color.code}</p>
        )}
      </div>
    </div>
  )
}