import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";
import {
  loginApi,
  meApi,
} from "../../api/auth.api";

import {
  useDispatch,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  setCredentials,
} from "../../store/auth.store";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      // ======================================================
      // LOGIN
      // ======================================================

      const loginResponse =
        await loginApi({
          email: email.trim(),
          password,
        });

      const accessToken =
        loginResponse.data.accessToken;

      if (!accessToken) {
        throw new Error(
          "Access token was not returned by server",
        );
      }

      // ======================================================
      // GET CURRENT USER
      // IMPORTANT: SEND ACCESS TOKEN
      // ======================================================

    const meResponse =
  await meApi();

      const user =
        meResponse.data.user;

      // ======================================================
      // SAVE AUTH STATE
      // ======================================================

      dispatch(
        setCredentials({
          accessToken,
          user,
        }),
      );

      // ======================================================
      // ROLE-BASED REDIRECT
      // ======================================================

      if (user.role === "ADMIN") {
        navigate(
          "/admin/dashboard",
          {
            replace: true,
          },
        );

        return;
      }

      if (
        user.role ===
        "PROJECT_MANAGER"
      ) {
        navigate(
          "/manager/dashboard",
          {
            replace: true,
          },
        );

        return;
      }

      navigate(
        "/developer/dashboard",
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error(
        "Login flow failed:",
        error,
      );

      setError(
        "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ================================================= */}
        {/* LEFT SECTION */}
        {/* ================================================= */}

        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-slate-950" />

          <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-300/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Project
                <span className="text-indigo-200">
                  Hub
                </span>
              </h1>

              <p className="mt-1 text-sm text-indigo-200/70">
                Client project management
              </p>
            </div>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur">
                Real-time workspace
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-6xl">
                Manage projects.
                <br />
                Move work
                <br />
                forward.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-indigo-100/70">
                Keep your clients,
                projects, tasks and
                team activity in one
                connected workspace.
              </p>
            </div>

            <p className="text-xs text-indigo-200/50">
              Internal agency workspace
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT SECTION */}
        {/* ================================================= */}

        <section className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Project
                <span className="text-indigo-600">
                  Hub
                </span>
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Client project management
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access your
                  workspace.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="you@agency.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading
                    ? "Signing in..."
                    : "Sign in"}
                </button>
              </form>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-center text-xs leading-5 text-slate-400">
                  Secure access for authorized
                  agency team members.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;