type Expense = {
  expense_id: string
  amount: number
  benficery: string
  expense_date: string
  category: string
  benficery_type: string
  payment_mode: string
}

type ExpenseRequest = {
  expense_id?: string
  benficery_type_id: string
  category_id: string
  description: string
  amount: string
  expense_date: string
  expense_by: string
  benficery: string
  payment_mode: string
  reference_id: string
  remarks?: string
}

type ExpensesListResponse = {
  filtered: number
  total: number
  amount_total: number
  expenses: Expense[]
}

type BenificeryType = {
  benficery_type_id?: string
  benficery_type_name: string
  description?: string
}

type ExpenseCategoryType = {
  category_id?: string
  category_name: string
  category_description: string
}
