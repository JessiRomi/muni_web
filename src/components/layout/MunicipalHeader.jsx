import { Landmark, LogOut } from "lucide-react";
import "./MunicipalHeader.css";

export default function MunicipalHeader({ onLogout }) {
  return (
    <header className="municipal-header">
      <div className="municipal-brand">
        <div className="municipal-brand-mark">
          <Landmark size={25} aria-hidden="true" />
        </div>

        <div className="municipal-brand-copy">
          <strong>MUNI CIPOLLETTI</strong>
          <span>Plataforma de actividades</span>
        </div>
      </div>

      <button
        className="municipal-header-logout"
        type="button"
        onClick={onLogout}
      >
        <LogOut size={19} aria-hidden="true" />
        Cerrar sesión
      </button>
    </header>
  );
}