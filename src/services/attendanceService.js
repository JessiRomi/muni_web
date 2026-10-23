import api from "../config/api";

const attendanceService = {
  async open(meetingId, startTime) {
    const { data } = await api.post("/attendance/open", {
      meetingId: Number(meetingId),
      startTime,
      endTime: new Date(
        new Date(startTime).getTime() + 30 * 60 * 1000,
      ).toISOString(),
    });

    return data;
  },

  async close(sessionId) {
    const { data } = await api.post("/attendance/close", {
      sessionId: Number(sessionId),
    });

    return data;
  },

  async checkIn(sessionId, latitude, longitude) {
    const { data } = await api.post("/attendance/checkin", {
      sessionId: Number(sessionId),
      latitude: Number(latitude),
      longitude: Number(longitude),
    });

    return data;
  },

  async getSessionByMeeting(meetingId) {
    const { data } = await api.get(
      `/attendance/meeting/${Number(meetingId)}/session`,
    );

    return data;
  },

  async getHistory(participantId) {
    const { data } = await api.get(
      `/attendance/history/${Number(participantId)}`,
    );

    return data;
  },
  
  async getSessionAttendances(sessionId) {
    const { data } = await api.get(
      `/attendance/session/${Number(sessionId)}/records`,
    );
    return data;
  },

  async processAbsences(sessionId) {
    const { data } = await api.post("/attendance/process-absences", {
      sessionId: Number(sessionId),
    });

    return data;
  },
};

export default attendanceService;
