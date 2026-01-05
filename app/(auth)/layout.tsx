export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-50 gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 mb-4">
            <span className="text-white font-display font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-800">CareSync</h1>
          <p className="text-slate-500 mt-1">Shared home support planner</p>
        </div>

        {/* Auth content */}
        <div className="card-elevated p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
