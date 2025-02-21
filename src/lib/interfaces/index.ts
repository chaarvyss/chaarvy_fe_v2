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
  value: string
  title: string
  color: ThemeColor
  icon: ReactElement
}

export interface UsersListResponse {
  active: number
  email: string
  mobile: string
  name: string
  role: string
  user_id: string
  username: string
}

export interface TableHeaders {
  label: string
  width?: string
}
