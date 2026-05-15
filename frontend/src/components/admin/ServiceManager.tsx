"use client";

import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  BriefcaseMedical,
  Pencil,
  Plus,
  RefreshCcw,
} from "lucide-react";

import { ApiClientError } from "@/lib/api/client";

import {
  createService,
  listServices,
  updateService,
} from "@/lib/api/endpoints";

import { getSessionUser } from "@/lib/auth/session";

import type { ServiceItem } from "@/types/service";

export default function ServiceManager() {
  const router = useRouter();

  const [services, setServices] = useState<
    ServiceItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const [serviceId, setServiceId] =
    useState("");

  const [category, setCategory] =
    useState<ServiceItem["category"]>(
      "nursing_care"
    );

  const [serviceName, setServiceName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [price, setPrice] = useState("");

  const [
    requiredQualification,
    setRequiredQualification,
  ] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);

    setError(null);

    try {
      const data = await listServices();

      setServices(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to load services");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getSessionUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");

      return;
    }

    void loadServices();
  }, [router, loadServices]);

  function resetForm() {
    setServiceId("");

    setCategory("nursing_care");

    setServiceName("");

    setDescription("");

    setDuration("");

    setPrice("");

    setRequiredQualification("");
  }

  async function onSubmit(
    event: SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);

    setError(null);

    setSuccess(null);

    try {
      const payload = {
        category,

        serviceName: serviceName.trim(),

        description: description.trim(),

        duration: duration.trim(),

        price: Number(price),

        requiredQualification:
          requiredQualification.trim(),
      };

      if (
        !payload.serviceName ||
        !payload.description ||
        !payload.duration ||
        !payload.requiredQualification
      ) {
        setError("All fields are required.");

        return;
      }

      if (
        Number.isNaN(payload.price) ||
        payload.price < 0
      ) {
        setError(
          "Price must be a non-negative number."
        );

        return;
      }

      if (serviceId) {
        await updateService({
          serviceId,
          ...payload,
        });

        setSuccess(
          "Service updated successfully."
        );
      } else {
        await createService(payload);

        setSuccess(
          "Service created successfully."
        );
      }

      resetForm();

      await loadServices();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to save service");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(service: ServiceItem) {
    setServiceId(service.id);

    setCategory(service.category);

    setServiceName(service.serviceName);

    setDescription(service.description);

    setDuration(service.duration);

    setPrice(String(service.price));

    setRequiredQualification(
      service.requiredQualification
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-8">
      {/* FORM SECTION */}
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/3 backdrop-blur-xl">
        <div className="border-b border-white/10 px-7 py-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#ff6a3d]/15 p-3 text-[#ff6a3d]">
                  <BriefcaseMedical className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Service Management
                  </h2>

                  <p className="mt-1 text-[15px] text-white/45">
                    Create and manage
                    healthcare services across
                    the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-5 p-7 md:grid-cols-2"
        >
          {/* SERVICE NAME */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-white/60">
              Service Name
            </label>

            <input
              value={serviceName}
              onChange={(event) =>
                setServiceName(
                  event.target.value
                )
              }
              placeholder="Home Nursing Assistance"
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#ff6a3d]/60"
              required
            />
          </div>

          {/* DURATION */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              Duration
            </label>

            <input
              value={duration}
              onChange={(event) =>
                setDuration(event.target.value)
              }
              placeholder="2 Hours"
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#ff6a3d]/60"
              required
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              Price
            </label>

            <input
              type="number"
              min={0}
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              placeholder="2500"
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#ff6a3d]/60"
              required
            />
          </div>

          {/* QUALIFICATION */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">
              Required Qualification
            </label>

            <input
              value={requiredQualification}
              onChange={(event) =>
                setRequiredQualification(
                  event.target.value
                )
              }
              placeholder="Certified Nurse"
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#ff6a3d]/60"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-white/60">
              Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the service..."
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-[#ff6a3d]/60"
              required
            />
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6a3d] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />

              {submitting
                ? "Saving..."
                : serviceId
                ? "Update Service"
                : "Create Service"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-white/10 bg-white/4 px-6 py-4 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* SERVICES TABLE */}
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/3 backdrop-blur-xl">
        <div className="border-b border-white/10 px-7 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Current Services
              </h3>

              <p className="mt-1 text-[15px] text-white/45">
                Existing healthcare services
                available on the platform.
              </p>
            </div>

            <button
              onClick={() => void loadServices()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-7 py-16 text-center text-white/50">
            Loading services...
          </div>
        ) : null}

        {!loading && services.length === 0 ? (
          <div className="px-7 py-16 text-center text-white/50">
            No services available.
          </div>
        ) : null}

        {!loading && services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Service
                  </th>

                  <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Duration
                  </th>

                  <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Price
                  </th>

                  <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Qualification
                  </th>

                  <th className="px-7 py-5 text-left text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-white/6 transition hover:bg-white/2.5"
                  >
                    <td className="px-7 py-6">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {
                            service.serviceName
                          }
                        </p>

                        <p className="mt-1 max-w-sm text-xs leading-6 text-white/35">
                          {
                            service.description
                          }
                        </p>
                      </div>
                    </td>

                    <td className="px-7 py-6 text-sm text-white/70">
                      {service.duration}
                    </td>

                    <td className="px-7 py-6 text-sm font-semibold text-white">
                      ₹{service.price}
                    </td>

                    <td className="px-7 py-6 text-sm text-white/70">
                      {
                        service.requiredQualification
                      }
                    </td>

                    <td className="px-7 py-6">
                      <button
                        onClick={() =>
                          handleEdit(service)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/8 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}