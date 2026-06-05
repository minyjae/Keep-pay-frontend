export type ListForm = {
  name: string
  price: number
  date: string
  type_id: string
}

export type ListUpdateForm = {
  id: string
  name: string
  price: number
  date: string
}

export type ListSummary = {
  income: number
  expend: number
  balance: number
}

export type ListResponse = {
  id: string
  name: string
  price: number
  user_id: string
  date: string
  type: { id: string; name: string }
  created_at: string
  updated_at: string
  deleted_at: string | null
}
