const ROLE_ROUTES = {
  ADMINISTRADOR: "/panel",
  INSTRUCTOR: "/instructor",
  PARTICIPANTE: "/participante",
};

export function getRoleDestination(roles = []) {
  const availableRoles = new Set(
    Array.isArray(roles) ? roles.filter((role) => role in ROLE_ROUTES) : [],
  );

  if (availableRoles.has("ADMINISTRADOR")) {
    return ROLE_ROUTES.ADMINISTRADOR;
  }

  if (availableRoles.has("INSTRUCTOR")) {
    return ROLE_ROUTES.INSTRUCTOR;
  }

  if (availableRoles.has("PARTICIPANTE")) {
    return ROLE_ROUTES.PARTICIPANTE;
  }

  return "/";
}

export function getRoleRoute(role) {
  return ROLE_ROUTES[role] ?? "/";
}
