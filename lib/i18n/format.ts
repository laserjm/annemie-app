import type { Locale } from "@/lib/i18n/types"

export const formatNumber = (locale: Locale, value: number): string => {
  return new Intl.NumberFormat(locale).format(value)
}

export const formatDateTime = (locale: Locale, value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : value

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
