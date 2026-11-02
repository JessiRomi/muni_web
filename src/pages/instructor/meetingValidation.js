function validateMeeting(meeting) {
  if (!meeting.dateTime) {
    return "Completá la fecha y hora.";
  }

  const dateTime = new Date(meeting.dateTime);

  if (Number.isNaN(dateTime.getTime())) {
    return "Ingresá una fecha y hora válidas.";
  }

  if (dateTime <= new Date()) {
    return "La fecha y hora del encuentro deben ser futuras.";
  }

  const locationId = Number(meeting.locationId);

  if (!Number.isInteger(locationId) || locationId <= 0) {
    return "Seleccioná una ubicación.";
  }

  return "";
}

export { validateMeeting };