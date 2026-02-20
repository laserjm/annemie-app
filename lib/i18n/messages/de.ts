import type { MessageCatalog } from "@/lib/i18n/types"

export const deMessages: MessageCatalog = {
  "app.name": "Annemie",
  "app.tagline": "Lass uns Mathe machen!",
  "locale.label": "Sprache",
  "locale.de": "DE",
  "locale.en": "EN",

  "skill.balanced": "Bunt gemischt!",
  "skill.quantity": "Punkte zählen",
  "skill.makeTen": "Auf 10 ergänzen",
  "skill.bridgeSubtract": "Subtrahieren",

  "start.practiceQuestion": "Was willst du heute üben?",
  "start.lengthQuestion": "Wie lang soll die Runde sein?",
  "start.length.short": "Kurz (5)",
  "start.length.medium": "Mittel (10)",
  "start.length.long": "Lang (15)",
  "start.lastTime": "Letztes Mal",
  "start.lastScore": "{correct} von {total} richtig!",
  "start.go": "Los geht's!",

  "session.hint.level": "Tipp {level}",
  "session.hint.button.0": "Brauchst du einen Tipp?",
  "session.hint.button.1": "Noch ein Tipp?",
  "session.hint.button.2": "Keine Tipps mehr",

  "result.title": "Super gemacht!",
  "result.playAgain": "Nochmal spielen!",
  "result.changeSkill": "Thema wechseln",
  "result.encouragement.perfect": "Perfekt! Du bist ein Mathe-Star!",
  "result.encouragement.great": "Richtig stark! Du wirst immer besser!",
  "result.encouragement.good": "Gut gemacht! Mit etwas Uebung wird es noch besser!",
  "result.encouragement.try": "Toller Versuch! Mit jedem Mal wirst du staerker!",

  "task.quantity.prompt": "Wie viele Punkte hast du gesehen?",
  "task.quantity.getReady": "Mach dich bereit!",
  "task.quantity.pickAnswer": "Waehle jetzt deine Antwort!",
  "task.quantity.peekAgain": "Nochmal anschauen",
  "task.quantity.peekUsed": "Schon genutzt!",
  "task.quantity.hint1": "Achte auf Gruppen: erst bis 5, dann den Rest.",
  "task.quantity.hint2": "Nutze 5 + Rest. Zum Beispiel: 8 ist 5 und 3.",

  "task.makeTen.prompt": "Welche Zahl macht die 10 voll?",
  "task.makeTen.moreToTen": "Wie viele fehlen bis 10?",
  "task.makeTen.hint1": "Denk an 10 als 5 + 5. Wie weit bist du von 10 entfernt?",
  "task.makeTen.hint2": "Zaehle von {start} bis 10 an deinen Fingern hoch.",

  "task.bridgeSubtract.prompt": "Subtrahiere ueber die 10.",
  "task.bridgeSubtract.hint1": "Erst bis 10 wegnehmen, dann den Rest.",
  "task.bridgeSubtract.hint2": "{start} -> 10 nimmt {bridgeStep}. Danach nimm {leftover} weg.",

  "feedback.correct.1": "Super!",
  "feedback.correct.2": "Yeah!",
  "feedback.correct.3": "Wow!",
  "feedback.correct.4": "Bravo!",
  "feedback.correct.5": "Toll!",
  "feedback.incorrect.1": "Naechstes Mal!",
  "feedback.incorrect.2": "Fast!",
  "feedback.incorrect.3": "Versuch's nochmal!",
  "feedback.incorrect.4": "Weiter so!",
  "feedback.answerWas": "Es war {answer}",
}
