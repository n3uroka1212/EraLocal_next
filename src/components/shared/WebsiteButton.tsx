interface WebsiteButtonProps {
  url: string;
  className?: string;
}

export function WebsiteButton({ url, className = "" }: WebsiteButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-3.5 rounded-button bg-bg3 border-[1.5px] border-border text-text font-semibold text-sm transition-all duration-200 hover:border-terra hover:text-terra ${className}`}
    >
      <span aria-hidden="true">🌐</span>
      Site web
    </a>
  );
}
