export type FarmerProfile = {
  id: string
  district: string
  upazila: string | null
  nid: string | null
  farmSizeAcre: number | null
  createdAt: string
  updatedAt: string
}

export type FarmerProfilePayload = {
  district?: string
  upazila?: string
  nid?: string
  farmSizeAcre?: number
}
