import {
  useSelector,
  useDispatch,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  logoutApi,
} from "../../api/auth.api";

import {
  clearAuth,
} from "../../store/auth.store";

import {
  disconnectSocket,
} from "../../services/socket";

import type {
  RootState,
} from "../../store/auth.store";

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(
    (state: RootState) =>
      state.auth.user,
  );

  const roleLabel: Record<
    NonNullable<typeof user>["role"],
    string
  > = {
    ADMIN: "Administrator",
    PROJECT_MANAGER:
      "Project Manager",
    DEVELOPER: "Developer",
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error(
        "Logout request failed:",
        error,
      );
    } finally {
      disconnectSocket();
      dispatch(clearAuth());
      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Account
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage your account information and
          session.
        </p>
      </div>

      {/* PROFILE */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-slate-900">
            Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current account information.
          </p>
        </div>

        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Name
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {user?.name || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email
            </p>

            <p className="mt-2 break-all text-sm font-semibold text-slate-900">
              {user?.email || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role
            </p>

            <span className="mt-2 inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              {user
                ? roleLabel[user.role]
                : "Not available"}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account status
            </p>

            <span className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>
      </section>

      {/* SESSION */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-slate-900">
            Session
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current authenticated session.
          </p>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Current session
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                You are currently signed in to
                ProjectHub.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Signed in
            </span>
          </div>
        </div>
      </section>

      {/* APPLICATION */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-base font-bold text-slate-900">
            Application
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            ProjectHub client project dashboard.
          </p>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              ProjectHub
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Real-time client project management
              with role-based access and live
              activity tracking.
            </p>
          </div>
        </div>
      </section>

      {/* LOGOUT */}
      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sign out
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign out from your current ProjectHub
              session.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 sm:w-auto"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 17l5-5-5-5"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12H3"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 19V5a2 2 0 00-2-2h-6"
              />
            </svg>

            Logout
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;