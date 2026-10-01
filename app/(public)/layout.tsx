import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { MAIN_CONTENT_ID } from "@/components/shared/skip-link"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">{children}</main>
      <Footer />
    </div>
  )
}
