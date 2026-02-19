Ja, das macht sehr viel Sinn – und genau so würde ich’s bauen: **Generatoren (Business-Logik) erzeugen “Aufgaben-Objekte”**, und die UI rendert nur noch **Task-Typen** (Ten-Frame, Würfelbild, Zahlstrahl, Drag-to-fill, Multiple Choice …). Dann kannst du später neue Inhalte hinzufügen, ohne die App-Architektur neu zu denken.

Hier ist eine **erweiterbare MVP-Roadmap** (Tablet/iPad-first), inkl. Vorschlag für eine generische Generator-Pipeline.

---

## Leit-Architektur fürs MVP (damit’s skalierbar bleibt)

### 1) Task-Contract (das “Aufgaben-Objekt”)

Jede Aufgabe ist ein JSON-Objekt mit:

- `id`, `type`, `skill`, `difficulty`
- `prompt` (kurz, optional)
- `stimulus` (was angezeigt wird: Punktefeld/Chips/Zahlen)
- `interaction` (wie beantwortet wird: tap, choice, drag)
- `answer` (korrekt + ggf. alternative)
- `hints` (gestufte Hilfen)
- `scoring` (was zählt als Erfolg: korrekt, schnell, mit/ohne Hilfe)

Damit kann die UI rein über `type` + `interaction` rendern.

### 2) Generatoren

Ein Generator ist (gedanklich) sowas wie:

- Input: `skill`, `difficulty`, `recentMistakes`, `settings`
- Output: `Task`

Beispiel: `generateQuantityTask({range: [1..10], mode: "tenFrameFlash"})`

### 3) Session-Engine (der Kleber)

- Wählt Skills (z.B. heute Schwerpunkt Zehnerübergang)
- Ruft Generatoren auf
- Trackt Ergebnisse (Accuracy, Zeit, Hilfen)
- Passt Schwierigkeit an (leicht adaptiv)

---

## MVP Roadmap (4 Phasen)

### Phase 0 (Tag 1): Setup & “Vertical Slice”

Ziel: Ein Task läuft Ende-zu-Ende.

**Deliverables**

- NextJS App (App Router), Mobile-first Layout
- 1 Task-Typ “Ten-Frame Tap-Answer”
- Session-Flow: Start → 5 Aufgaben → Ergebnis-Screen
- Persistence lokal (localStorage/IndexedDB): last skill + simple stats

**Warum**: Du siehst sofort, ob UX auf iPad gut funktioniert.

---

### Phase 1 (MVP Core: 3 Skills, 6–8 Task-Varianten)

Ziel: Die drei Problemzonen abdecken, aber schlank.

#### Skill A: Mengen erfassen

**Task-Varianten**

1. `tenFrameFlashCount` (Blitzbild → Zahl wählen 1–10)
2. `diceFlashCount` (Würfelbild bis 6, optional)
3. `compareQuantities` (welche Menge größer? links/rechts)

**Generator-Parameter**

- `maxNumber` (z.B. bis 6 / bis 10)
- `flashMs` (z.B. 600ms → später 350ms)
- `structureBias` (mehr 5+… Muster)

#### Skill B: Addieren mit Zehnerübergang

**Task-Varianten** 4. `makeTenFill` (8 + 5 als: fülle bis 10 per Drag, Rest automatisch) 5. `missingToTen` (“8 braucht \_\_ bis 10” → Auswahl oder Tippen) 6. `bridgeAdd` (klassisch “8+5”, aber visuell: Ten-Frame + Chips wandern)

**Generator-Parameter**

- `a` in [6..9], `b` in [2..9] mit garantiertem Übergang
- `hintPolicy` (wann zeigst du “erst bis 10”)

#### Skill C: Subtrahieren mit Zehnerübergang

**Task-Varianten** 7. `backToTenSubtract` (13–5: nimm erst bis 10 weg, dann weiter) 8. `complementToTarget` (“von 8 bis 13 fehlen \_\_”)

**Generator-Parameter**

- `start` in [11..19], `sub` in [2..9] mit Übergang
- Optional: Umkehraufgaben-Mix (Ergänzen statt Minus)

**In Phase 1 auch drin**

- Adaptive Difficulty (sehr simpel): 3× korrekt schnell → +1, 2× falsch → -1 und Hint früher
- Hilfen 2-stufig: _visuell_ → _strategisch_

---

### Phase 2 (Qualität & Motivation: “didaktisch sauber”)

Ziel: Die App fühlt sich wie ein Lernmittel an, nicht wie ein Quiz.

**Features**

- “Strategie-Feedback” (nicht nur richtig/falsch)
  - z.B. wenn falsch bei 8+5: zeig “8 braucht 2 bis 10” als Mini-Animation

- “Kurz-Sessions”: Standard 5 Minuten, mit sanftem Ende
- Sammelalbum/Sticker pro Skill-Stufe (ohne Shop/Coins)
- Elternansicht light: “Welche Skills: gut / mittel / braucht Hilfe”

---

### Phase 3 (Erweiterbarkeit: Content-System & neue Renderer)

Ziel: Du kannst neue Aufgabentypen hinzufügen, ohne Chaos.

**Features**

- Task definitions “data-driven”:
  - Generatoren konfigurierbar über JSON (Ranges, Bias, Häufigkeiten)

- Skill-Graph:
  - Subitizing → Ten-Frame Struktur → Make-10 → Add/Sub über 10

- Neue Renderer optional:
  - Zahlstrahl-Transfer (erst später, damit es nicht zum Zählen verführt)

---

## “Generic Generator”-Design (damit’s clean bleibt)

### 1) Skills als Domänenobjekte

- `Skill.Quantity`
- `Skill.MakeTen`
- `Skill.BridgeAdd`
- `Skill.BridgeSubtract`

### 2) Blueprint → Task

Ein Generator baut aus einem “Blueprint” (Parameter) ein Task-Objekt.

**Blueprint Beispiele**

- QuantityFlash: `{max: 10, representation: "tenFrame", flashMs: 600}`
- BridgeAdd: `{a: 8, b: 5, strategy: "makeTen"}`
- BridgeSubtract: `{start: 13, sub: 5, strategy: "backToTen"}`

### 3) Weighted Random + Constraints

Du willst “zufällig”, aber kontrolliert:

- Gewichte pro Task-Variante (z.B. 60% Ten-Frame Flash, 40% Compare)
- Constraints: “Zehnerübergang muss passieren”
- Anti-repeat: gleiche Aufgabe nicht 2× hintereinander

### 4) Deterministischer RNG (optional nice)

Seed pro Session → reproduzierbar (hilft beim Debuggen und beim “heute nochmal”)

---

## UI-Rendering (iPad-first)

Für Tablet würde ich konsequent auf:

- große Tap-Targets (min. ~44px)
- Drag nur dort, wo’s didaktisch Sinn macht (Make-10)
- wenig Text, viel visuelle Struktur

Technisch:

- `TaskRenderer` switcht auf `type`
- Komponenten wie `TenFrame`, `ChipTray`, `NumberChoice`, `FlashOverlay`

---

## Minimaler “Scope Cut”, falls du super klein starten willst

Wenn du’s ultra-schlank willst, nimm in Phase 1 nur:

- `tenFrameFlashCount`
- `missingToTen`
- `backToTenSubtract`

Das deckt schon überraschend viel ab.
