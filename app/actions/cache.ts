"use server"

import { updateTag } from "next/cache"

export async function refreshCropTypes() {
  updateTag("crop-types")
}
