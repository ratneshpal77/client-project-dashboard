interface SidebarProps {
  role?: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
}

const Sidebar = ({ role }: SidebarProps) => {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <h1 className="text-xl font-bold text-slate-900">
          ProjectHub
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <a
          href="#"
          className="block rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900"
        >
          Dashboard
        </a>

        {(role === "ADMIN" ||
          role === "PROJECT_MANAGER") && (
          <>
            <a
              href="#"
              className="block rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
            >
              Projects
            </a>

            <a
              href="#"
              className="block rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
            >
              Clients
            </a>
          </>
        )}

        <a
          href="#"
          className="block rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
        >
          Tasks
        </a>

        <a
          href="#"
          className="block rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
        >
          Activity
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;