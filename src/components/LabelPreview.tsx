import { Color, LabelConfig } from '@/types'
import { getContrastColor } from '@/utils/colors'

interface LabelPreviewProps {
  color: Color
  config: LabelConfig
  className?: string
}

export default function LabelPreview({ color, config, className = '' }: LabelPreviewProps) {
  const textColor = config.textColor === 'auto'
    ? getContrastColor(color.hex)
    : config.textColor

  const bgColor = config.backgroundColor === 'color'
    ? color.hex
    : config.backgroundColor === 'white'
      ? '#ffffff'
      : '#000000'

  const fontSize = {
    small: { name: 'text-lg', details: 'text-xs' },
    medium: { name: 'text-2xl', details: 'text-sm' },
    large: { name: 'text-3xl', details: 'text-base' }
  }[config.fontSize]

  const dimensions = {
    width: config.dimensions.width * 96, // Convert inches to pixels (96 DPI)
    height: config.dimensions.height * 96
  }

  return (
    <div
      className={`rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {config.layout === 'default' && (
        <div className="p-6 h-full flex flex-col justify-center items-center text-center">
          <div className={`font-bold ${fontSize.name} mb-2`}>
            {color.name}
          </div>
          {config.showBrand && (
            <div className={`${fontSize.details} opacity-90`}>
              {color.brand}
            </div>
          )}
          {config.showCode && color.code && (
            <div className={`${fontSize.details} opacity-75 mt-1`}>
              {color.code}
            </div>
          )}
          {config.showRgb && (
            <div className={`${fontSize.details} opacity-75 mt-1 font-mono`}>
              RGB({color.rgb.join(', ')})
            </div>
          )}
        </div>
      )}

      {config.layout === 'minimal' && (
        <div className="p-4 h-full flex flex-col justify-center items-center">
          <div className={`font-bold ${fontSize.name}`}>
            {color.name}
          </div>
          {config.showCode && color.code && (
            <div className={`${fontSize.details} opacity-75 mt-1`}>
              {color.code}
            </div>
          )}
        </div>
      )}

      {config.layout === 'detailed' && (
        <div className="p-6 h-full">
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className={`font-bold ${fontSize.name}`}>
                {color.name}
              </div>
              {config.showBrand && (
                <div className={`${fontSize.details} opacity-90 mt-1`}>
                  {color.brand}
                </div>
              )}
            </div>
            <div>
              {config.showCode && color.code && (
                <div className={`${fontSize.details} opacity-75`}>
                  Code: {color.code}
                </div>
              )}
              {config.showRgb && (
                <div className={`${fontSize.details} opacity-75 mt-1 font-mono`}>
                  RGB: {color.rgb.join(', ')}
                </div>
              )}
              <div className={`${fontSize.details} opacity-75 mt-1`}>
                HEX: {color.hex}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}