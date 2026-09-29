import type { Metadata } from "next"

import { MyReviews } from "@/components/review/my-reviews"

export const metadata: Metadata = { title: "My reviews" }

export default function FarmerReviewsPage() {
  return <MyReviews />
}
