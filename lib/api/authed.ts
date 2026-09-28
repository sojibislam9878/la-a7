import { ApiError, apiRequest, type ApiResult, type RequestOptions } from "@/lib/api/client"
import { refreshSession } from "@/lib/auth/session"
import { useAuthStore } from "@/stores/auth-store"

type AuthedOptions = Omit<RequestOptions, "token">

/**
 * Request with the in-memory access token. Waits for the session restore on a
 * fresh page load, and on a 401 (the 15-minute token expired) refreshes once
 * and retries. A failed refresh clears the session and the guard redirects.
 */
export async function authedRequest<T>(path: string, options: AuthedOptions = {}): Promise<ApiResult<T>> {
  const token = useAuthStore.getState().accessToken ?? (await refreshSession())?.accessToken
  if (!token) {
    throw new ApiError(401, "Your session has expired. Please log in again.")
  }

  try {
    return await apiRequest<T>(path, { ...options, token })
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error

    const session = await refreshSession()
    if (!session) throw error
    return apiRequest<T>(path, { ...options, token: session.accessToken })
  }
}
