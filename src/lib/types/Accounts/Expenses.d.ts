type Expense = {
  expense_id: string
  amount: number
  benficery: string
  expense_date: string
  category: string
  benficery_type: string
  payment_mode: string
}

type ExpensesListResponse = {
  filtered: number
  total: number
  expenses: Expense[]
}
