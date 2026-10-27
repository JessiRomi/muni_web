import { MessageCircle } from "lucide-react";
import "./WhatsAppButton.css";

const WHATSAPP_NUMBER = "5492995015821";
const WHATSAPP_MESSAGE =
  "Hola, quisiera obtener información sobre las actividades y servicios de Muni Web.";

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`;

  return (
    <a
      className="whatsapp-float"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a Muni Web por WhatsApp"
      title="Consultanos por WhatsApp"
    >
      <MessageCircle size={27} strokeWidth={2.2} aria-hidden="true" />
      <span>¿Necesitás ayuda?</span>
    </a>
  );
}
