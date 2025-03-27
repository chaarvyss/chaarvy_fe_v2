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
