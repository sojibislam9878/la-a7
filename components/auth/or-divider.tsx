export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-xs tracking-wide text-muted-foreground uppercase">
      <span className="h-px flex-1 bg-soil/15" aria-hidden />
      {label}
      <span className="h-px flex-1 bg-soil/15" aria-hidden />
    </div>
  )
}
