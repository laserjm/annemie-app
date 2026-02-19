import { deMessages } from "@/lib/i18n/messages/de"
import { enMessages } from "@/lib/i18n/messages/en"
import type { Locale, MessageCatalog, MessageKey, MessageParams } from "@/lib/i18n/types"

export const DEFAULT_LOCALE: Locale = "de"
export const FALLBACK_LOCALE: Locale = "en"
export const LOCALE_STORAGE_KEY = "annemie-locale-v1"

export const SUPPORTED_LOCALES: Locale[] = ["de", "en"]

const MESSAGE_CATALOGS: Record<Locale, MessageCatalog> = {
  de: deMessages,
  en: enMessages,
}

const interpolate = (template: string, params?: MessageParams): string => {
  if (!params) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}

export const hasMessage = (locale: Locale, key: MessageKey): boolean => {
  return MESSAGE_CATALOGS[locale][key] !== undefined
}

export const t = (locale: Locale, key: MessageKey, params?: MessageParams): string => {
  const message = MESSAGE_CATALOGS[locale][key] ?? MESSAGE_CATALOGS[FALLBACK_LOCALE][key]

  if (!message) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Missing i18n key: ${key}`)
    }

    return key
  }

  return interpolate(message, params)
}
