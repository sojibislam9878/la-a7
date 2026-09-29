export type OwnerProfile = {
  id: string
  businessName: string
  tradeLicenseNo: string
  nid: string
  district: string
  address: string
  createdAt: string
  updatedAt: string
}

export type OwnerProfilePayload = Partial<Pick<OwnerProfile, "businessName" | "tradeLicenseNo" | "nid" | "district" | "address">>
