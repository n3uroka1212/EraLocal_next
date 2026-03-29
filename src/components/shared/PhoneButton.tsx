interface PhoneButtonProps {
  phone: string;
  className?: string;
}

export function PhoneButton({ phone, className = "" }: PhoneButtonProps) {
  return (
    <a
      href={`tel:${phone}`}
      className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-3.5 rounded-button bg-green text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 ${className}`}
    >
      <span aria-hidden="true">📞</span>
      Appeler
    </a>
  );
}
