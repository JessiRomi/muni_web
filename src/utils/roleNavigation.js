const ROLE_ROUTES = {
  ADMINISTRADOR: "/panel",
  PARTICIPANTE: "/participante",
  INSTRUCTOR: "/instructor",
};

export function getRoleDestination(roles = []) {
  const availableRoles = [...new Set(roles)].filter((role) =>
    Object.hasOwn(ROLE_ROUTES, role),
  );
  if (availableRoles.length === 0) return "/";
  if (availableRoles.length > 1) return "/elegir-rol";
  return ROLE_ROUTES[availableRoles[0]];
}

export function getRoleRoute(role) {
  return ROLE_ROUTES[role] ?? "/";
}
