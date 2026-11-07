export function PanelSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden panel-border skeleton-manga ${className}`}>
      <div className="absolute inset-0 halftone opacity-30" />
    </div>
  );
}

export function GridSkeleton() {
  const heights = ["h-64", "h-96", "h-72", "h-80", "h-96", "h-64", "h-80", "h-72"];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {heights.map((h, i) => (
        <PanelSkeleton key={i} className={h} />
      ))}
    </div>
  );
}