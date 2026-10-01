import { Leaf } from "@/components/shared/leaf"

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-soil/10 bg-cream bg-grain">
      <Leaf className="absolute top-6 right-[8%] size-20 rotate-12 text-primary/15" />
      <Leaf className="absolute -bottom-4 left-[45%] size-16 -rotate-[30deg] text-harvest/30" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
        {children}
      </div>
    </section>
  )
}
