export interface Color {
  id: string
  name: string
  brand: string
  hex: string
  rgb: [number, number, number]
  code?: string // Brand-specific code
  customName?: string // User's custom name for the color
  sheen?: 'flat' | 'matte' | 'eggshell' | 'satin' | 'semiGloss' | 'gloss' // Paint sheen/finish
  addedAt?: Date
  inventory?: PaintInventory
}

export interface PaintInventory {
  sheens: {
    flat?: PaintCan[]
    matte?: PaintCan[]
    eggshell?: PaintCan[]
    satin?: PaintCan[]
    semiGloss?: PaintCan[]
    gloss?: PaintCan[]
  }
}

export interface PaintCan {
  size: 'sample' | 'quart' | 'gallon' | '5-gallon'
  quantity: number
  notes?: string
}

export interface Palette {
  id: string
  name: string
  colors: Color[]
  createdAt: Date
  updatedAt: Date
}

export interface LabelConfig {
  layout: 'default' | 'minimal' | 'detailed' | 'custom'
  showBrand: boolean
  showCode: boolean
  showRgb: boolean
  showHex: boolean
  showSheen: boolean
  dimensions: {
    width: number
    height: number
  }
  backgroundColor: 'color' | 'white' | 'black' | 'custom'
  customBackgroundColor?: string
  textColor: 'auto' | 'black' | 'white' | 'custom'
  customTextColor?: string
  typography: {
    nameSize: number // in pixels
    brandSize: number
    codeSize: number
    detailsSize: number
    fontFamily: 'sans' | 'serif' | 'mono'
    fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
    alignment: 'left' | 'center' | 'right'
    lineHeight: 'tight' | 'normal' | 'loose'
  }
  exportLayout?: {
    mode: 'individual' | 'sheet' | 'one-per-page'
    sheetTemplate?: 'avery-5160' | 'avery-5163' | 'avery-5164' | 'avery-5167' | 'avery-5261' | 'avery-22806' | 'label-outfitter-4' | 'custom'
    customColumns?: number
    customRows?: number
    customSpacing?: number // in pixels
    pageSize?: 'letter' | 'a4' | 'legal' | 'custom'
    customPageWidth?: number // in inches
    customPageHeight?: number // in inches
  }
  shape?: 'rectangle' | 'rounded' | 'circle'
  borderRadius?: number // pixels for rounded corners
}

export interface SearchResult {
  colors: Color[]
  totalResults: number
  searchTerm: string
}