type MapContainerProps = {
  query: string;
  title?: string;
  className?: string;
};

export function MapContainer({ query, title = "Map", className = "" }: MapContainerProps) {
  return (
    <div className={`overflow-hidden rounded-4xl border border-white/70 bg-white/60 shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl ${className}`}>
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`}
        className="h-[420px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
