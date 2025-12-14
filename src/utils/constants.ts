export const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 }
}

export const NAMED_COLORS: Record<string, string> = {
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
  black: '#000000',
  white: '#FFFFFF',
  yellow: '#FFFF00',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  gray: '#808080',
  grey: '#808080',
  brown: '#A52A2A',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  lime: '#00FF00',
  navy: '#000080',
  teal: '#008080',
  maroon: '#800000',
  olive: '#808000',
  silver: '#C0C0C0',
  gold: '#FFD700'
}
import { ThemeColorEnum } from './enums'

export const statusColors = {
  active: ThemeColorEnum.Success,
  inactive: ThemeColorEnum.Warning
}

const quotes = [
  'Welcome back! May today bring you success and joy! 😊',
  'Great to see you again! Let’s make today amazing! 🚀',
  'Hello again! Ready for another productive day? 💪',
  'Back for more? Let’s accomplish great things today! 🌟',
  'Welcome! Every day is a fresh start—make it count! ✨'
]

export const getDailyQuote = () => {
  const today = new Date().toISOString().slice(0, 10)
  const hash = today.split('-').reduce((acc, num) => acc + parseInt(num), 0)

  return quotes[hash % quotes.length]
}
