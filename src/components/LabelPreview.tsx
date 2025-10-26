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
    : config.textColor === 'custom' && config.customTextColor
      ? config.customTextColor
      : config.textColor

  const bgColor = config.backgroundColor === 'color'
    ? color.hex
    : config.backgroundColor === 'custom' && config.customBackgroundColor
      ? config.customBackgroundColor
      : config.backgroundColor === 'white'
        ? '#ffffff'
        : '#000000'

  // Typography styles
  const fontFamily = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  }[config.typography.fontFamily]

  const fontWeight = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }[config.typography.fontWeight]

  const textAlign = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[config.typography.alignment]

  const lineHeight = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    loose: 'leading-loose'
  }[config.typography.lineHeight]

  const dimensions = {
    width: config.dimensions.width * 96, // Convert inches to pixels (96 DPI)
    height: config.dimensions.height * 96
  }

  return (
    <div
      className={`shadow-lg overflow-hidden ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {config.layout === 'default' && (
        <div className={`p-6 h-full flex flex-col justify-center items-center ${fontFamily} ${lineHeight}`}>
          <div
            className={`${fontWeight} mb-2 ${textAlign}`}
            style={{ fontSize: `${config.typography.nameSize}px` }}
          >
            {color.name}
          </div>
          {config.showBrand && (
            <div
              className="opacity-90"
              style={{ fontSize: `${config.typography.brandSize}px` }}
            >
              {color.brand}
            </div>
          )}
          {config.showCode && color.code && (
            <div
              className="opacity-75 mt-1"
              style={{ fontSize: `${config.typography.codeSize}px` }}
            >
              {color.code}
            </div>
          )}
          {config.showHex && (
            <div
              className="opacity-75 mt-1 font-mono"
              style={{ fontSize: `${config.typography.detailsSize}px` }}
            >
              {color.hex.toUpperCase()}
            </div>
          )}
          {config.showRgb && (
            <div
              className="opacity-75 mt-1 font-mono"
              style={{ fontSize: `${config.typography.detailsSize}px` }}
            >
              RGB({color.rgb.join(', ')})
            </div>
          )}
        </div>
      )}

      {config.layout === 'minimal' && (
        <div className={`p-4 h-full flex flex-col justify-center items-center ${fontFamily} ${lineHeight}`}>
          <div
            className={`${fontWeight} ${textAlign}`}
            style={{ fontSize: `${config.typography.nameSize}px` }}
          >
            {color.name}
          </div>
          {config.showCode && color.code && (
            <div
              className="opacity-75 mt-1"
              style={{ fontSize: `${config.typography.codeSize}px` }}
            >
              {color.code}
            </div>
          )}
        </div>
      )}

      {config.layout === 'detailed' && (
        <div className={`p-6 h-full ${fontFamily} ${lineHeight}`}>
          <div className="h-full flex flex-col justify-between">
            <div className={textAlign}>
              <div
                className={fontWeight}
                style={{ fontSize: `${config.typography.nameSize}px` }}
              >
                {color.name}
              </div>
              {config.showBrand && (
                <div
                  className="opacity-90 mt-1"
                  style={{ fontSize: `${config.typography.brandSize}px` }}
                >
                  {color.brand}
                </div>
              )}
            </div>
            <div className={textAlign}>
              {config.showCode && color.code && (
                <div
                  className="opacity-75"
                  style={{ fontSize: `${config.typography.codeSize}px` }}
                >
                  Code: {color.code}
                </div>
              )}
              {config.showHex && (
                <div
                  className="opacity-75 mt-1"
                  style={{ fontSize: `${config.typography.detailsSize}px` }}
                >
                  HEX: {color.hex.toUpperCase()}
                </div>
              )}
              {config.showRgb && (
                <div
                  className="opacity-75 mt-1 font-mono"
                  style={{ fontSize: `${config.typography.detailsSize}px` }}
                >
                  RGB: {color.rgb.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}