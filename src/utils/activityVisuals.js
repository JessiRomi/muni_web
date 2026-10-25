const activityVisuals = [
  {
    keywords: ["tejido", "tejer", "lana", "crochet"],
    label: "Tejido",
    image: "/images/tejido.png",
  },
  {
    keywords: ["ceramica", "alfareria"],
    label: "Cerámica",
    image: "/images/ceramica.png",
  },
  {
    keywords: ["arte", "pintura", "pintar", "dibujo", "creatividad"],
    label: "Taller de arte",
    image: "/images/taller-arte.png",
  },
  {
    keywords: ["encuentro municipal", "comunidad", "reunion"],
    label: "Encuentro municipal",
    image: "/images/encuentro-municipal.png",
  },
];

const fallbackVisual = {
  label: "Actividad municipal",
  image: "/images/encuentro-municipal.png",
};

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getActivityVisual(activity = {}) {
  const text = normalizeText(
    `${activity.name || ""} ${activity.description || ""}`,
  );

  return (
    activityVisuals.find((visual) =>
      visual.keywords.some((keyword) => text.includes(normalizeText(keyword))),
    ) || fallbackVisual
  );
}
