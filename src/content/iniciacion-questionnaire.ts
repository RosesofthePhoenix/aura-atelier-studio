export const ritualPreludeText =
  "Bienvenida al Aura Initiation... donde tu luz se revela.";

export const sacredWalkLines = [
  "Cruzas el umbral cuando la ciudad se vuelve susurro.",
  "Aquí no respondes: te revelas.",
  "Cada palabra despierta una forma dormida en el taller.",
  "Val escucha la vibración antes que la voz.",
] as const;

export const ritualIntakeFields = [
  {
    id: "email",
    label: "Email",
    placeholder: "tu@email.com",
    required: true,
  },
  {
    id: "instagram_handle",
    label: "Instagram username/handle",
    placeholder: "@tuusuario",
    required: false,
  },
] as const;

export const ritualSections = [
  {
    id: "diseno_gusto_visual",
    title: "1ra parte diseño/gusto visual",
    questions: [
      "¿Te inclinas por una pieza limpia y silenciosa o por símbolos visibles que cuentan una historia?",
      "¿Los colores que te dan identidad / atracción para la pieza ideal serían ?",
      "¿Te atraen más las texturas suaves y etéreas o las estructuras firmes y arquitectónicas?",
      "¿Brillo sutil o destello protagonista?",
      "¿Metales cálidos (oro, cobre) o fríos (plata, acero)?",
      "¿Piedras translúcidas o minerales opacos y densos?",
      "¿Te inclinas más por lo minimalista o por lo simbólicamente cargado?",
    ],
  },
  {
    id: "introspeccion",
    title: "2da parte Introspección que acompaña a la pieza",
    questions: [
      "•¿Que es lo que te activa?",
      "•¿Te has puesto a pensar si te sientes más cómodo en un día con luminosidad o en la noche profunda estrellada ?",
      "¿Si te atrae más el mar y la arena o el bosque y su profundidad inmersa?",
      "¿Si el mundo está basado en destino trazado o en números guías como ayuda?",
      "Los recuerdos memorables que encienden una luz emergente sobre ti, que cada que lo piensas solo existe eso… luz.",
      "Cualquier elemento o sugerencia es esencial Para poder conocerte un poco más y poder materializar en arte tu esencia.",
    ],
  },
] as const;

export const ritualQuestionFlatList = ritualSections.flatMap((section, sectionIndex) =>
  section.questions.map((question, questionIndex) => ({
    id: `q-${sectionIndex + 1}-${questionIndex + 1}`,
    sectionId: section.id,
    sectionTitle: section.title,
    prompt: question,
  })),
);

export const ritualStepDisplayTotal = 23;

