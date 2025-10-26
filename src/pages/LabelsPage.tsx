import { Download, Eye, Plus, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { useLabelStore } from '@/stores/useLabelStore'
import { useColorStore } from '@/stores/useColorStore'
import { useNavigate } from 'react-router-dom'
import LabelPreview from '@/components/LabelPreview'

export default function LabelsPage() {
  const navigate = useNavigate()
  const previewRef = useRef<HTMLDivElement>(null)
  const { config, previewColors, updateConfig, exportLabels } = useLabelStore()
  const { loadLibraryFromStorage } = useColorStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

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

  const updateTypography = (key: string, value: any) => {
    updateConfig({
      typography: {
        ...config.typography,
        [key]: value
      }
    })
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
        <div className="space-y-4">
          {/* Basic Settings */}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width (inches)
                  </label>
                  <input
                    type="number"
                    value={config.dimensions.width}
                    onChange={(e) => updateConfig({
                      dimensions: {
                        ...config.dimensions,
                        width: parseFloat(e.target.value) || 3
                      }
                    })}
                    min="1"
                    max="8"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={config.dimensions.height}
                    onChange={(e) => updateConfig({
                      dimensions: {
                        ...config.dimensions,
                        height: parseFloat(e.target.value) || 2
                      }
                    })}
                    min="1"
                    max="8"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
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
                      checked={config.showHex}
                      onChange={(e) => updateConfig({ showHex: e.target.checked })}
                      className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Show HEX Value</span>
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

          {/* Typography Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Typography
              </h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>

            <div className="space-y-4">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={config.typography.fontFamily}
                  onChange={(e) => updateTypography('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="sans">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Weight
                </label>
                <select
                  value={config.typography.fontWeight}
                  onChange={(e) => updateTypography('fontWeight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="light">Light</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTypography('alignment', 'left')}
                    className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                      config.typography.alignment === 'left'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => updateTypography('alignment', 'center')}
                    className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                      config.typography.alignment === 'center'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <AlignCenter className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => updateTypography('alignment', 'right')}
                    className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
                      config.typography.alignment === 'right'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <AlignRight className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Advanced Typography Controls */}
              {showAdvanced && (
                <>
                  {/* Line Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line Height
                    </label>
                    <select
                      value={config.typography.lineHeight}
                      onChange={(e) => updateTypography('lineHeight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="tight">Tight</option>
                      <option value="normal">Normal</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>

                  {/* Individual Size Controls */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name Size: {config.typography.nameSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="48"
                        value={config.typography.nameSize}
                        onChange={(e) => updateTypography('nameSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Size: {config.typography.brandSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="24"
                        value={config.typography.brandSize}
                        onChange={(e) => updateTypography('brandSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code Size: {config.typography.codeSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="20"
                        value={config.typography.codeSize}
                        onChange={(e) => updateTypography('codeSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Details Size: {config.typography.detailsSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="18"
                        value={config.typography.detailsSize}
                        onChange={(e) => updateTypography('detailsSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
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

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] flex items-center justify-center overflow-auto">
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