// Shown the moment a link is tapped, while the next page loads, so the app never looks frozen.
export function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true" aria-label="Loading">
      <div className="h-20 rounded-[var(--radius)] bg-black/80" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-36 rounded-[var(--radius)] border border-line bg-white" />)}
      </div>
    </div>
  );
}
