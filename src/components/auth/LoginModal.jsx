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
import authService from "../../services/authService";
import "./LoginModal.css";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    clearMessages();
    setShowPassword(false);
    setPassword("");
  }

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
      setMode("login");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setError("");
      setSuccess("");
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await authService.register({
          firstName,
          lastName,
          phone,
          email,
          password,
        });

        setMode("login");
        setFirstName("");
        setLastName("");
        setPhone("");
        setPassword("");
        setShowPassword(false);
        setSuccess(
          "¡Tu cuenta fue creada! Ahora podés ingresar con tu correo y contraseña.",
        );
        return;
      }

      const authenticatedUser = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      onSuccess?.(authenticatedUser);
    } catch (err) {
      const message = err.response?.data?.message;

      if (err.response?.status === 401) {
        setError("El correo electrónico o la contraseña son incorrectos.");
      } else if (err.response?.status === 409) {
        setError("Ese correo electrónico ya está registrado.");
      } else {
        setError(
          (Array.isArray(message) ? message.join(". ") : message) ||
            err.message ||
            (isRegister
              ? "No se pudo crear la cuenta. Intentá nuevamente."
              : "No se pudo iniciar sesión. Intentá nuevamente."),
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
        className={`login-modal${isRegister ? " login-modal-register" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <button
          className="login-close"
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Cerrar ventana"
        >
          <X size={21} />
        </button>

        <div className="login-heading">
          <span className="login-icon">
            <UserRound size={27} />
          </span>

          <span className="login-eyebrow">MUNICIPALIDAD DE CIPOLLETTI</span>

          <h2 id="login-title">
            {isRegister ? "Creá tu cuenta" : "Ingresá a tu cuenta"}
          </h2>

          <p>
            {isRegister
              ? "Registrate para participar de las actividades."
              : "Accedé a tu espacio personal de actividades."}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="register-first-name">Nombre</label>
              <div className="login-input-wrap">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="register-first-name"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Tu nombre"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>

              <label htmlFor="register-last-name">Apellido</label>
              <div className="login-input-wrap">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="register-last-name"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Tu apellido"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>

              <label htmlFor="register-phone">
                Teléfono <span className="login-optional">(opcional)</span>
              </label>
              <div className="login-input-wrap">
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="2991234567"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={30}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          <label htmlFor="login-email">Correo electrónico</label>
          <div className="login-input-wrap">
            <UserRound size={18} aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus={!isRegister}
              disabled={isSubmitting}
            />
          </div>

          <label htmlFor="login-password">Contraseña</label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={
                isRegister ? "Mínimo 8 caracteres" : "Ingresá tu contraseña"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={isRegister ? 8 : undefined}
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

          {success && (
            <p className="login-success" role="status">
              {success}
            </p>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting
                ? isRegister
                  ? "Creando cuenta..."
                  : "Ingresando..."
                : isRegister
                  ? "Crear cuenta"
                  : "Ingresar"}
            </span>
            {!isSubmitting && <ArrowRight size={19} />}
          </button>
        </form>

        <div className="login-mode-switch">
          {isRegister ? (
            <p>
              ¿Ya tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => changeMode("login")}
                disabled={isSubmitting}
              >
                Ingresá acá
              </button>
            </p>
          ) : (
            <p>
              ¿Todavía no tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => changeMode("register")}
                disabled={isSubmitting}
              >
                Crear cuenta
              </button>
            </p>
          )}
        </div>

        <p className="login-footer">
          Plataforma de actividades · Municipalidad de Cipolletti
        </p>
      </section>
    </div>
  );
}
