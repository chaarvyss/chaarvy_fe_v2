export const PAGE_SIZES = {
  A4: { width: 794, height: 1123, label: 'A4 (210 × 297 mm)' },
  A5: { width: 559, height: 794, label: 'A5 (148 × 210 mm)' },
  Letter: { width: 816, height: 1056, label: 'Letter (8.5 × 11 in)' },
  Legal: { width: 816, height: 1344, label: 'Legal (8.5 × 14 in)' },
  A3: { width: 1123, height: 1587, label: 'A3 (297 × 420 mm)' },
  Tabloid: { width: 1056, height: 1632, label: 'Tabloid (11 × 17 in)' }
}

export const ALIGNMENT_THRESHOLD = 5
export const SNAP_THRESHOLD = 3
export const RESIZE_HANDLE_SIZE = 8
export const DELETE_BUTTON_SIZE = 16
export const MIN_SIZE = 20
export const GRID_SIZE = 20

export const DEFAULT_SIZES = {
  rectangle: { width: 120, height: 60 },
  circle: { width: 80, height: 80 },
  line: { width: 100, height: 1 },
  image: { width: 100, height: 100 },
  dynamic_table: { width: 600, height: 200 },
  fontSize: 12
}

export const FONT_FAMILIES = [
  'Arial',
  'Arial Black',
  'Brush Script MT',
  'Comic Sans MS',
  'Courier New',
  'Garamond',
  'Georgia',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Palatino Linotype',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded'
]

export const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
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

export const DEFAULT_AVAILABLE_ITEMS: Field[] = [
  { key: 'studentName', label: 'Student Name', type: 'field' },
  { key: 'fatherName', label: 'Father Name', type: 'field' },
  { key: 'admission_number', label: 'Admission Number', type: 'field' },
  { key: 'collegeName', label: 'College Name', type: 'field' },
  { key: 'campus_name', label: 'Campus Name', type: 'field' },
  { key: 'gender', label: 'Gender', type: 'field' },
  { key: 'group', label: 'Group', type: 'field' },
  { key: 'segment', label: 'Segment', type: 'field' },
  { key: 'medium', label: 'Medium', type: 'field' },
  { key: 'section', label: 'Section', type: 'field' },
  { key: 'dob', label: 'Date of Birth', type: 'field' },
  { key: 'admissionDate', label: 'Admission Date', type: 'field' },
  { key: 'receipt_number', label: 'Receipt Number', type: 'field' },
  { key: 'transaction_id', label: 'Transaction ID', type: 'field' },
  { key: 'date_of_payment', label: 'Date of Payment', type: 'field' },
  { key: 'prepared_by', label: 'Prepared By', type: 'field' },
  { key: 'printed_on', label: 'Printed On', type: 'field' },
  { key: 'text', label: 'Text Label', type: 'shape' },
  { key: 'rectangle', label: 'Rectangle', type: 'shape' },
  { key: 'circle', label: 'Circle', type: 'shape' },
  { key: 'line', label: 'Line', type: 'shape' },
  { key: 'dynamic_table', label: 'Dynamic Table Area', type: 'shape' },
  { key: 'logo', label: 'Logo/Image', type: 'image' }
]
