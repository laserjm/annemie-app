"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  t as translate,
} from "@/lib/i18n"
import type { Locale, MessageKey, MessageParams } from "@/lib/i18n/types"

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, params?: MessageParams) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const isLocale = (value: string): value is Locale => {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE
  }

  try {
    const storedValue = window.localStorage.getItem(LOCALE_STORAGE_KEY)

    if (storedValue && isLocale(storedValue)) {
      return storedValue
    }
  } catch {
    return DEFAULT_LOCALE
  }

  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }, [])

  const t = useCallback(
    (key: MessageKey, params?: MessageParams) => {
      return translate(locale, key, params)
    },
    [locale]
  )

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  )

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
}

export const useLocale = (): LocaleContextValue => {
  const contextValue = useContext(LocaleContext)

  if (!contextValue) {
    throw new Error("useLocale must be used inside LocaleProvider")
  }

  return contextValue
}
