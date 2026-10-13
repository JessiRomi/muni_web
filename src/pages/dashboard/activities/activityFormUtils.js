export function validateActivityForm(form, user) {
  if (!user?.roles?.includes("ADMINISTRADOR")) {
    return "No tenés permisos para crear actividades.";
  }
  
  if (
    !form.name.trim() ||
    !form.enrollmentStart ||
    !form.enrollmentEnd ||
    !form.responsibleId
  ) {
   
    return "Completá todos los campos obligatorios.";
  }
 
  const start = new Date(form.enrollmentStart);
  const end = new Date(form.enrollmentEnd);
  
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
   
    return "La fecha de finalización debe ser posterior al inicio.";
  }
  
  const capacity = Number(form.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    return "La capacidad debe ser un número entero mayor que cero.";
  }
  return "";
}

export function prepareActivityData(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    capacity: Number(form.capacity),
    enrollmentStart: new Date(form.enrollmentStart).toISOString(),
    enrollmentEnd: new Date(form.enrollmentEnd).toISOString(),
    responsibleId: Number(form.responsibleId),
  };
}
