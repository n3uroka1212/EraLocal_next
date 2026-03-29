type OrderStatusType =
  | "pending"
  | "paid"
  | "preparing"
  | "ready"
  | "collected"
  | "cancelled";

interface StatusBadgeProps {
  status: OrderStatusType;
  className?: string;
}

const statusConfig: Record<
  OrderStatusType,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "En attente", bg: "bg-orange-light", text: "text-orange" },
  paid: { label: "Payee", bg: "bg-cyan/10", text: "text-cyan" },
  preparing: {
    label: "En preparation",
    bg: "bg-terra-light",
    text: "text-terra",
  },
  ready: { label: "Prete", bg: "bg-green-light", text: "text-green" },
  collected: { label: "Recuperee", bg: "bg-bg3", text: "text-text2" },
  cancelled: { label: "Annulee", bg: "bg-red-light", text: "text-red" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-input text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
