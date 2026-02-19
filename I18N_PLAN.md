# i18n Plan (MVP -> Production)

## Goal
Introduce internationalization with a German-first UX while keeping English available, without breaking the current session engine and task-rendering flow.

## Scope
- In scope:
  - UI copy in app shell, task prompts, hints, feedback, and results
  - Locale selection + persistence
  - Default locale behavior and fallback strategy
  - Basic date/number formatting
- Out of scope (first iteration):
  - RTL support
  - CMS-backed translation workflow
  - Per-locale content variants with different pedagogy

## Decisions (Locked)
1. Use app-level dictionary modules, not a third-party i18n library in iteration 1.
2. Support locales: `de` and `en`.
3. Default locale: `de`.
4. Fallback locale: `en` for missing keys during development, plus a CI lint check to prevent shipping missing keys.
5. Persist selected locale in local storage key `annemie-locale-v1`.
6. Keep route structure unchanged for now (`/` only); no locale path segment in iteration 1.

## Target Architecture

### 1) Locale types and dictionary contract
- Add `lib/i18n/types.ts`:
  - `type Locale = "de" | "en"`
  - `type MessageKey = ...` (string literal union generated from base dictionary)
- Add `lib/i18n/messages/de.ts` and `lib/i18n/messages/en.ts`.
- Add `lib/i18n/index.ts` with:
  - `getMessage(locale, key, params?)`
  - `hasMessage(locale, key)`
  - fallback resolution logic.

### 2) Message key structure
Use namespaced flat keys:
- `app.title`
- `start.title`
- `start.description`
- `task.quantity.prompt`
- `task.quantity.hiddenNotice`
- `task.quantity.showAgain`
- `task.hint.show`
- `result.title`
- `result.recommendation.fast`

This avoids implicit coupling and keeps refactors safe.

### 3) Locale state wiring
- Add `components/i18n/locale-provider.tsx`:
  - `LocaleContext`
  - `useLocale()` hook returning `{ locale, setLocale, t }`
- Read locale on mount from `annemie-locale-v1`.
- Persist locale on change.

### 4) App integration
- Wrap `/components/mvp/annemie-mvp-app.tsx` content with `LocaleProvider`.
- Replace all hardcoded user-facing strings with `t("...")`.
- Add locale switch control on start screen and results screen.

### 5) Generator integration
- Keep generator math/stimulus language-agnostic.
- Move all prompt/hint strings out of generator files into message keys:
  - `lib/generators/ten-frame.ts`
  - `lib/generators/missing-to-ten.ts`
  - `lib/generators/back-to-ten-subtract.ts`
- Generators should return message keys + interpolation values, e.g.:
  - `promptKey: "task.quantity.prompt"`
  - `hintKeys: ["task.quantity.hint1", "task.quantity.hint2"]`
  - `hintParams: { start: 8 }`

### 6) Formatting
- Use `Intl.NumberFormat(locale)` for all displayed numbers.
- Use `Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" })` for session timestamps.

## Implementation Phases

### Phase A: Foundation
1. Add i18n types, dictionaries, translator utility.
2. Add locale provider and locale persistence.
3. Add dev-only missing-key warning utility.

### Phase B: UI migration
1. Migrate shell texts in `annemie-mvp-app.tsx`.
2. Migrate task renderer static labels (`Show hint`, `Show again`, etc.).
3. Migrate result/recommendation text.

### Phase C: Domain-safe migration
1. Replace generator inline prompt/hint text with key-based metadata.
2. Update `Task` type to carry key-based copy fields.
3. Update renderers to resolve keys via `t()`.

### Phase D: Quality gates
1. Add script `pnpm i18n:check` to verify parity between `de.ts` and `en.ts`.
2. Add test to fail if any key exists in one locale only.
3. Add smoke test for locale switch persistence.

## Public Interface Changes
- `Task` copy fields will shift from text to key-based fields:
  - from `prompt?: string` to `promptKey?: MessageKey`
  - from `hints: [string, string]` to `hintKeys: [MessageKey, MessageKey]`
  - optional interpolation payload for dynamic messages

## Test Plan
1. Locale behavior
- Default locale is `de` when no setting exists.
- Locale switch to `en` persists after reload.

2. Translation completeness
- Dictionary parity check passes.
- No runtime `undefined` messages in UI.

3. Functional regression
- Start -> session -> result still works in both locales.
- Hints and feedback still appear in correct sequence.

4. Formatting
- Numbers and timestamps follow selected locale conventions.

## Acceptance Criteria
1. User can switch between German and English at runtime.
2. All visible copy in MVP screens is translated in both locales.
3. Missing translation keys are blocked by CI check.
4. Existing session logic and adaptive behavior remain unchanged.
