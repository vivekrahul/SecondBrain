export default function InsightsPage() {
  return (
    <>
      {/* Top Bar for Mobile */}
      <header className="bg-surface/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <span className="text-2xl font-black bg-gradient-to-br from-[#5f4ea5] to-[#b3a1ff] bg-clip-text text-transparent md:hidden">
            Second Brain
          </span>
        </div>
      </header>
      
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-primary">auto_awesome</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">Insights coming soon</h1>
        <p className="text-on-surface-variant max-w-md">
          We&apos;re building powerful AI insights to help you understand your patterns, focus, and productivity. Check back later!
        </p>
      </div>
    </>
  );
}
