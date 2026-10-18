function validateMeeting(meeting) {
  if (!meeting.dateTime || !meeting.location.trim()) {
    return "Completá la fecha, la hora y la ubicación.";
  }

  const dateTime = new Date(meeting.dateTime);

  if (Number.isNaN(dateTime.getTime())) {
    return "Ingresá una fecha y hora válidas.";
  }

  if (meeting.latitude.trim() === "" || meeting.longitude.trim() === "") {
    return "Completá la latitud y la longitud.";
  }

  const latitude = Number(meeting.latitude);
  const longitude = Number(meeting.longitude);
  const allowedRadius = Number(meeting.allowedRadius);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return "Ingresá coordenadas válidas.";
  }

  if (!Number.isFinite(allowedRadius) || allowedRadius <= 0) {
    return "El radio permitido debe ser mayor que cero.";
  }

  return "";
}

export { validateMeeting };
