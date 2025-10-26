import { Color } from '@/types'
import ColorCard from './ColorCard'

interface ColorGridProps {
  colors: Color[]
  libraryColors?: Color[]
  selectedColors?: Set<string>
  selectionMode?: boolean
  onAddToLibrary?: (color: Color) => void
  onToggleSelection?: (colorId: string) => void
  onColorClick?: (color: Color) => void
  emptyMessage?: string
}

export default function ColorGrid({
  colors,
  libraryColors = [],
  selectedColors = new Set(),
  selectionMode = false,
  onAddToLibrary,
  onToggleSelection,
  onColorClick,
  emptyMessage = 'No colors to display'
}: ColorGridProps) {
  if (colors.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  const libraryColorIds = new Set(libraryColors.map(c => c.id))

  return (
    <>
      {colors.map((color) => (
        <ColorCard
          key={color.id}
          color={color}
          isInLibrary={libraryColorIds.has(color.id)}
          isSelected={selectedColors.has(color.id)}
          selectionMode={selectionMode}
          onAddToLibrary={onAddToLibrary}
          onToggleSelection={onToggleSelection}
          onClick={() => onColorClick?.(color)}
        />
      ))}
    </>
  )
}