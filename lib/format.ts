const numberFormat = new Intl.NumberFormat("en-US")

export function formatNumber(value: number) {
  return numberFormat.format(value)
}

export function formatMoney(value: number, { maximumFractionDigits }: { maximumFractionDigits?: number } = {}) {
  if (maximumFractionDigits !== undefined) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits })}`
  }
  const digits = Number.isInteger(value) ? 0 : 2
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}

export function formatKg(kg: number) {
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} t`
  }
  return `${formatNumber(kg)} kg`
}

export function formatTempRange(min: number, max: number) {
  return min === max ? `${min}°C` : `${min}°C to ${max}°C`
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}
