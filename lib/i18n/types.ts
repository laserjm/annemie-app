export type Locale = "de" | "en"

export type MessageKey = keyof typeof import("@/lib/i18n/messages/en").enMessages

export type MessageParams = Record<string, string | number>

export type MessageCatalog = Record<MessageKey, string>
