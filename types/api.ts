export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiFieldError = {
  path: string
  message: string
}

export type ApiSuccess<T> = {
  success: true
  message: string
  data: T
  meta?: PaginationMeta
}

export type ApiFailure = {
  success: false
  message: string
  errors?: ApiFieldError[]
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export type Paginated<T> = {
  items: T[]
  meta: PaginationMeta
}
