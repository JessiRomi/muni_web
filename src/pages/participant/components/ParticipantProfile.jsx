import SharedProfile from "./SharedProfile";

export default function ParticipantProfile(props) {
  return <SharedProfile {...props} currentRole="PARTICIPANTE" />;
}
