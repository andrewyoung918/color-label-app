import { Download, Settings, Eye, Plus } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { useLabelStore } from '@/stores/useLabelStore'
import { useColorStore } from '@/stores/useColorStore'
import { useNavigate } from 'react-router-dom'
import LabelPreview from '@/components/LabelPreview'

export default function LabelsPage() {
  const navigate = useNavigate()
  const previewRef = useRef<HTMLDivElement>(null)
  const { config, previewColors, updateConfig, exportLabels } = useLabelStore()
  const { loadLibraryFromStorage } = useColorStore()

  useEffect(() => {
    loadLibraryFromStorage()
  }, [loadLibraryFromStorage])

  const handleExport = async () => {
    if (previewRef.current && previewColors.length > 0) {
      await exportLabels('png', previewRef.current)
    }
  }

  const handleSelectColors = () => {
    navigate('/library')
  }

  return (
    <div className="space-y-6">
      {/* Labels Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Label Designer
            </h1>
            <p className="text-gray-600">
              Create printable labels for your paint colors
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={previewColors.length === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Label Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Label Settings</h2>

          <div className="space-y-4">
            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateConfig({ layout: 'default' })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    config.layout === 'default'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-medium">Default</div>
                </button>
                <button
                  onClick={() => updateConfig({ layout: 'minimal' })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    config.layout === 'minimal'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-medium">Minimal</div>
                </button>
                <button
                  onClick={() => updateConfig({ layout: 'detailed' })}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    config.layout === 'detailed'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-medium">Detailed</div>
                </button>
              </div>
            </div>

            {/* Size Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label Size
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>2" x 3"</option>
                <option>3" x 4"</option>
                <option>4" x 6"</option>
                <option>Custom</option>
              </select>
            </div>

            {/* Display Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.showBrand}
                    onChange={(e) => updateConfig({ showBrand: e.target.checked })}
                    className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Show Brand Name</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.showCode}
                    onChange={(e) => updateConfig({ showCode: e.target.checked })}
                    className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Show Color Code</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.showRgb}
                    onChange={(e) => updateConfig({ showRgb: e.target.checked })}
                    className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Show RGB Values</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Label Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
            <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Full Preview</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            {previewColors.length > 0 ? (
              <div ref={previewRef} className="flex flex-wrap gap-4 justify-center">
                {previewColors.map((color) => (
                  <LabelPreview
                    key={color.id}
                    color={color}
                    config={config}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="mb-2">No colors selected</p>
                <p className="text-sm">Select colors from your library to create labels</p>
                <button
                  onClick={handleSelectColors}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Select Colors
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}