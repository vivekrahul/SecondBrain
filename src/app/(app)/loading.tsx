export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-pulse-soft">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <span 
          className="material-symbols-outlined text-primary text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          psychiatry
        </span>
      </div>
      <p className="text-sm font-medium text-on-surface-variant tracking-wide">Loading...</p>

      {/* Skeleton cards */}
      <div className="w-full max-w-md px-8 mt-8 space-y-4">
        <div className="h-4 bg-surface-container rounded-full w-3/4" />
        <div className="h-4 bg-surface-container rounded-full w-1/2" />
        <div className="h-12 bg-surface-container rounded-xl w-full" />
        <div className="h-12 bg-surface-container rounded-xl w-full" />
        <div className="h-12 bg-surface-container rounded-xl w-full" />
      </div>
    </div>
  );
}
