export type Question = {
  id?: string
  topic_id: string
  question_title: { [key: string]: string }
  options?: { [key: string]: string[] }
  correct_option?: { [key: string]: string }
  question_type: string
  ui_type?: 'mcq' | 'theory'
}

export type MarkGroup = {
  id: string
  title: string
  marks: number
  questions: Question[]
}

export interface Topic {
  program: string
  segment: string
  subject: string
  topic_id: string
  topic_name: string
}
