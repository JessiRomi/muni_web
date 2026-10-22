import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleDestination } from "../../utils/roleNavigation";
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowUpRight,
  UserRound,
  Users,
  CalendarDays,
  MapPin,
  Sparkles,
  Search,
  Landmark,
  Wrench,
} from "lucide-react";

import ActivityDetailModal from "./ActivityDetailModal";
import LoginModal from "../../components/auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import SiteFooter from "../../components/layout/SiteFooter";
import activitiesService from "../../services/activitiesService";
import "./Home.css";

const cardStyles = [
  {
    category: "CREÁ",
    image: "/images/arte.jpg",
    icon: Sparkles,
    className: "card-orange",
    shortDescription: "Explorá técnicas artísticas y creá algo propio.",
  },
  {
    category: "APRENDÉ",
    image: "/images/formacion.jpg",
    icon: Wrench,
    className: "card-teal",
    shortDescription: "Desarrollá nuevas habilidades y aprendé haciendo.",
  },
  {
    category: "ENCONTRATE",
    image: "/images/comunidad.jpg",
    icon: Users,
    className: "card-purple",
    shortDescription: "Compartí experiencias y conectá con tu comunidad.",
  },
];

function formatDate(value) {
  if (!value) return "Fecha a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Fecha a confirmar";
  }
  return date.toLocaleDateString("es-AR");
}
function getEnrollmentState(activity, now = Date.now()) {
  const start = new Date(activity.enrollmentStart).getTime();
  const end = new Date(activity.enrollmentEnd).getTime();

  if (
    !activity.enrollmentStart ||
    !activity.enrollmentEnd ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    return {
      label: "Inscripción no disponible",
      kind: "unknown",
    };
  }
  if (now < start) {
    return {
      label: "Inscripciones próximamente",
      kind: "pending",
    };
  }
  if (now > end) {
    return {
      label: "Inscripciones cerradas",
      kind: "expired",
    };
  }
  return {
    label: "Inscripciones abiertas",
    kind: "open",
  };
}

export default function Home({ darkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const [returnToActivity, setReturnToActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);

  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState("");
  const closeMenu = () => setMenuOpen(false);

  const loadPublicActivities = useCallback(async () => {
    setActivitiesLoading(true);
    setActivitiesError("");
    try {
      const data = await activitiesService.getPublic();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar actividades públicas:", error);
      setActivitiesError("No se pudieron cargar las actividades.");
    } finally {
      setActivitiesLoading(false);
    }
  }, []);
  useEffect(() => {
    loadPublicActivities();
  }, [loadPublicActivities]);

  const publicActivities = activities.filter(
    (activity) => activity.status === "ACTIVE",
  );

  function openGeneralLogin() {
    setSelectedActivity(null);
    setReturnToActivity(false);
    setLoginOpen(true);
    closeMenu();
  }

  function continueFromActivity() {
    if (isAuthenticated) return;
    setReturnToActivity(true);
    setLoginOpen(true);
  }

  function handleAuthButton() {
    closeMenu();
    if (isAuthenticated) {
      logout();
      setSelectedActivity(null);
      setReturnToActivity(false);
      setLoginOpen(false);
      return;
    }
    openGeneralLogin();
  }

  function handleLoginSuccess(authenticatedUser) {
    setLoginOpen(false);
    if (returnToActivity && selectedActivity) {
      setReturnToActivity(false);
      return;
    }
    setReturnToActivity(false);
    navigate(getRoleDestination(authenticatedUser?.roles));
  }

  function closeLogin() {
    setLoginOpen(false);
    setReturnToActivity(false);
  }
  return (
    <div className="home-page">
      <header className="site-header">
        <a
          className="brand"
          href="#inicio"
          onClick={closeMenu}
          aria-label="Muni Cipolletti, inicio"
        >
          <span className="brand-mark">
            <Landmark size={29} strokeWidth={2.2} />
          </span>
          <span className="brand-lockup">
            <strong>MUNI</strong>
            <small>C I P O L L E T T I</small>
          </span>
        </a>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`}>
          <a className="active" href="#propuestas" onClick={closeMenu}>
            Actividades
          </a>
          <a href="#inscripciones" onClick={closeMenu}>
            Mis inscripciones
          </a>
          <a href="#comunidad" onClick={closeMenu}>
            Sobre el programa
          </a>
          <button className="search-button" type="button" aria-label="Buscar">
            <Search size={22} />
          </button>

          <button
            className="theme-toggle"
            type="button"
            aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
            onClick={onToggleTheme}
          >
            {darkMode ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <button className="menu-cta" type="button" onClick={handleAuthButton}>
            {isAuthenticated ? <X size={18} /> : <UserRound size={18} />}
            <span>{isAuthenticated ? "CERRAR SESIÓN" : "INGRESAR"}</span>
            <ArrowUpRight size={19} />
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <img
            className="hero-background"
            src="/images/hero-comunidad.jpg"
            alt=""
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <span className="hero-label">MUNICIPALIDAD DE CIPOLLETTI</span>
            <h1>
              Aprendé algo nuevo.
              <br />
              <span>Encontrá tu lugar.</span>
            </h1>
            <p>Cursos, talleres y encuentros para toda la comunidad.</p>
            <a className="primary-button" href="#propuestas">
              Explorar actividades <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
        <section className="proposals" id="propuestas">
          <div className="proposals-inner">
            <div className="section-heading">
              <div>
                <span className="heading-line" />
                <h2>Descubrí tu próxima actividad</h2>
              </div>
              <p>
                Propuestas para aprender, crear y compartir
                <br className="desktop-break" /> en tu ciudad.
              </p>
              <a className="all-activities" href="#inscripciones">
                Ver todas las actividades <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="proposal-grid">
              {activitiesLoading && <p>Cargando actividades...</p>}
              {!activitiesLoading && activitiesError && (
                <div role="alert">
                  <p>{activitiesError}</p>
                  <button type="button" onClick={loadPublicActivities}>
                    Reintentar
                  </button>
                </div>
              )}
              {!activitiesLoading &&
                !activitiesError &&
                publicActivities.length === 0 && (
                  <p>Próximamente vas a encontrar nuevas actividades.</p>
                )}
              {!activitiesLoading &&
                !activitiesError &&
                publicActivities.map((activity, index) => {
                  const enrollmentState = getEnrollmentState(activity);
                  const style = cardStyles[index % cardStyles.length];
                  const Icon = style.icon;
                  const gradientId = `gradient-activity-${activity.id}`;
                  return (
                    <article
                      className={`proposal-card ${style.className}`}
                      key={activity.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver detalles de ${activity.name}`}
                      onClick={() => setSelectedActivity(activity)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedActivity(activity);
                        }
                      }}
                    >
                      <img className="card-photo" src={style.image} alt="" />
                      <svg
                        className="card-color-shape"
                        viewBox="0 0 500 270"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <defs>
                          <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="var(--color-start)" />
                            <stop offset="100%" stopColor="var(--color-end)" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 66 C0 27 29 0 68 0 H158 C198 0 211 15 228 48 C248 88 270 109 311 130 C348 149 385 164 421 180 C451 193 449 218 425 244 C410 260 390 270 360 270 H70 C28 270 0 246 0 207 Z"
                          fill={`url(#${gradientId})`}
                        />
                      </svg>
                      <div className="card-content">
                        <span className="card-icon">
                          <Icon size={23} strokeWidth={2.1} />
                        </span>
                        <div className="card-copy">
                          <span className="card-kicker">{style.category}</span>
                          <h3>{activity.name}</h3>
                          <p>{style.shortDescription}</p>
                        </div>
                        <div className="card-meta">
                          <span>
                            <CalendarDays size={15} aria-hidden="true" />
                            {activity.enrollmentStart
                              ? `Inscripción desde ${formatDate(activity.enrollmentStart)}`
                              : "Fecha a confirmar"}
                          </span>

                          <span
                            className={`card-enrollment-status card-enrollment-status--${enrollmentState.kind}`}
                            role="status"
                          >
                            {enrollmentState.label}
                          </span>

                          <span>
                            <MapPin size={15} aria-hidden="true" />
                            Cipolletti
                          </span>
                        </div>
                        <span className="card-arrow" aria-hidden="true">
                          <ArrowUpRight size={22} />
                        </span>
                      </div>
                    </article>
                  );
                })}
            </div>
          </div>
        </section>
        <section
          className="registration-anchor"
          id="inscripciones"
          aria-label="Inscripciones"
        >
          <span>Elegí una actividad y sumate.</span>
        </section>
      </main>
      <SiteFooter homeHref="#inicio" />
      <LoginModal
        isOpen={loginOpen}
        onClose={closeLogin}
        onSuccess={handleLoginSuccess}
      />
      {!loginOpen && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onContinue={continueFromActivity}
          isAuthenticated={isAuthenticated}
          user={user}
        />
      )}
    </div>
  );
}
