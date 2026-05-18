const colorPalette = [
  'linear-gradient(to bottom, #E8FFE8 0%, #D6F5D6 70%, #C2ECC2 100%)',
  'linear-gradient(to bottom, #EDF7FF 0%, #D6EAF8 70%, #C5DEF2 100%)',
  'linear-gradient(to bottom, #FFFBE0 0%, #FFF2CC 70%, #F3E5AF 100%)',
  'linear-gradient(to bottom, #FAECFF 0%, #F4D6FF 70%, #E8C0F5 100%)',
  'linear-gradient(to bottom, #FFEAF2 0%, #FFD6E7 70%, #F5BDD4 100%)',
  'linear-gradient(to bottom, #EBFFFD 0%, #D6F7F5 70%, #BDEDEB 100%)',
  'linear-gradient(to bottom, #FFF1E6 0%, #FFE6CC 70%, #F7D7B4 100%)',
  'linear-gradient(to bottom, #F4FFE6 0%, #E6F9CC 70%, #D7EDB5 100%)',
  'linear-gradient(to bottom, #F3EDFF 0%, #E6D6FF 70%, #D6C0F2 100%)',
  'linear-gradient(to bottom, #FFFFE0 0%, #FFF9B8 70%, #F5EEA4 100%)',
  'linear-gradient(to bottom, #FFF0E8 0%, #FFDCCF 70%, #F3C8B8 100%)',
  'linear-gradient(to bottom, #ECFFF5 0%, #D9F2E6 70%, #C5E8D7 100%)',
  'linear-gradient(to bottom, #F0F7FF 0%, #E3F0FF 70%, #D0E3F7 100%)',
  'linear-gradient(to bottom, #FFF0F5 0%, #FCE4EC 70%, #F3CEDB 100%)',
  'linear-gradient(to bottom, #FAF0FF 0%, #F3E5F5 70%, #E8D3EB 100%)'
]

const globalColorTracker = {
  index: 0
}

export const createColorMap = (items: any[], key: string) => {
  const uniqueItems = Array.from(new Map(items.map(item => [item[key], item])).values())

  const assignedColors: Record<string, string> = {}

  uniqueItems.forEach(item => {
    assignedColors[item[key]] = colorPalette[globalColorTracker.index % colorPalette.length]

    globalColorTracker.index++
  })

  return assignedColors
}
