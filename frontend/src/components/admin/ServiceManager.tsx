"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { createService, listServices, updateService } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import type { ServiceItem } from "@/types/service";

const CATEGORY_OPTIONS: { value: ServiceItem["category"]; label: string }[] = [
  { value: "nursing_care", label: "Nursing Care" },
  { value: "elderly_attendant", label: "Elderly Attendant" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "post_hospital_care", label: "Post-Hospital Care" },
];

export default function ServiceManager() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState("");
  const [category, setCategory] = useState<ServiceItem["category"]>("nursing_care");
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [requiredQualification, setRequiredQualification] = useState("");

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

    const timer = setTimeout(() => {
      void loadServices();
    }, 0);

    return () => clearTimeout(timer);
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
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
        requiredQualification: requiredQualification.trim(),
      };

      if (!payload.serviceName || !payload.description || !payload.duration || !payload.requiredQualification) {
        setError("All fields are required.");
        return;
      }

      if (Number.isNaN(payload.price) || payload.price < 0) {
        setError("Price must be a non-negative number.");
        return;
      }

      if (serviceId) {
        await updateService({ serviceId, ...payload });
        setSuccess("Service updated successfully.");
      } else {
        await createService(payload);
        setSuccess("Service created successfully.");
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
    setRequiredQualification(service.requiredQualification);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Service Management</h2>
        <p className="mt-1 text-sm text-slate-600">Create or update service offerings.</p>

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="serviceName">Service Name</label>
            <input
              id="serviceName"
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as ServiceItem["category"])}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="duration">Duration</label>
            <input
              id="duration"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="requiredQualification">Required Qualification</label>
            <input
              id="requiredQualification"
              value={requiredQualification}
              onChange={(event) => setRequiredQualification(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : serviceId ? "Update Service" : "Create Service"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Current Services</h3>
          <button onClick={() => void loadServices()} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            Refresh
          </button>
        </div>

        {loading ? <p className="mt-4 text-sm text-slate-600">Loading services...</p> : null}

        {!loading && services.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No services available.</p>
        ) : null}

        {!loading && services.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-600">
                  <th className="px-2 py-2 font-medium">Service</th>
                  <th className="px-2 py-2 font-medium">Category</th>
                  <th className="px-2 py-2 font-medium">Duration</th>
                  <th className="px-2 py-2 font-medium">Price</th>
                  <th className="px-2 py-2 font-medium">Qualification</th>
                  <th className="px-2 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 text-sm text-slate-800">{service.serviceName}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{service.category.replace("_", " ")}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{service.duration}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">Rs {service.price}</td>
                    <td className="px-2 py-3 text-sm text-slate-700">{service.requiredQualification}</td>
                    <td className="px-2 py-3 text-sm">
                      <button
                        onClick={() => handleEdit(service)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
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
