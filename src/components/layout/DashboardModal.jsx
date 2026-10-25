import { X } from "lucide-react";
import "./DashboardModal.css";

export default function DashboardModal({
  eyebrow,
  title,
  description,
  onClose,
  closeButtonRef,
  children,
  labelledBy = "dashboard-modal-title",
  variant = "default",
}) {
  return (
    <div
      className="dashboard-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className={`dashboard-modal dashboard-modal--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <header className="dashboard-modal-heading">
          <div>
            {eyebrow && <span className="dashboard-eyebrow">{eyebrow}</span>}
            <h2 id={labelledBy}>{title}</h2>
            {description && <p>{description}</p>}
          </div>

          <button
            ref={closeButtonRef}
            className="dashboard-icon-button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {children}
      </section>
    </div>
  );
}
