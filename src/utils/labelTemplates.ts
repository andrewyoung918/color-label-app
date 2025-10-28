export interface LabelSheetTemplate {
  name: string
  description: string
  columns: number
  rows: number
  labelWidth: number  // in inches
  labelHeight: number // in inches
  spacing: number     // in pixels at 96 DPI
  isRound?: boolean
}

export const LABEL_TEMPLATES: Record<string, LabelSheetTemplate> = {
  'avery-5160': {
    name: 'Avery 5160',
    description: '1" × 2⅝" Address Labels',
    columns: 3,
    rows: 10,
    labelWidth: 2.625,
    labelHeight: 1,
    spacing: 12
  },
  'avery-5163': {
    name: 'Avery 5163',
    description: '2" × 4" Shipping Labels',
    columns: 2,
    rows: 5,
    labelWidth: 4,
    labelHeight: 2,
    spacing: 12
  },
  'avery-5164': {
    name: 'Avery 5164',
    description: '3⅓" × 4" Shipping Labels',
    columns: 2,
    rows: 3,
    labelWidth: 4,
    labelHeight: 3.33,
    spacing: 12
  },
  'avery-5167': {
    name: 'Avery 5167',
    description: '½" × 1¾" Return Address',
    columns: 4,
    rows: 20,
    labelWidth: 1.75,
    labelHeight: 0.5,
    spacing: 8
  },
  'avery-5261': {
    name: 'Avery 5261',
    description: '4" × 2" Easy Peel Labels',
    columns: 2,
    rows: 5,
    labelWidth: 4,
    labelHeight: 2,
    spacing: 12
  },
  'avery-22806': {
    name: 'Avery 22806',
    description: '2½" Round Labels',
    columns: 3,
    rows: 2,
    labelWidth: 2.5,
    labelHeight: 2.5,
    spacing: 24,
    isRound: true
  },
  'custom': {
    name: 'Custom',
    description: 'Custom dimensions',
    columns: 2,
    rows: 5,
    labelWidth: 4,
    labelHeight: 2,
    spacing: 24
  }
}

export function getTemplate(templateId: string): LabelSheetTemplate {
  return LABEL_TEMPLATES[templateId] || LABEL_TEMPLATES['custom']
}
