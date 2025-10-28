import { Download, Eye, Plus, Type, AlignLeft, AlignCenter, AlignRight, X } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { useLabelStore } from '@/stores/useLabelStore'
import { useColorStore } from '@/stores/useColorStore'
import { useNavigate } from 'react-router-dom'
import LabelPreview from '@/components/LabelPreview'
import { LABEL_TEMPLATES } from '@/utils/labelTemplates'

const SHEENS = [
  { value: 'flat', label: 'Flat' },
  { value: 'matte', label: 'Matte' },
  { value: 'eggshell', label: 'Eggshell' },
  { value: 'satin', label: 'Satin' },
  { value: 'semiGloss', label: 'Semi-Gloss' },
  { value: 'gloss', label: 'Gloss' }
] as const

export default function LabelsPage() {
  const navigate = useNavigate()
  const previewRef = useRef<HTMLDivElement>(null)
  const { config, previewColors, updateConfig, updateColorSheen, removePreviewColor, exportLabels } = useLabelStore()
  const { loadLibraryFromStorage } = useColorStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    loadLibraryFromStorage()
  }, [loadLibraryFromStorage])

  const handleExport = async () => {
    if (previewRef.current && previewColors.length > 0) {
      // Use PDF for one-per-page mode, PNG for others
      const format = config.exportLayout?.mode === 'one-per-page' ? 'pdf' : 'png'
      await exportLabels(format, previewRef.current)
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Label Designer
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Create printable labels for your paint colors
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={previewColors.length === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Label Settings */}
        <div className="space-y-3 sm:space-y-4">
          {/* Basic Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Label Settings</h2>

            <div className="space-y-4">
              {/* Layout Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Layout Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateConfig({ layout: 'default' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.layout === 'default'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Default</div>
                  </button>
                  <button
                    onClick={() => updateConfig({ layout: 'minimal' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.layout === 'minimal'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Minimal</div>
                  </button>
                  <button
                    onClick={() => updateConfig({ layout: 'detailed' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.layout === 'detailed'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Detailed</div>
                  </button>
                </div>
              </div>

              {/* Size Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Display Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Brand Name</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.showCode}
                      onChange={(e) => updateConfig({ showCode: e.target.checked })}
                      className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Color Code</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.showHex}
                      onChange={(e) => updateConfig({ showHex: e.target.checked })}
                      className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show HEX Value</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.showRgb}
                      onChange={(e) => updateConfig({ showRgb: e.target.checked })}
                      className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show RGB Values</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.showSheen}
                      onChange={(e) => updateConfig({ showSheen: e.target.checked })}
                      className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Sheen/Finish</span>
                  </label>
                </div>
              </div>

              {/* Label Shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label Shape
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateConfig({ shape: 'rectangle', borderRadius: 0 })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.shape === 'rectangle'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Rectangle</div>
                  </button>
                  <button
                    onClick={() => updateConfig({ shape: 'rounded', borderRadius: 16 })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.shape === 'rounded'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Rounded</div>
                  </button>
                  <button
                    onClick={() => updateConfig({ shape: 'circle' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.shape === 'circle'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Circle</div>
                  </button>
                </div>
              </div>

              {/* Export Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Mode
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => updateConfig({ exportLayout: { ...config.exportLayout, mode: 'individual' } })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.exportLayout?.mode === 'individual'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Separate Files</div>
                  </button>
                  <button
                    onClick={() => updateConfig({ exportLayout: { ...config.exportLayout, mode: 'one-per-page' } })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.exportLayout?.mode === 'one-per-page'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">One Per Page</div>
                  </button>
                  <button
                    onClick={() => updateConfig({ exportLayout: { ...config.exportLayout, mode: 'sheet' } })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.exportLayout?.mode === 'sheet'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium dark:text-gray-300">Label Sheet</div>
                  </button>
                </div>

                {config.exportLayout?.mode === 'one-per-page' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Page Size
                    </label>
                    <select
                      value={config.exportLayout?.pageSize || 'letter'}
                      onChange={(e) => updateConfig({
                        exportLayout: {
                          ...config.exportLayout,
                          mode: 'one-per-page',
                          pageSize: e.target.value as any
                        }
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="letter">Letter (8.5" × 11")</option>
                      <option value="a4">A4 (210mm × 297mm)</option>
                      <option value="legal">Legal (8.5" × 14")</option>
                      <option value="custom">Custom Size</option>
                    </select>

                    {config.exportLayout?.pageSize === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Width (inches)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={config.exportLayout?.customPageWidth || 8.5}
                            onChange={(e) => updateConfig({
                              exportLayout: {
                                ...config.exportLayout,
                                mode: 'one-per-page',
                                pageSize: 'custom',
                                customPageWidth: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Height (inches)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={config.exportLayout?.customPageHeight || 11}
                            onChange={(e) => updateConfig({
                              exportLayout: {
                                ...config.exportLayout,
                                mode: 'one-per-page',
                                pageSize: 'custom',
                                customPageHeight: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {config.exportLayout?.mode === 'sheet' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Sheet Template
                    </label>
                    <select
                      value={config.exportLayout?.sheetTemplate || 'avery-5163'}
                      onChange={(e) => updateConfig({
                        exportLayout: {
                          ...config.exportLayout,
                          mode: 'sheet',
                          sheetTemplate: e.target.value as any
                        }
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {Object.entries(LABEL_TEMPLATES).map(([key, template]) => (
                        <option key={key} value={key}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Typography Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Type className="w-4 h-4 sm:w-5 sm:h-5" />
                Typography
              </h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
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
                        Name Size
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="12"
                          max="48"
                          value={config.typography.nameSize}
                          onChange={(e) => updateTypography('nameSize', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={config.typography.nameSize}
                          onChange={(e) => updateTypography('nameSize', parseInt(e.target.value) || 24)}
                          min="1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600">px</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Size
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="8"
                          max="24"
                          value={config.typography.brandSize}
                          onChange={(e) => updateTypography('brandSize', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={config.typography.brandSize}
                          onChange={(e) => updateTypography('brandSize', parseInt(e.target.value) || 14)}
                          min="1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600">px</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code Size
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="8"
                          max="20"
                          value={config.typography.codeSize}
                          onChange={(e) => updateTypography('codeSize', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={config.typography.codeSize}
                          onChange={(e) => updateTypography('codeSize', parseInt(e.target.value) || 12)}
                          min="1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600">px</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Details Size
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="range"
                          min="8"
                          max="18"
                          value={config.typography.detailsSize}
                          onChange={(e) => updateTypography('detailsSize', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          value={config.typography.detailsSize}
                          onChange={(e) => updateTypography('detailsSize', parseInt(e.target.value) || 11)}
                          min="1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600">px</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sheen Selection */}
          {config.showSheen && previewColors.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Sheen/Finish Selection</h2>
              <div className="space-y-4">
                {previewColors.map((color) => (
                  <div key={color.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div
                      className="w-10 h-10 rounded border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {color.customName || color.name}
                      </div>
                      <div className="text-xs text-gray-600">{color.brand}</div>
                    </div>
                    <select
                      value={color.sheen || ''}
                      onChange={(e) => updateColorSheen(color.id, e.target.value as any || undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="">None</option>
                      {SHEENS.map(sheen => (
                        <option key={sheen.value} value={sheen.value}>
                          {sheen.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Label Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Preview</h2>
            <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Full Preview</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-8 min-h-[300px] sm:min-h-[400px] flex items-center justify-center overflow-auto">
            {previewColors.length > 0 ? (
              <div ref={previewRef} className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                {previewColors.map((color) => (
                  <div
                    key={color.id}
                    tabIndex={0}
                    className="relative group focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2 rounded-lg transition-all"
                  >
                    <button
                      onClick={() => removePreviewColor(color.id)}
                      className="absolute -top-2 -right-2 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove label"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <LabelPreview
                      color={color}
                      config={config}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="mb-2 text-sm sm:text-base">No colors selected</p>
                <p className="text-xs sm:text-sm">Select colors from your library to create labels</p>
                <button
                  onClick={handleSelectColors}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
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