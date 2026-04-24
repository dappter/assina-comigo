export type LeadStatusCanonical =
  | "Recebido"
  | "Em contato"
  | "Venda Fechada"
  | "Instalado"
  | "Pago"
  | "Cancelado";

export function normalizeLeadStatus(status?: string | null): LeadStatusCanonical {
  const raw = (status || "").trim().toLowerCase();

  switch (raw) {
    case "recebido":
    case "pendente":
    case "pending":
    case "":
      return "Recebido";
    case "em contato":
    case "em_contato":
    case "emcontato":
      return "Em contato";
    case "aceito":        // retrocompatibilidade com dados legados
    case "venda fechada":
      return "Venda Fechada";
    case "instalado":
      return "Instalado";
    case "pago":
      return "Pago";
    case "cancelado":
    case "nao viavel":
    case "não viável":
      return "Cancelado";
    default:
      return "Recebido";
  }
}
