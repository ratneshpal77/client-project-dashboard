import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  createClientApi,
  deleteClientApi,
  getClientApi,
  getClientsApi,
  updateClientApi,
  type Client,
  type CreateClientInput,
  type UpdateClientInput,
} from "../../api/client.api";

import { useSelector } from "react-redux";

import type { RootState } from "../../store/auth.store";

type Mode = "CREATE" | "EDIT";

const emptyForm: CreateClientInput = {
  name: "",
  email: "",
  company: "",
  phone: "",
};

const Clients = () => {
  const user = useSelector(
    (state: RootState) =>
      state.auth.user,
  );

  const isAdmin =
    user?.role === "ADMIN";

  const [clients, setClients] =
    useState<Client[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [isViewOpen, setIsViewOpen] =
    useState(false);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [formMode, setFormMode] =
    useState<Mode>("CREATE");

  const [form, setForm] =
    useState<CreateClientInput>(
      emptyForm,
    );

  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Client | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const fetchClients =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getClientsApi();

        setClients(
          response.data.clients,
        );
      } catch (err) {
        console.error(
          "Failed to load clients:",
          err,
        );

        setError(
          "Unable to load clients. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const filteredClients =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return clients;
      }

      return clients.filter(
        (client) =>
          client.name
            .toLowerCase()
            .includes(query) ||
          client.email
            .toLowerCase()
            .includes(query) ||
          client.company
            .toLowerCase()
            .includes(query) ||
          client.phone
            .toLowerCase()
            .includes(query),
      );
    }, [clients, search]);

  const openCreate = () => {
    setFormMode("CREATE");
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setFormMode("EDIT");

    setForm({
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone,
    });

    setSelectedClient(client);
    setFormError("");
    setIsFormOpen(true);
  };

  const openView = async (
    client: Client,
  ) => {
    try {
      setError("");

      const response =
        await getClientApi(client.id);

      setSelectedClient(
        response.data.client,
      );

      setIsViewOpen(true);
    } catch (err) {
      console.error(
        "Failed to load client:",
        err,
      );

      setError(
        "Unable to load client details.",
      );
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setFormError("");

      if (!form.name.trim()) {
        setFormError(
          "Client name is required.",
        );
        return;
      }

      if (!form.email.trim()) {
        setFormError(
          "Email is required.",
        );
        return;
      }

      if (!form.company.trim()) {
        setFormError(
          "Company is required.",
        );
        return;
      }

      if (!form.phone.trim()) {
        setFormError(
          "Phone number is required.",
        );
        return;
      }

      if (
        formMode === "CREATE"
      ) {
        const response =
          await createClientApi({
            name: form.name.trim(),
            email: form.email.trim(),
            company:
              form.company.trim(),
            phone: form.phone.trim(),
          });

        setClients(
          (current) => [
            response.data.client,
            ...current,
          ],
        );
      } else {
        if (!selectedClient) {
          return;
        }

        const input: UpdateClientInput =
          {
            name: form.name.trim(),
            email: form.email.trim(),
            company:
              form.company.trim(),
            phone: form.phone.trim(),
          };

        const response =
          await updateClientApi(
            selectedClient.id,
            input,
          );

        setClients(
          (current) =>
            current.map(
              (client) =>
                client.id ===
                selectedClient.id
                  ? response.data
                      .client
                  : client,
            ),
        );
      }

      setIsFormOpen(false);
      setSelectedClient(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(
        "Failed to save client:",
        err,
      );

      setFormError(
        "Unable to save client. Please check the details and try again.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setDeleteLoading(true);
        setError("");

        await deleteClientApi(
          deleteTarget.id,
        );

        setClients(
          (current) =>
            current.filter(
              (client) =>
                client.id !==
                deleteTarget.id,
            ),
        );

        setDeleteTarget(null);
      } catch (err) {
        console.error(
          "Failed to delete client:",
          err,
        );

        setError(
          "Unable to delete client.",
        );
      } finally {
        setDeleteLoading(false);
      }
    };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Client management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Clients
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Manage client relationships and view associated
              project information.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                void fetchClients()
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Refresh
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={openCreate}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                + Add Client
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Clients"
            value={clients.length}
            icon="C"
          />

          <SummaryCard
            label="Visible Results"
            value={
              filteredClients.length
            }
            icon="↗"
          />

          <SummaryCard
            label="With Projects"
            value={
              clients.filter(
                (client) =>
                  Boolean(
                    client.projects
                      ?.length,
                  ),
              ).length
            }
            icon="P"
          />
        </div>

        {/* Search */}
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Search clients
          </label>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search by name, company, email or phone..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Client list */}
        <section className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Client List
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing{" "}
                {filteredClients.length}{" "}
                of {clients.length} clients
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-xl bg-slate-100"
                  />
                ),
              )}
            </div>
          ) : filteredClients.length ===
            0 ? (
            <div className="px-5 py-16 text-center sm:px-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                C
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No clients found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredClients.map(
                (client) => (
                  <div
                    key={client.id}
                    className="p-5 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      {/* Client info */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-bold text-indigo-600">
                          {getInitials(
                            client.name,
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-slate-900">
                            {client.name}
                          </h3>

                          <p className="mt-1 truncate text-sm font-medium text-indigo-600">
                            {client.company}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                            <span>
                              {client.email}
                            </span>

                            <span>
                              {client.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void openView(
                              client,
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  client,
                                )
                              }
                              className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  client,
                                )
                              }
                              className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* ================================================== */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================================== */}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {formMode ===
                  "CREATE"
                    ? "Add Client"
                    : "Edit Client"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Enter the client's basic information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (formLoading) {
                    return;
                  }

                  setIsFormOpen(
                    false,
                  );
                  setSelectedClient(
                    null,
                  );
                }}
                className="text-xl leading-none text-slate-400 transition hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(event) =>
                void handleSubmit(
                  event,
                )
              }
              className="space-y-4 p-5 sm:p-6"
            >
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <FormField
                label="Client name"
                value={form.name}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    name: value,
                  }))
                }
                placeholder="e.g. Arjun Mehta"
              />

              <FormField
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    email: value,
                  }))
                }
                placeholder="e.g. arjun@techcorp.com"
              />

              <FormField
                label="Company"
                value={form.company}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    company: value,
                  }))
                }
                placeholder="e.g. TechCorp Solutions"
              />

              <FormField
                label="Phone"
                value={form.phone}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    phone: value,
                  }))
                }
                placeholder="e.g. 9876543210"
              />

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => {
                    setIsFormOpen(
                      false,
                    );
                    setSelectedClient(
                      null,
                    );
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formLoading
                    ? "Saving..."
                    : formMode ===
                        "CREATE"
                      ? "Create Client"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW MODAL */}
      {/* ================================================== */}

      {isViewOpen &&
        selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Client Details
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Complete client information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsViewOpen(
                      false,
                    );
                    setSelectedClient(
                      null,
                    );
                  }}
                  className="text-xl leading-none text-slate-400 transition hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-bold text-indigo-600">
                    {getInitials(
                      selectedClient.name,
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedClient.name}
                    </h3>

                    <p className="text-sm text-indigo-600">
                      {selectedClient.company}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Detail
                    label="Email"
                    value={
                      selectedClient.email
                    }
                  />

                  <Detail
                    label="Phone"
                    value={
                      selectedClient.phone
                    }
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Projects
                  </h4>

                  <div className="mt-3 space-y-2">
                    {selectedClient.projects &&
                    selectedClient
                      .projects.length >
                      0 ? (
                      selectedClient.projects.map(
                        (project) => (
                          <div
                            key={
                              project.id
                            }
                            className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              {
                                project.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Created{" "}
                              {formatDate(
                                project.createdAt,
                              )}
                            </p>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
                        No projects assigned to this client.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewOpen(
                      false,
                    );
                    setSelectedClient(
                      null,
                    );
                  }}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ================================================== */}
      {/* DELETE CONFIRMATION */}
      {/* ================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 font-bold text-red-600">
              !
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Delete client?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about to delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget.name}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={() =>
                  void handleDelete()
                }
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: string;
}

const SummaryCard = ({
  label,
  value,
  icon,
}: SummaryCardProps) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
          {icon}
        </span>
      </div>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FormFieldProps) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
};

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
};

const getInitials = (
  name: string,
) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "C";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

const formatDate = (
  date: string,
) => {
  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "Unknown";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

export default Clients;