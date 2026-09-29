import { keepPreviousData, type QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { refreshCropTypes } from "@/app/actions/cache"
import { type CropTypeListQuery, type CropTypePayload, cropTypesApi } from "@/lib/api/crop-types"
import { getErrorMessage } from "@/lib/api/form-errors"
import { queryKeys } from "@/lib/query-keys"
import type { Paginated } from "@/types/api"
import type { CropType } from "@/types/crop-type"

const LISTS = ["crop-types"] as const

export function useCropTypeList(query: CropTypeListQuery) {
  return useQuery({
    queryKey: queryKeys.cropTypes(query),
    queryFn: async ({ signal }): Promise<Paginated<CropType>> => {
      const result = await cropTypesApi.list(query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    placeholderData: keepPreviousData,
  })
}

function useSettle() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: LISTS })
    void queryClient.invalidateQueries({ queryKey: ["availability"] })
    void refreshCropTypes().catch(() => undefined)
  }
}

export function useCreateCropType() {
  const settle = useSettle()
  return useMutation({
    mutationKey: ["crop-types", "create"],
    mutationFn: async (payload: CropTypePayload) => (await cropTypesApi.create(payload)).data,
    onSuccess: (crop) => {
      toast.success(`${crop.name} added`, { description: "Farmers can pick it when booking right away." })
    },
    onSettled: settle,
  })
}

export function useUpdateCropType() {
  const settle = useSettle()
  return useMutation({
    mutationKey: ["crop-types", "update"],
    mutationFn: async ({ id, payload }: { id: string; payload: CropTypePayload }) =>
      (await cropTypesApi.update(id, payload)).data,
    onSuccess: (crop) => {
      toast.success(`${crop.name} updated`, { description: "Chamber fit checks use the new range from now on." })
    },
    onSettled: settle,
  })
}

export function useDeleteCropType() {
  const queryClient = useQueryClient()
  const settle = useSettle()

  return useMutation<void, Error, { id: string; name: string }, [QueryKey, Paginated<CropType> | undefined][]>({
    mutationKey: ["crop-types", "delete"],
    mutationFn: async ({ id }) => {
      await cropTypesApi.remove(id)
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: LISTS })
      const snapshot = queryClient.getQueriesData<Paginated<CropType>>({ queryKey: LISTS })
      for (const [key, page] of snapshot) {
        if (!page) continue
        queryClient.setQueryData<Paginated<CropType>>(key, {
          items: page.items.filter((crop) => crop.id !== id),
          meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
        })
      }
      return snapshot
    },
    onError: (error, { name }, snapshot) => {
      for (const [key, page] of snapshot ?? []) queryClient.setQueryData(key, page)
      toast.error(`Couldn't delete ${name}`, { description: getErrorMessage(error) })
    },
    onSuccess: (_data, { name }) => {
      toast.success(`${name} deleted`, { description: "It's no longer offered to farmers." })
    },
    onSettled: settle,
  })
}
