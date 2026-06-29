interface FinancialRecord {
  id: string
  amount: number
  type: 'payment' | 'expense'
  date: string
}

interface ExpenseRecord {
  id: string
  amount: number
  category: string
  beneficiaryType: string
  date_of_payment: string
}
