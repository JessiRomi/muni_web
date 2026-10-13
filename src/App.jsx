import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
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
  Clock3,
  UsersRound,
} from "lucide-react";

import LoginModal from "./components/auth/LoginModal";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/dashboard/Dashboard";
import activitiesService from "./services/activitiesService";
import "./App.css";
import "./ActivityDetailModal.css";

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

function getErrorMessage(error) {
  const message = error.response?.data?.message;

  return Array.isArray(message)
    ? message.join(". ")
    : message || error.message || "No se pudo completar la inscripción.";
}

function ActivityDetailModal({
  activity,
  onClose,
  onContinue,
  isAuthenticated,
  user,
}) {
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [enrollmentError, setEnrollmentError] = useState(false);

  useEffect(() => {
    setEnrolling(false);
    setEnrollmentMessage("");
    setEnrollmentError(false);
  }, [activity?.id]);

  useEffect(() => {
    if (!activity) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !enrolling) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activity, onClose, enrolling]);

  if (!activity) return null;

  async function handleEnroll() {
    if (!isAuthenticated) {
      onContinue();
      return;
    }

    if (
      !user?.id ||
      !user.roles?.includes("PARTICIPANTE") ||
      !Number.isSafeInteger(Number(user.id)) ||
      Number(user.id) <= 0
    ) {
      setEnrollmentError(true);
      setEnrollmentMessage(
        "Se necesita un usuario válido con el rol PARTICIPANTE para inscribirse.",
      );
      return;
    }

    setEnrolling(true);
    setEnrollmentMessage("");
    setEnrollmentError(false);

    try {
      await activitiesService.enroll(activity.id, Number(user.id));

      setEnrollmentMessage("¡Ya estás inscripto en esta actividad!");
    } catch (error) {
      console.error("Error al inscribirse:", error);
      setEnrollmentMessage(getErrorMessage(error));
      setEnrollmentError(true);
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div
      className="activity-detail-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !enrolling) {
          onClose();
        }
      }}
    >
      <section
        className="activity-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
      >
        <button
          className="activity-detail-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          disabled={enrolling}
        >
          <X size={22} />
        </button>

        <span className="activity-detail-kicker">DETALLE DE LA ACTIVIDAD</span>

        <h2 id="activity-detail-title">{activity.name || "Actividad"}</h2>

        <p className="activity-detail-description">
          {activity.description || "Conocé esta propuesta de la comunidad."}
        </p>

        <div className="activity-detail-info">
          <div>
            <CalendarDays size={19} aria-hidden="true" />
            <span>
              <strong>Inicio de inscripción</strong>
              {formatDate(activity.enrollmentStart)}
            </span>
          </div>

          <div>
            <Clock3 size={19} aria-hidden="true" />
            <span>
              <strong>Fin de inscripción</strong>
              {formatDate(activity.enrollmentEnd)}
            </span>
          </div>

          {activity.capacity != null && (
            <div>
              <UsersRound size={19} aria-hidden="true" />
              <span>
                <strong>Capacidad</strong>
                {activity.capacity} personas
              </span>
            </div>
          )}

          <div>
            <MapPin size={19} aria-hidden="true" />
            <span>
              <strong>Ubicación</strong>
              Cipolletti
            </span>
          </div>
        </div>

        {enrollmentMessage && (
          <p
            role={enrollmentError ? "alert" : "status"}
            aria-live="polite"
            style={{
              marginTop: "1rem",
              color: enrollmentError ? "#b42318" : "#16803c",
            }}
          >
            {enrollmentMessage}
          </p>
        )}

        <button
          className="activity-detail-cta"
          type="button"
          onClick={handleEnroll}
          disabled={enrolling || Boolean(enrollmentMessage && !enrollmentError)}
        >
          {enrolling
            ? "Inscribiendo..."
            : !isAuthenticated
              ? "Ingresar para continuar"
              : enrollmentMessage && !enrollmentError
                ? "Inscripción confirmada"
                : "Inscribirme"}

          <ArrowUpRight size={19} />
        </button>

        <p className="activity-detail-note">
          La inscripción está sujeta a la disponibilidad de cupos y al período
          establecido para cada actividad.
        </p>
      </section>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
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

  function handleLoginSuccess() {
    setLoginOpen(false);

    if (returnToActivity && selectedActivity) {
      setReturnToActivity(false);
      return;
    }

    setReturnToActivity(false);
    navigate("/panel");
  }

  function closeLogin() {
    setLoginOpen(false);
    setReturnToActivity(false);
  }

  return (
    <div className={`app ${darkMode ? "theme-dark" : "theme-light"}`}>
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
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <button className="menu-cta" type="button" onClick={openGeneralLogin}>
            <UserRound size={18} />
            <span>INGRESAR</span>
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
                            <CalendarDays size={15} />
                            {activity.enrollmentStart
                              ? `Inscripción desde ${formatDate(
                                  activity.enrollmentStart,
                                )}`
                              : "Fecha a confirmar"}
                          </span>

                          <span>
                            <MapPin size={15} />
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

        <section className="community-section" id="comunidad">
          <div className="community-inner">
            <div>
              <span className="heading-line" />

              <span className="section-kicker">
                CULTURA, ENCUENTRO, COMUNIDAD
              </span>

              <h2>Tu lugar está acá.</h2>

              <p>
                Encontrá propuestas para aprender, compartir y participar de la
                vida de tu ciudad.
              </p>
            </div>

            <a className="primary-button" href="#inscripciones">
              Conocé las actividades <ArrowUpRight size={20} />
            </a>
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

      <footer className="site-footer">
        <a className="footer-brand" href="#inicio">
          <Landmark size={23} /> MUNI CIPOLLETTI
        </a>

        <span>Desarrollado por Eugenia Mora y Jessica Conejero</span>
      </footer>

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

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/panel"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
