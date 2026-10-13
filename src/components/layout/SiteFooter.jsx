import { Landmark } from "lucide-react";

export default function SiteFooter({ homeHref = "/#inicio" }) {
  return (
    <footer className="site-footer">
      <a
        className="footer-brand"
        href={homeHref}
        aria-label="Muni Cipolletti, volver al inicio"
      >
        <Landmark size={23} aria-hidden="true" />
        MUNI CIPOLLETTI
      </a>
      <span>Desarrollado por Eugenia Mora y Jessica Conejero</span>
    </footer>
  );
}
