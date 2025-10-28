import { Color, LabelConfig } from '@/types'
import { getContrastColor } from '@/utils/colors'

interface LabelPreviewProps {
  color: Color
  config: LabelConfig
  className?: string
}

export default function LabelPreview({ color, config, className = '' }: LabelPreviewProps) {
  // Use custom name if available, otherwise use original name
  const displayName = color.customName || color.name

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

  // Typography styles as inline styles for html2canvas
  const fontFamily = {
    sans: 'system-ui, -apple-system, sans-serif',
    serif: 'Georgia, serif',
    mono: 'ui-monospace, monospace'
  }[config.typography.fontFamily]

  const fontWeight = {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }[config.typography.fontWeight]

  const textAlign = config.typography.alignment

  const lineHeight = {
    tight: '1.25',
    normal: '1.5',
    loose: '1.75'
  }[config.typography.lineHeight]

  const dimensions = {
    width: config.dimensions.width * 96, // Convert inches to pixels (96 DPI)
    height: config.dimensions.height * 96
  }

  const shape = config.shape || 'rectangle'
  const borderRadius = shape === 'circle'
    ? '50%'
    : shape === 'rounded'
      ? `${config.borderRadius || 16}px`
      : '0'

  return (
    <div
      className={`shadow-lg overflow-hidden ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: bgColor,
        color: textColor,
        borderRadius
      }}
    >
      {config.layout === 'default' && (
        <div
          className="p-6 h-full flex flex-col justify-center items-center"
          style={{ fontFamily, lineHeight }}
        >
          <div
            style={{
              fontSize: `${config.typography.nameSize}px`,
              fontWeight,
              textAlign,
              marginBottom: '8px'
            }}
          >
            {displayName}
          </div>
          {config.showBrand && (
            <div
              style={{
                fontSize: `${config.typography.brandSize}px`,
                opacity: 0.9,
                fontFamily,
                textAlign
              }}
            >
              {color.brand}
            </div>
          )}
          {config.showSheen && color.sheen && (
            <div
              style={{
                fontSize: `${config.typography.detailsSize}px`,
                opacity: 0.75,
                marginTop: '4px',
                fontFamily,
                textAlign
              }}
            >
              {color.sheen === 'semiGloss' ? 'Semi-Gloss' : color.sheen.charAt(0).toUpperCase() + color.sheen.slice(1)}
            </div>
          )}
          {config.showCode && color.code && (
            <div
              style={{
                fontSize: `${config.typography.codeSize}px`,
                opacity: 0.75,
                marginTop: '4px',
                fontFamily,
                textAlign
              }}
            >
              {color.code}
            </div>
          )}
          {config.showHex && (
            <div
              style={{
                fontSize: `${config.typography.detailsSize}px`,
                opacity: 0.75,
                marginTop: '4px',
                fontFamily: 'ui-monospace, monospace',
                textAlign
              }}
            >
              {color.hex.toUpperCase()}
            </div>
          )}
          {config.showRgb && (
            <div
              style={{
                fontSize: `${config.typography.detailsSize}px`,
                opacity: 0.75,
                marginTop: '4px',
                fontFamily: 'ui-monospace, monospace',
                textAlign
              }}
            >
              RGB({color.rgb.join(', ')})
            </div>
          )}
        </div>
      )}

      {config.layout === 'minimal' && (
        <div
          className="p-4 h-full flex flex-col justify-center items-center"
          style={{ fontFamily, lineHeight }}
        >
          <div
            style={{
              fontSize: `${config.typography.nameSize}px`,
              fontWeight,
              textAlign
            }}
          >
            {displayName}
          </div>
          {config.showBrand && (
            <div
              style={{
                fontSize: `${config.typography.brandSize}px`,
                opacity: 0.9,
                marginTop: '4px',
                fontFamily,
                textAlign
              }}
            >
              {color.brand}
            </div>
          )}
          {config.showSheen && color.sheen && (
            <div
              style={{
                fontSize: `${config.typography.detailsSize}px`,
                opacity: 0.75,
                marginTop: '4px',
                fontFamily,
                textAlign
              }}
            >
              {color.sheen === 'semiGloss' ? 'Semi-Gloss' : color.sheen.charAt(0).toUpperCase() + color.sheen.slice(1)}
            </div>
          )}
          {config.showCode && color.code && (
            <div
              style={{
                fontSize: `${config.typography.codeSize}px`,
                opacity: 0.75,
                marginTop: '4px',
                fontFamily,
                textAlign
              }}
            >
              {color.code}
            </div>
          )}
        </div>
      )}

      {config.layout === 'detailed' && (
        <div
          className="p-6 h-full"
          style={{ fontFamily, lineHeight }}
        >
          <div className="h-full flex flex-col justify-between">
            <div style={{ textAlign }}>
              <div
                style={{
                  fontSize: `${config.typography.nameSize}px`,
                  fontWeight,
                  fontFamily
                }}
              >
                {displayName}
              </div>
              {config.showBrand && (
                <div
                  style={{
                    fontSize: `${config.typography.brandSize}px`,
                    opacity: 0.9,
                    marginTop: '4px',
                    fontFamily
                  }}
                >
                  {color.brand}
                </div>
              )}
              {config.showSheen && color.sheen && (
                <div
                  style={{
                    fontSize: `${config.typography.detailsSize}px`,
                    opacity: 0.75,
                    marginTop: '4px',
                    fontFamily
                  }}
                >
                  Sheen: {color.sheen === 'semiGloss' ? 'Semi-Gloss' : color.sheen.charAt(0).toUpperCase() + color.sheen.slice(1)}
                </div>
              )}
            </div>
            <div style={{ textAlign }}>
              {config.showCode && color.code && (
                <div
                  style={{
                    fontSize: `${config.typography.codeSize}px`,
                    opacity: 0.75,
                    fontFamily
                  }}
                >
                  Code: {color.code}
                </div>
              )}
              {config.showHex && (
                <div
                  style={{
                    fontSize: `${config.typography.detailsSize}px`,
                    opacity: 0.75,
                    marginTop: '4px',
                    fontFamily
                  }}
                >
                  HEX: {color.hex.toUpperCase()}
                </div>
              )}
              {config.showRgb && (
                <div
                  style={{
                    fontSize: `${config.typography.detailsSize}px`,
                    opacity: 0.75,
                    marginTop: '4px',
                    fontFamily: 'ui-monospace, monospace'
                  }}
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