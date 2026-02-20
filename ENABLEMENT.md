Ja – **wenn** du Skills/Tasks so kapselst, wie wir es skizziert haben, ist der Übergang zu neuen Lerninhalten (z.B. **Zwanzigerübergang**) bereits “mitgedacht”. Was du dafür brauchst, ist eine saubere Trennung von:

- **Konzept/Skill** (z.B. “über die 10”, “über die 20”)
- **Darstellung/TaskType** (Ten-Frame, Zahlstrahl, Rechenaufgabe, Drag-Fill)
- **Parameter/Level** (Zahlenräume, Hilfen, Zeitdruck)

Damit kannst du neue Inhalte hinzufügen, ohne die Core-Engine umzubauen.

---

## Wie du den Zwanzigerübergang sauber einfügst

### Option 1: Neuer Skill (empfohlen)

Du legst einen neuen Skill an, z.B.:

- `math.bridgeOver10.add`
- `math.bridgeOver10.sub`
- `math.bridgeOver20.add`
- `math.bridgeOver20.sub`

Warum eigener Skill?
Weil Didaktik, Zahlenraum und Visualisierung sich ändern (10er-Struktur bleibt, aber du brauchst 2 Zehner / 20er-Frame / anderen Zahlstrahl).

**Was bleibt gleich**

- SessionEngine (`generateSession(skillId, options)`)
- Difficulty-System (Level → Config)
- Task Rendering Registry (wenn TaskTypes wiederverwendbar sind)

**Was kommt neu**

- neue Generatoren für “über 20”
- ggf. neue Visuals (z.B. “Double Ten-Frame”)

---

## TaskTypes wiederverwenden statt neu erfinden

Viele TaskTypes aus dem Zehnerübergang kannst du _recyceln_, indem du sie parametrisierst.

### Beispiel: “Fill to base”

Statt nur “Mach voll bis 10”, machst du daraus:

- `fillToBase` mit `base = 10` oder `base = 20`

Dann kann derselbe Renderer beide Fälle abdecken.

**Renderer-Parameter**

- `base` (10/20)
- `frame` (ein Ten-Frame oder zwei nebeneinander)
- `startValue`, `addValue`

Das ist der Kern der Erweiterbarkeit: **TaskType ist generisch, Skill liefert Config.**

---

## Visuals: Ten-Frame → Double Ten-Frame (20er)

Für Zwanzigerübergang ist didaktisch super:

- Zwei Ten-Frames nebeneinander (0–10 und 11–20)
- Oder 20er-Feld (2×10 Struktur)

So bleiben Strategien gleich:

- “erst zum nächsten Zehner voll machen (z.B. 17 → 20)”
- dann weiter

---

## Was du in der Architektur dafür konkret brauchst

### 1) Skill-Config muss einen “Zahlenraum / Base” ausdrücken

In deinem Difficulty-Config pro Skill sollten drin stehen:

- `maxNumber` bzw. `range`
- `base` (10 oder 20)
- `requiredCrossing` (muss Übergang passieren? über welche Grenze?)

Beispiel:

- Zehnerübergang: crossing über 10
- Zwanzigerübergang: crossing über 20 **oder** über den nächsten Zehner innerhalb bis 20 (z.B. 14+8 über 20)

Wichtig: “Zwanzigerübergang” kann didaktisch zwei Sachen heißen:

1. **Über die 20 hinaus** (19+4)
2. **Im Zahlenraum bis 20 über den Zehner** (14+8)
   Du kannst das als zwei Skills modellieren oder als Submode im Skill.

### 2) Generatoren sollten Constraints kennen

Generatoren bekommen nicht nur “Range”, sondern Regeln:

- “a+b muss > 20 sein”
- oder “a und b so wählen, dass a bis zum nächsten Zehner ergänzt wird”

### 3) Renderer sollen “Frames” als austauschbare Darstellung haben

Statt `TenFrame` hart einzubauen:

- `FrameRenderer` mit Varianten: `tenFrame`, `doubleTenFrame`, `numberLine`

---

## Konkreter Vorschlag für deine Registry-Struktur

Du behältst deine `SkillRegistry`, ergänzt aber ein Konzept von **Domain + Level + Mode**:

- `domain: "math"`
- `concept: "bridge"`
- `base: 10 | 20`
- `operation: "add" | "sub"`
- `mode` optional (z.B. “crossNextTen”, “cross20”)

Dann kannst du später super leicht filtern und UI bauen (z.B. “Mathe → Übergänge → bis 10 / bis 20 / bis 100”).

---

## Roadmap-Update: Was du jetzt im MVP 1 ergänzen solltest, damit Zwanzigerübergang easy wird

### MVP 1 (jetzt, ohne neuen Content)

1. **TaskTypes generisch machen** (nicht “makeTen”, sondern “fillToBase”)
2. Difficulty-Config erweitert um:
   - `range`
   - `base`
   - `crossingRule`

3. Visual-Komponente so bauen, dass “Ten-Frame” austauschbar ist (komponentisiert)
4. Skill-Ordnerstruktur so lassen, dass ein neuer Skill nur ein neuer Ordner ist

Damit ist Zwanzigerübergang später:

- neuer Skill-Ordner + Generatoren + (evtl.) `DoubleTenFrame` UI
- kein Eingriff in SessionEngine
