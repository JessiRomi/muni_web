import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./LoginModal.css";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError("");
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      onSuccess?.();
    } catch (err) {
      if (err.response?.status === 401) {
        setError("El correo electrónico o la contraseña son incorrectos.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "No se pudo iniciar sesión. Intentá nuevamente.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="login-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <button
          className="login-close"
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Cerrar inicio de sesión"
        >
          <X size={21} />
        </button>

        <div className="login-heading">
          <span className="login-icon">
            <UserRound size={27} />
          </span>

          <span className="login-eyebrow">MUNICIPALIDAD DE CIPOLLETTI</span>

          <h2 id="login-title">Ingresá a tu cuenta</h2>

          <p>Accedé a tu espacio personal de actividades.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Correo electrónico</label>

          <div className="login-input-wrap">
            <UserRound size={18} aria-hidden="true" />

            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <label htmlFor="login-password">Contraseña</label>

          <div className="login-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />

            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Ingresá tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isSubmitting}
            />

            <button
              className="login-password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Ingresando..." : "Ingresar"}</span>

            {!isSubmitting && <ArrowRight size={19} />}
          </button>
        </form>

        <p className="login-footer">
          Plataforma de actividades · Municipalidad de Cipolletti
        </p>
      </section>
    </div>
  );
}
