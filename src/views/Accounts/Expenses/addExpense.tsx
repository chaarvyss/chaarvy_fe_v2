import { useState } from 'react'

type AddExpenseRequest = {
  expense_id?: string
  benficery_type_id: string
  category_id: string
  description: string
  amount: number
  expense_date: string
  expense_by: string
  benficery: string
  payment_mode: number
  reference_id: string
  remarks: string
}

const AddExpense = () => {
  const [expense, setExpense] = useState<AddExpenseRequest>()

  return <div>AddExpense</div>
}

export default AddExpense
