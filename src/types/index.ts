export interface Color {
  id: string
  name: string
  brand: string
  hex: string
  rgb: [number, number, number]
  code?: string // Brand-specific code
  addedAt?: Date
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
  fontSize: 'small' | 'medium' | 'large'
  dimensions: {
    width: number
    height: number
  }
  backgroundColor: 'color' | 'white' | 'black'
  textColor: 'auto' | 'black' | 'white'
}

export interface SearchResult {
  colors: Color[]
  totalResults: number
  searchTerm: string
}