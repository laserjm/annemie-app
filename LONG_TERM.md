## Long-Term Roadmap in Phasen (Start: MVP ohne KI)

### Phase 0 – Prototype (lokal, 1 Kind, 1 Gerät)

**Ziel:** Lernflow + UI + Generatoren validieren (wie ihr es gerade macht).

**Scope**

- SkillRegistry + TaskTypeRegistry + SessionEngine (nur clientseitig)
- localStorage/IndexedDB für:
  - Einstellungen (Aufgabenanzahl, Schwierigkeit)
  - einfache Stats pro Skill (richtig/falsch, Zeit, Hilfen)

- Kein Login, keine Accounts, keine Cloud

**Ergebnis:** Du weißt, welche Spiele funktionieren und welche nicht.

---

### Phase 1 – MVP 1 (stabil, erweiterbar, weiterhin lokal)

**Ziel:** Saubere Architektur + mehr Content + konfigurierbare Sessions.

**Scope**

- Saubere Trennung: _Skill_ vs _TaskType_ vs _Renderer_
- Session: wählbare Länge (z.B. 5/10/15 Aufgaben oder “7–10 Minuten” als Näherung über Task-Anzahl)
- Manuelle Difficulty (evtl. später Auto-Modus)
- Fortschritt pro Skill
- Erweiterbarkeit: neue Skills (z.B. Zwanzigerübergang) nur als neuer Ordner + Registry-Eintrag
- Optional: Export/Import lokal (JSON), um Daten zu retten

**Noch ohne Backend**, solange:

- nur ein Gerät benutzt wird
- es nur “dein Kind” ist
- du keine geteilten Statistiken / Geräte-Sync brauchst

---

## Wann macht ein Backend (Supabase) Sinn?

Supabase lohnt sich, sobald mindestens eins davon gilt:

1. **Mehrere Geräte** (iPad + anderes iPad / iPhone / Laptop) → Sync
2. **Mehrere Kinder/Profiles** → Nutzerverwaltung
3. **Du willst Fortschritt dauerhaft sichern** (App löschen, Gerät wechseln)
4. **Du willst Eltern-Dashboard über Geräte hinweg**
5. **Du willst A/B-Tests** (welches Task-Design hilft wirklich?)
6. **Du willst “Content Updates” serverseitig steuern** (Konfig/Weights/Skill-Freischaltung)

Wenn ihr aktuell nur auf einem iPad spielt, ist Backend optional.
Wenn du aber eh “langfristig” denkst: **Phase 2 ist der richtige Zeitpunkt.**

---

## Phase 2 – “Cloud MVP” (Supabase light, minimal-invasiv)

**Ziel:** Accounts + Sync + saubere Datenbasis, ohne die App umzubauen.

### Was schiebst du ins Backend?

**Nicht**: Generatoren, UI-Rendering, Task-Erstellung (bleibt clientseitig, schnell, offlinefähig).
**Ja**: alles, was persistent & geräteübergreifend sein soll:

1. **User / Family / Child Profiles**

- Elternaccount + Kinderprofile (ohne E-Mail fürs Kind)

2. **Settings**

- difficulty default, session length, welche Skills sichtbar sind

3. **Progress / Mastery**

- Aggregierte Skill-Stats (z.B. “bridgeOver10.add Level 2 stabil”)

4. **Event-Log (optional, aber sehr wertvoll)**

- pro Aufgabe: `taskType`, `skillId`, `paramsHash`, `correct`, `timeMs`, `hintsUsed`
- Damit kannst du später echte Anpassung bauen und sehen, was wirkt.

5. **Remote Config (optional)**

- z.B. Weighting der Task-Varianten, Feature Flags, neue Skills “aktivieren”

### Was bleibt lokal (wichtig für UX)?

- Session läuft offline weiter
- Wenn Backend ausfällt → App funktioniert
- Lokaler Cache + später Sync

---

## Der Übergang von Phase 0/1 → Backend (ohne Schmerz)

Der Schlüssel ist eine **Data Access Layer** von Anfang an:

### Phase 0/1: `ProgressStoreLocal`

- Implementierung auf localStorage/IndexedDB

### Phase 2: `ProgressStoreRemote`

- Implementierung über Supabase (mit Offline-Queue)

Und die App nutzt nur ein Interface, z.B.:

- `loadProfile()`
- `saveSettings()`
- `appendAttempt(event)`
- `getSkillSummary()`

**Übergangsschritt: Dual Write**

- eine Zeit lang: lokal schreiben **und** remote schreiben (wenn eingeloggt)
- damit verlierst du nichts und kannst migraten

### Migration (einmalig)

Beim ersten Login:

- lokale Daten lesen
- in Supabase hochladen
- lokal als “migrated” markieren

---

## Phase 3 – Pädagogik & Personalisierung (ohne KI)

**Ziel:** Die App wird spürbar “intelligenter”, bleibt aber deterministisch.

**Scope**

- Auto-Difficulty pro Skill (basierend auf Event-Log)
- Smarter Session-Mix (z.B. 70% Schwerpunkt, 30% Wiederholung)
- “Fehlerdiagnosen light” (z.B. viele Fehler beim Ergänzen bis 10 → mehr `missingToTen`)
- Eltern-Dashboard besser (Trends, “womit hakt’s”)

Supabase hilft hier stark, weil du verlässliche Daten hast.

---

## Phase 4 – Content Scaling (mehr Mathe, Lesen, neue Module)

**Ziel:** Viele Skills ohne Chaos.

**Scope**

- Content/Skill-Katalog wächst: Zwanzigerübergang, Einmaleins, Uhrzeit, Lesen…
- Remote Config bestimmt, welche Skills freigeschaltet sind
- Versionierung von Skill-Definitionen (damit alte Sessions reproduzierbar bleiben)
- Optional: “Downloadbare Pakete” (offline content bundles)

---

## Phase 5 – KI (optional, später) als Planer/Story/Content-Assistent

**Ziel:** Variation + Motivation + schneller Ausbau neuer Module.

**Scope**

- KI generiert Session-Pläne oder kurze Lesetexte **innerhalb harter Grenzen**
- Alles weiterhin validiert + fallback auf deterministische Generatoren
- Backend nutzt du dann für:
  - Caching von Plänen
  - Content-Freigaben
  - A/B Tests

---

# Konkreter Backend-Start (Supabase) – Minimaler Plan

### Supabase “Light Schema” (Phase 2)

- `users` (über Supabase Auth)
- `children` (profile)
- `settings` (pro child)
- `skill_progress` (aggregiert)
- `attempt_events` (append-only, optional aber empfehlenswert)
- `remote_config` (optional)

**RLS (Row Level Security)**: Eltern darf nur eigene Kinder sehen.

### Technischer Übergang in 3 Schritten

1. **Ab jetzt im MVP:** ein `ProgressStore` Interface einführen (auch wenn nur lokal)
2. **Cloud MVP:** Supabase Auth + Sync für `settings` + `skill_progress`
3. **Dann:** Event-Log append-only + Aggregation (entweder clientseitig oder via Edge Function/DB)

---

## Faustregel: Wann “wirklich” wechseln?

- **Wenn ihr nur 1 iPad nutzt:** Backend kann warten bis Phase 2.
- **Wenn du perspektivisch mehrere Geräte/Profiles willst:** Bau das `ProgressStore` Interface **jetzt**, aber integriere Supabase erst, wenn MVP 1 stabil ist.
