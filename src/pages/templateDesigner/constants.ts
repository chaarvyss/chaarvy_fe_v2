// Constants for the template designer

import { Field } from './types'

export const AVAILABLE_ITEMS: Field[] = [
  { key: 'text', type: 'shape', label: 'Text' },
  { key: 'rectangle', type: 'shape', label: 'Rectangle' },
  { key: 'circle', type: 'shape', label: 'Circle' },
  { key: 'line', type: 'shape', label: 'Line' },
  { key: 'image', type: 'image', label: 'Image' }
]

export const DEFAULT_SIZES = {
  fontSize: 16,
  rectangle: { width: 120, height: 60, borderWidth: 2 },
  circle: { width: 80, height: 80, borderWidth: 2 },
  line: { width: 200, height: 2, borderWidth: 2 },
  image: { width: 120, height: 80 }
}

export const PAGE_SIZES = {
  A4: { label: 'A4 (210 × 297 mm)', width: 794, height: 1123 },
  Letter: { label: 'Letter (8.5 × 11 in)', width: 816, height: 1056 }
}

export const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Roboto',
  'Georgia',
  'Tahoma',
  'Trebuchet MS'
]

export const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: 'bolder', label: 'Bolder' },
  { value: 'lighter', label: 'Lighter' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
  { value: '900', label: '900' }
]

export const ALIGNMENT_THRESHOLD = 8
export const SNAP_THRESHOLD = 4
export const MIN_SIZE = 20
export const RESIZE_HANDLE_SIZE = 10
export const DELETE_BUTTON_SIZE = 18
