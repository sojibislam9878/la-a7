import { env } from "@/lib/env"
import type { ApiFieldError, ApiResponse, PaginationMeta } from "@/types/api"

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: ApiFieldError[]

  constructor(status: number, message: string, fieldErrors: ApiFieldError[] = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  token?: string | null
  signal?: AbortSignal
  /** Let the request finish (and its Set-Cookie apply) even if the page unloads */
  keepalive?: boolean
}

export type ApiResult<T> = {
  data: T
  message: string
  meta?: PaginationMeta
}

/**
 * Browser-side request to the backend. Sends cookies (the refresh token lives in
 * an httpOnly cookie on the API domain) and unwraps the `{ success, data }` envelope.
 * Token refresh on 401 is layered on top in task 1.1.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, token, signal, keepalive } = options

  const headers: Record<string, string> = { Accept: "application/json" }
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      signal,
      keepalive,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(0, "Cannot reach the server. Check your internet connection and try again.")
  }

  const payload = (await res.json().catch(() => null)) as ApiResponse<T> | null

  if (!payload) {
    throw new ApiError(res.status, `Unexpected response from the server (${res.status}).`)
  }
  if (!payload.success) {
    throw new ApiError(res.status, payload.message, payload.errors)
  }
  return { data: payload.data, message: payload.message, meta: payload.meta }
}
