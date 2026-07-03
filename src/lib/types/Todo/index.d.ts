type Priority = 'High' | 'Medium' | 'Low'

type Todo = {
  todo_id?: string
  title: string
  description: string
  due_date: string
  status: number
  priority: Priority
}
