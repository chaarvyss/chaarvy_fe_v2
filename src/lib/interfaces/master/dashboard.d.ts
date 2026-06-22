interface DashClientsResponse {
  clcode: string
  activeStudents: string
  paid: string
  pending: string
  collected: string
  target: string
}

interface DashClientsRequest {
  limit?: number
  offset?: number
  search?: string
}
