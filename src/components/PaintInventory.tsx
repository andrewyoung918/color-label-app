import { useState } from 'react'
import { Color, PaintInventory as PaintInventoryType, PaintCan } from '@/types'
import { Plus, Minus, X, Package, Printer } from 'lucide-react'

interface PaintInventoryProps {
  color: Color
  onUpdateInventory: (colorId: string, inventory: PaintInventoryType) => void
  onClose?: () => void
  onPrintLabel?: () => void
}

const SHEENS = [
  { key: 'flat', label: 'Flat/Matte' },
  { key: 'eggshell', label: 'Eggshell' },
  { key: 'satin', label: 'Satin' },
  { key: 'semiGloss', label: 'Semi-Gloss' },
  { key: 'gloss', label: 'Gloss' }
] as const

const SIZES = [
  { key: 'sample', label: 'Sample' },
  { key: 'quart', label: 'Quart' },
  { key: 'gallon', label: 'Gallon' },
  { key: '5-gallon', label: '5 Gallon' }
] as const

export default function PaintInventory({ color, onUpdateInventory, onClose, onPrintLabel }: PaintInventoryProps) {
  const [inventory, setInventory] = useState<PaintInventoryType>(
    color.inventory || { sheens: {} }
  )

  const updateCanQuantity = (
    sheen: keyof PaintInventoryType['sheens'],
    size: PaintCan['size'],
    delta: number
  ) => {
    const newInventory = { ...inventory }
    if (!newInventory.sheens[sheen]) {
      newInventory.sheens[sheen] = []
    }

    const existingCan = newInventory.sheens[sheen]!.find(can => can.size === size)

    if (existingCan) {
      existingCan.quantity = Math.max(0, existingCan.quantity + delta)
      if (existingCan.quantity === 0) {
        newInventory.sheens[sheen] = newInventory.sheens[sheen]!.filter(can => can.size !== size)
      }
    } else if (delta > 0) {
      newInventory.sheens[sheen]!.push({ size, quantity: delta })
    }

    setInventory(newInventory)
    onUpdateInventory(color.id, newInventory)
  }

  const getCanQuantity = (sheen: keyof PaintInventoryType['sheens'], size: PaintCan['size']): number => {
    const sheenCans = inventory.sheens[sheen]
    if (!sheenCans) return 0
    const can = sheenCans.find(c => c.size === size)
    return can?.quantity || 0
  }

  const getTotalCans = (): number => {
    let total = 0
    Object.values(inventory.sheens).forEach(cans => {
      if (cans) {
        cans.forEach(can => {
          total += can.quantity
        })
      }
    })
    return total
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paint Inventory</h2>
            <div className="flex items-center gap-3 mt-2">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <p className="font-semibold">{color.name}</p>
                <p className="text-sm text-gray-600">{color.brand} • {color.code}</p>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Inventory Grid */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Stock by Sheen & Size</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Total: {getTotalCans()} cans</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">Sheen</th>
                  {SIZES.map(size => (
                    <th key={size.key} className="text-center p-3 font-medium text-gray-700 min-w-[100px]">
                      {size.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHEENS.map(sheen => (
                  <tr key={sheen.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{sheen.label}</td>
                    {SIZES.map(size => {
                      const quantity = getCanQuantity(sheen.key as keyof PaintInventoryType['sheens'], size.key as PaintCan['size'])
                      return (
                        <td key={size.key} className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => updateCanQuantity(
                                sheen.key as keyof PaintInventoryType['sheens'],
                                size.key as PaintCan['size'],
                                -1
                              )}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              disabled={quantity === 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className={`w-8 text-center font-medium ${
                              quantity > 0 ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateCanQuantity(
                                sheen.key as keyof PaintInventoryType['sheens'],
                                size.key as PaintCan['size'],
                                1
                              )}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Inventory Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {Object.entries(inventory.sheens).map(([sheen, cans]) => {
                if (!cans || cans.length === 0) return null
                const total = cans.reduce((sum, can) => sum + can.quantity, 0)
                const sheenLabel = SHEENS.find(s => s.key === sheen)?.label || sheen
                return (
                  <div key={sheen} className="bg-white p-2 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">{sheenLabel}</div>
                    <div className="text-gray-600">{total} cans</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Print Label Button */}
          {onPrintLabel && (
            <div className="mt-4">
              <button
                onClick={onPrintLabel}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Printer className="w-5 h-5" />
                Print Label
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}