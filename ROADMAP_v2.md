Mega gut 👏 – echte Tests mit deiner Tochter sind Gold wert.
Deine Beobachtungen sind genau die Punkte, an denen aus einem “netten Prototyp” ein sauberes Lernsystem wird.

Ich aktualisiere dir hier **MVP 1 (ohne KI)** mit Fokus auf:

1. Klare Trennung der Kategorien
2. Variable Aufgabenanzahl
3. Einstellbarer Schwierigkeitsgrad
4. Saubere Erweiterbarkeit für neue Spiele & Kategorien

---

# 🎯 MVP 1 – Version 2 Roadmap (ohne KI)

## 1️⃣ Klare Kategorien – keine ungewollte Durchmischung

### Problem

Deine Engine mischt aktuell vermutlich Tasks aus mehreren Skills in einer Session.

### Lösung: Skill-spezifische Sessions

Statt:

```
generateSession()
```

→ neu:

```
generateSession(skillId, options)
```

Beispiel:

```
generateSession("quantity.counting", { difficulty: 2, length: 10 })
```

### Neue Struktur

```
/skills
  /quantity
    index.ts
    generators.ts
  /makeTen
  /bridgeSubtract
```

Jeder Skill hat:

- eigene Generatoren
- eigene Difficulty-Logik
- eigene Task-Typen

Die Session-Engine darf nur Tasks dieses Skills erzeugen – außer du wählst explizit „Mischmodus“.

---

## 2️⃣ Mehr als 5 Aufgaben – flexible Session-Länge

### Neue Session-Optionen

```
type SessionOptions = {
  difficulty: 1 | 2 | 3
  length: number   // z.B. 5, 10, 15
}
```

### UX-Vorschlag (iPad-freundlich)

Beim Start:

```
Thema wählen →
  Länge wählen:
   ○ Kurz (5)
   ○ Mittel (10)
   ○ Lang (15)
```

Oder:

- Elternbereich: Default-Länge festlegen
- Kind sieht nur “Heute spielen!”

---

## 3️⃣ Einstellbarer Schwierigkeitsgrad

Wichtig: Difficulty darf nicht nur “größere Zahlen” bedeuten.

### Difficulty-Modell pro Skill

Beispiel: Mengen erfassen

| Level | Beschreibung               |
| ----- | -------------------------- |
| 1     | 1–5, keine Zeitbegrenzung  |
| 2     | 1–10, strukturierte 5er    |
| 3     | 1–10, kürzere Einblendzeit |
| 4     | gemischt + Vergleichen     |

Beispiel: Zehnerübergang Addieren

| Level | Beschreibung            |
| ----- | ----------------------- |
| 1     | a 6–9, b 1–5            |
| 2     | b 2–9                   |
| 3     | weniger visuelle Hilfen |
| 4     | gemischt Add + Ergänzen |

---

### Technisch sauber lösen

Jeder Skill exportiert:

```
getDifficultyConfig(level: number)
```

Beispiel:

```
{
  numberRange: [6, 9],
  addendRange: [2, 7],
  showTenFrame: true,
  flashMs: 600
}
```

Der Generator bekommt diese Config rein.

So bleibt alles sauber kapsuliert.

---

## 4️⃣ Erweiterbarkeit für neue Spiele & Kategorien

Jetzt kommt der wichtigste Teil.

Du brauchst eine **Plugin-ähnliche Struktur für Skills**.

---

# 🧱 Erweiterbare Architektur

## Kernkonzept: Skill Registry

Du definierst zentral eine Registry:

```
SkillRegistry = {
  "quantity.counting": {
      label: "Punkte zählen",
      icon: "...",
      generators: [...],
      difficultyLevels: 4
  },
  "makeTen": {...},
  "bridgeSubtract": {...}
}
```

Die UI liest nur aus dieser Registry.

→ Neue Kategorie = Eintrag hinzufügen
→ UI passt sich automatisch an

---

## Task-Typ Registry (wichtig!)

Du brauchst zwei Ebenen:

1. Skill (Was wird trainiert?)
2. TaskType (Wie sieht es aus?)

Beispiel TaskTypes:

- tenFrameFlash
- multipleChoice
- dragToFillTen
- compareQuantities
- numberInput

Jeder TaskType hat:

- Renderer-Komponente
- Interaction-Logik
- Feedback-Komponente

```
TaskRendererRegistry = {
   tenFrameFlash: TenFrameFlashComponent,
   dragToFillTen: DragFillComponent,
   ...
}
```

---

## So bleibt es erweiterbar

Wenn du später:

- Lesen lernen
- Silben klatschen
- Reimwörter
- Einmaleins
- Uhrzeit

hinzufügen willst:

Du brauchst nur:

- neuen Skill-Ordner
- Generator
- ggf. neue TaskTypes

Der Rest der Engine bleibt gleich.

---

# 📦 Neue MVP 1 Struktur (empfohlen)

```
/core
  sessionEngine.ts
  skillRegistry.ts
  taskRendererRegistry.ts
  difficulty.ts

/skills
  /quantity
     generators.ts
     difficulty.ts
  /makeTen
  /bridgeSubtract

/components
  /tasks
     TenFrameFlash.tsx
     DragFillTen.tsx
     CompareTask.tsx
```

---

# 🧠 Verbesserte Session-Engine

Neue Logik:

```
function generateSession(skillId, options) {
   const skill = SkillRegistry[skillId]
   const config = skill.getDifficultyConfig(options.difficulty)

   return Array.from({length: options.length}).map(() =>
       skill.generateTask(config)
   )
}
```

Optional:

- Anti-Repeat Mechanismus
- Weighted Task-Verteilung
- Performance-basierte Difficulty-Anpassung (später)

---

# ✨ UX-Verbesserungen für Version 2

### Kategorie-Auswahl klarer

Große Karten:

- Punkte zählen
- Zehner voll machen
- Minus über 10
- Mischtraining

### Fortschritt pro Kategorie anzeigen

Nicht globaler Score – sondern:

```
Punkte zählen:
  ⭐⭐☆☆
```

---

# 🚀 Konkrete Roadmap für die nächsten 2–3 Wochen

### Woche 1

- SkillRegistry einführen
- SessionEngine umbauen
- Difficulty pro Skill definieren
- Session-Länge variabel

### Woche 2

- Anti-Repeat
- Fortschritt pro Skill speichern
- UI-Verbesserung (Tablet optimiert)

### Optional Woche 3

- Elternbereich (Difficulty & Länge Default)
- Mischmodus
- Erste neue Mini-Variante pro Skill

---

# 🧩 Wichtigster Design-Entscheid jetzt

Willst du:

A) Difficulty komplett manuell einstellbar
oder
B) Manuell + Auto-Modus (passt sich Leistung an)

Für Kinder ist oft ideal:
→ Eltern können fix einstellen
→ Standard ist Auto
