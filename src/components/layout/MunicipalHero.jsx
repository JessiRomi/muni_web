import "./MunicipalHero.css";

export default function MunicipalHero({
  eyebrow,
  title,
  description,
  variant = "default",
}) {
  return (
    <section className={`municipal-hero municipal-hero--${variant}`}>
      <span className="municipal-hero-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
