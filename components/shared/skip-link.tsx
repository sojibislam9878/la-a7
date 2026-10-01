export const MAIN_CONTENT_ID = "main-content"

export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      Skip to content
    </a>
  )
}
