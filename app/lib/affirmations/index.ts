import { secondPersonLinesNL, firstPersonLinesNL } from "./nl";
import { secondPersonLinesEN, firstPersonLinesEN } from "./en";

export type Language = "nl" | "en";

function getLanguageLines(language: Language) {
  if (language === "nl") {
    return {
      secondPerson: secondPersonLinesNL,
      firstPerson: firstPersonLinesNL,
    };
  }

  return {
    secondPerson: secondPersonLinesEN,
    firstPerson: firstPersonLinesEN,
  };
}

export function buildSession(language: Language) {
  const lines = getLanguageLines(language);

  return {
    secondPerson: lines.secondPerson,
    firstPerson: lines.firstPerson,
  };
}