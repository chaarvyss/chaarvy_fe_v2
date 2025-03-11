import { ReactElement } from 'react'

import { ThemeColor } from '../../@core/layouts/types'

export interface LoginProps {
  clcode: string
  username: string
  password: string
}

export interface ChangePasswordProps {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface LoginResponse {
  authToken: string
  name: string
  clcode: string
  role: string
  mobile: string
  email: string
  urs: string
  permission: Array<string>
}

export interface TableHeaderStatCardProps {
  value: string | number
  title: string
  color: ThemeColor
  icon: ReactElement
}

export interface FilterProps {
  searchText?: string
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
  program?: string
  medium?: string
}

export interface User {
  user_id: string
  username: string
  name: string
  email: string
  mobile: string
  profile_pic: string
  status: number
  role_name: string
}

export interface UsersListResponse {
  users: User[]
  counts: {
    total: number
    filtered: number
  }
}

export interface TableHeaders {
  label: string
  width?: string
}

export interface PaymentModes {
  payment_mode_id: string
  payment_mode: string
}

export interface PaymentsListRequest {
  limit?: number
  offset?: number
  searchText?: string
  startDate?: string // 2025-03-17
  endDate?: string
}

export interface UsersListRequest {
  limit?: number
  offset?: number
  searchText?: string
  role?: string
  status?: number
}

export interface StudentPayment {
  payment_id: string
  amount: number
  transaction_number: string
  created_date: string
  reciept_number: string
  admission_number: string
  student_name: string
}

interface StudentPaymentCount {
  total: number
  filtered: number
  amount: number
}
export interface PaymentsListResponse {
  payments: StudentPayment[]
  counts: StudentPaymentCount
}
