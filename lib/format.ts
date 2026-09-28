const numberFormat = new Intl.NumberFormat("en-US")

export function formatNumber(value: number) {
  return numberFormat.format(value)
}

/** Storage rent is priced in BDT on the backend */
export function formatBdt(value: number, { maximumFractionDigits = 2 } = {}) {
  return `৳${value.toLocaleString("en-US", { maximumFractionDigits })}`
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
