export type ListForm = {
  name: string
  price: number
}

export type ListUpdateForm = {
  id: string
  name: string
  price: number
}

export type ListResponse = {
  id: string
  name: string
  price: number
  user_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}
