
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save, UserRound, UserCheck, UserX } from "lucide-react";
import usersService from "../../../services/usersService";
import "./UserManagement.css";

const OPTIONAL_ROLES = ["INSTRUCTOR", "ADMINISTRADOR"];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roleChanges, setRoleChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await usersService.getAll();
      const userList = Array.isArray(data) ? data : [];

      setUsers(userList);

      const initialRoles = {};
      userList.forEach((user) => {
        initialRoles[user.id] = user.roles || ["PARTICIPANTE"];
      });

      setRoleChanges(initialRoles);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleRoleChange(userId, role, checked) {
    setRoleChanges((current) => {
      const currentRoles = current[userId] || ["PARTICIPANTE"];

      const updatedRoles = checked
        ? [...currentRoles, role]
        : currentRoles.filter((item) => item !== role);

      return {
        ...current,
        [userId]: ["PARTICIPANTE", ...updatedRoles.filter(
          (item) => item !== "PARTICIPANTE"
        )],
      };
    });
  }

  async function handleSaveRoles(user) {
    setError("");
    setSuccess("");
    setSavingId(user.id);

    try {
      const updatedUser = await usersService.updateRoles(
        user.id,
        roleChanges[user.id]
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? updatedUser : item
        )
      );

      setSuccess(`Roles de ${user.firstName} actualizados correctamente.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudieron actualizar los roles."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleStatus(user) {
    const newStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const action = newStatus === "ACTIVE" ? "activar" : "desactivar";

    const confirmed = window.confirm(
      `¿Querés ${action} la cuenta de ${user.firstName} ${user.lastName}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setUpdatingStatusId(user.id);

    try {
      const updatedUser = await usersService.updateStatus(
        user.id,
        newStatus
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? updatedUser : item
        )
      );

      setSuccess(`Estado de ${user.firstName} actualizado correctamente.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo actualizar el estado del usuario."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <section className="user-management">
      <div className="user-management-heading">
        <div>
          <span className="user-management-eyebrow">
            ADMINISTRACIÓN
          </span>
          <h3>Usuarios registrados</h3>
          <p>Gestioná los roles y el estado de las cuentas.</p>
        </div>

        <button
          type="button"
          className="dashboard-button dashboard-button--secondary"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      {error && (
        <p className="user-management-message user-management-message--error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="user-management-message user-management-message--success" role="status">
          {success}
        </p>
      )}

      {loading ? (
        <div className="user-management-empty">
          Cargando usuarios...
        </div>
      ) : users.length === 0 ? (
        <div className="user-management-empty">
          No hay usuarios registrados.
        </div>
      ) : (
        <div className="user-management-list">
          {users.map((user) => (
            <article className="user-management-card" key={user.id}>
              <div className="user-management-info">
                <div className="user-management-avatar">
                  <UserRound size={22} />
                </div>

                <div>
                  <h4>
                    {user.firstName} {user.lastName}
                  </h4>
                  <p>{user.email}</p>
                  <span className={`user-management-status user-management-status--${user.status?.toLowerCase()}`}>
                    {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className="user-management-roles">
                <span>Roles</span>

                <label>
                  <input type="checkbox" checked disabled />
                  PARTICIPANTE
                </label>

                {OPTIONAL_ROLES.map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={(roleChanges[user.id] || []).includes(role)}
                      onChange={(event) =>
                        handleRoleChange(
                          user.id,
                          role,
                          event.target.checked
                        )
                      }
                    />
                    {role}
                  </label>
                ))}

                <button
                  type="button"
                  className="dashboard-button dashboard-button--secondary"
                  onClick={() => handleSaveRoles(user)}
                  disabled={savingId === user.id}
                >
                  <Save size={16} />
                  {savingId === user.id ? "Guardando..." : "Guardar roles"}
                </button>
              </div>

              <div className="user-management-actions">
                <button
                  type="button"
                  className={`dashboard-button ${
                    user.status === "ACTIVE"
                      ? "dashboard-button--danger"
                      : "dashboard-button--success"
                  }`}
                  onClick={() => handleToggleStatus(user)}
                  disabled={updatingStatusId === user.id}
                >
                  {user.status === "ACTIVE" ? (
                    <UserX size={16} />
                  ) : (
                    <UserCheck size={16} />
                  )}

                  {updatingStatusId === user.id
                    ? "Actualizando..."
                    : user.status === "ACTIVE"
                      ? "Desactivar cuenta"
                      : "Activar cuenta"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
