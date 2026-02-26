import type { InitiationAnswer } from "@/types/initiation";

const warmWords = ["oro", "cobre", "destello", "símbolo", "simbol", "brillo"];
const coolWords = ["plata", "acero", "noche", "bosque", "opacos", "densos"];

export function inferPieceRecommendation(answers: InitiationAnswer[]) {
  const joined = answers
    .map((answer) => answer.value.toLowerCase())
    .join(" ");

  const warmScore = warmWords.reduce(
    (score, word) => score + Number(joined.includes(word)),
    0,
  );
  const coolScore = coolWords.reduce(
    (score, word) => score + Number(joined.includes(word)),
    0,
  );

  if (warmScore >= coolScore + 2) {
    return "Fedora Solar de Oro";
  }

  if (coolScore >= warmScore + 2) {
    return "Homburg Noche de Plum";
  }

  return "Gaucho Ritual Equilibrio";
}

export function inferEnergyIntensity(answers: InitiationAnswer[]) {
  const textLength = answers.reduce((sum, item) => sum + item.value.length, 0);
  const punctuationImpact = answers.reduce(
    (sum, item) => sum + (item.value.match(/[!?.…]/g)?.length ?? 0),
    0,
  );

  const raw = Math.round(textLength / 180 + punctuationImpact / 4 + 4);
  return Math.max(1, Math.min(10, raw));
}

