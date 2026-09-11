interface TopbarProps {
  role?: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
}

const Topbar = ({ role }: TopbarProps) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">
          Welcome back
        </p>

        <h2 className="text-lg font-semibold text-slate-900">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          🔔
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            U
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              User
            </p>

            <p className="text-xs text-slate-500">
              {role ?? "USER"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;