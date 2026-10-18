import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserRound, GraduationCap, LogOut } from "lucide-react";
import { useEffect } from "react";
import { getRoleDestination } from "../../utils/roleNavigation";

import { useAuth } from "../../context/AuthContext";
import SiteFooter from "../../components/layout/SiteFooter";
import "../role-pages.css";

const roleOptions = [
  {
    role: "ADMINISTRADOR",
    title: "Administración",
    description: "Gestioná las actividades de la plataforma.",
    path: "/panel",
    icon: ShieldCheck,
  },
  {
    role: "PARTICIPANTE",
    title: "Participante",
    description: "Consultá actividades y tus inscripciones.",
    path: "/participante",
    icon: UserRound,
  },
  {
    role: "INSTRUCTOR",
    title: "Instructor",
    description: "Consultá tus actividades asignadas.",
    path: "/instructor",
    icon: GraduationCap,
  },
];

export default function RoleSelector() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const availableRoles = roleOptions.filter((option) =>
    user?.roles?.includes(option.role),
  );
  useEffect(() => {
    if (availableRoles.length <= 1) {
      navigate(getRoleDestination(user?.roles), { replace: true });
    }
  }, [availableRoles.length, user?.roles, navigate]);
  return (
    <div className="role-selector-page">
      <main className="role-selector-main">
        <span className="role-selector-eyebrow">
          MUNICIPALIDAD DE CIPOLLETTI
        </span>
        <h1>¿A qué espacio querés ingresar?</h1>
        <p>
          Tu cuenta tiene acceso a más de un área. Elegí cómo querés continuar.
        </p>
        <div className="role-selector-grid">
          {availableRoles.map(
            ({ role, title, description, path, icon: Icon }) => (
              <button
                className="role-selector-card"
                type="button"
                key={role}
                onClick={() => navigate(path)}
              >
                <Icon size={30} />
                <h2>{title}</h2>
                <p>{description}</p>
                <span>Ingresar</span>
              </button>
            ),
          )}
        </div>
        <button className="role-selector-logout" type="button" onClick={logout}>
          <LogOut size={19} />
          Cerrar sesión
        </button>
      </main>
      <SiteFooter />
    </div>
  );
}
