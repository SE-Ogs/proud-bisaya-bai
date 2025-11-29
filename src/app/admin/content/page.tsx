"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import AdminHeader from "@/app/components/AdminHeader";
import { DEFAULT_SERVICE_CARDS } from "@/data/servicesDefaults";
import type { ServiceCard } from "@/types/services";
import type { AboutContent } from "@/types/about";
import { DEFAULT_ABOUT_CONTENT } from "@/data/aboutDefaults";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"services" | "about">("services");
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>(
    DEFAULT_SERVICE_CARDS
  );
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesSaving, setServicesSaving] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [servicesSuccess, setServicesSuccess] = useState<string | null>(null);
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [aboutSuccess, setAboutSuccess] = useState<string | null>(null);
  const [aboutInitialized, setAboutInitialized] = useState(false);

  useEffect(() => {
    if (!servicesInitialized && !servicesLoading) {
      fetchServiceCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateServiceId = () =>
    `service-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  async function fetchServiceCards(showSuccessMessage = false) {
    try {
      setServicesLoading(true);
      setServicesError(null);
      const res = await fetch("/api/services");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.services)
        ? data.services
        : [];

      setServiceCards(items.length > 0 ? items : DEFAULT_SERVICE_CARDS);
      setServicesSuccess(
        showSuccessMessage ? "Services reloaded from file." : null
      );
    } catch (error: any) {
      console.error("Failed to load services", error);
      setServiceCards(DEFAULT_SERVICE_CARDS);
      setServicesError(
        error?.message || "Failed to load services. Showing defaults."
      );
    } finally {
      setServicesLoading(false);
      setServicesInitialized(true);
    }
  }

  function handleServiceFieldChange(
    id: string,
    field: "title" | "description",
    value: string
  ) {
    setServiceCards((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
    setServicesSuccess(null);
  }

  function handleServiceFeaturesChange(id: string, rawValue: string) {
    const lines = rawValue.replace(/\r/g, "").split("\n");
    setServiceCards((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, features: lines } : service
      )
    );
    setServicesSuccess(null);
  }

  function handleAddServiceCard() {
    setServiceCards((prev) => [
      ...prev,
      {
        id: generateServiceId(),
        title: "New Service",
        description: "",
        features: [""],
      },
    ]);
    setServicesSuccess(null);
  }

  function handleRemoveServiceCard(id: string) {
    setServiceCards((prev) => prev.filter((service) => service.id !== id));
    setServicesSuccess(null);
  }

  async function handleSaveServiceCards() {
    try {
      setServicesSaving(true);
      setServicesError(null);
      setServicesSuccess(null);

      const payload = serviceCards.map((service, index) => {
        const safeId =
          typeof service.id === "string" && service.id.trim().length > 0
            ? service.id.trim()
            : `service-${index + 1}`;
        const sanitizedFeatures = service.features
          .map((feature) => feature.trim())
          .filter(Boolean);

        return {
          id: safeId,
          title: service.title.trim() || "Untitled Service",
          description: service.description.trim(),
          features: sanitizedFeatures,
        };
      });

      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: payload }),
      });

      const responseBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          responseBody.error || "Failed to save services changes."
        );
      }

      const saved = Array.isArray(responseBody)
        ? responseBody
        : Array.isArray(responseBody.services)
        ? responseBody.services
        : payload;

      setServiceCards(saved.length > 0 ? saved : DEFAULT_SERVICE_CARDS);
      setServicesSuccess("Services updated successfully.");
    } catch (error: any) {
      console.error("Failed to save services", error);
      setServicesError(error?.message || "Failed to save services.");
    } finally {
      setServicesSaving(false);
    }
  }

  function handleReloadServicesFromDisk() {
    fetchServiceCards(true);
  }

  async function fetchAbout(showSuccessMessage = false) {
    try {
      setAboutLoading(true);
      setAboutError(null);
      const res = await fetch("/api/about");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const content = data?.about ?? data;

      setAbout(content || DEFAULT_ABOUT_CONTENT);
      setAboutSuccess(
        showSuccessMessage ? "About Us content reloaded from file." : null
      );
    } catch (error: any) {
      console.error("Failed to load About Us content", error);
      setAbout(DEFAULT_ABOUT_CONTENT);
      setAboutError(
        error?.message || "Failed to load About Us. Showing defaults."
      );
    } finally {
      setAboutLoading(false);
      setAboutInitialized(true);
    }
  }

  useEffect(() => {
    if (activeTab === "about" && !aboutInitialized && !aboutLoading) {
      fetchAbout();
    }
  }, [activeTab, aboutInitialized, aboutLoading]);

  function handleAboutBodyChange(value: string) {
    setAbout((prev) => ({ ...prev, body: value }));
    setAboutSuccess(null);
  }

  function handleAboutAwardChange(
    id: string,
    field: "title" | "years",
    value: string
  ) {
    setAbout((prev) => ({
      ...prev,
      awards: prev.awards.map((award) =>
        award.id === id ? { ...award, [field]: value } : award
      ),
    }));
    setAboutSuccess(null);
  }

  function handleAddAward() {
    setAbout((prev) => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          id: `award-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: "New Award",
          years: "",
        },
      ],
    }));
    setAboutSuccess(null);
  }

  function handleRemoveAward(id: string) {
    setAbout((prev) => ({
      ...prev,
      awards: prev.awards.filter((award) => award.id !== id),
    }));
    setAboutSuccess(null);
  }

  async function handleSaveAbout() {
    try {
      setAboutSaving(true);
      setAboutError(null);
      setAboutSuccess(null);

      const trimmedBody = about.body.trim();
      const cleanedAwards = about.awards.map((award, index) => ({
        id:
          typeof award.id === "string" && award.id.trim().length > 0
            ? award.id.trim()
            : `award-${index + 1}`,
        title: award.title.trim() || "Untitled Award",
        years: award.years.trim() || "Year not set",
      }));

      const payload: AboutContent = {
        id: about.id || DEFAULT_ABOUT_CONTENT.id,
        body: trimmedBody || DEFAULT_ABOUT_CONTENT.body,
        awards: cleanedAwards,
      };

      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about: payload }),
      });

      const responseBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          responseBody.error || "Failed to save About Us content."
        );
      }

      const saved = responseBody?.about ?? payload;
      setAbout(saved);
      setAboutSuccess("About Us content updated successfully.");
    } catch (error: any) {
      console.error("Failed to save About Us", error);
      setAboutError(error?.message || "Failed to save About Us content.");
    } finally {
      setAboutSaving(false);
    }
  }

  function handleReloadAboutFromDisk() {
    fetchAbout(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 overflow-hidden">
      <AdminHeader />
      <div className="max-w-8xl mx-auto mt-4">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage static site content like Our Services and About Us.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 flex items-center justify-between">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("services")}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "services"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Our Services
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "about"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                About Us
              </button>
            </div>
          </div>

          {activeTab === "services" ? (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Our Services Cards
                  </h2>
                  <p className="text-sm text-gray-600">
                    Update the cards that appear on the Contact Us page.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddServiceCard}
                    className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={handleReloadServicesFromDisk}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={servicesLoading}
                  >
                    {servicesLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {servicesError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {servicesError}
                </div>
              )}

              {servicesSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {servicesSuccess}
                </div>
              )}

              {servicesLoading ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
                  Loading services...
                </div>
              ) : serviceCards.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
                  No service cards yet. Add one to get started.
                </div>
              ) : (
                <div className="space-y-5">
                  {serviceCards.map((service, index) => (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Card {index + 1}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {service.title || "Untitled Service"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceCard(service.id)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium ${
                            serviceCards.length <= 1
                              ? "cursor-not-allowed border-gray-200 text-gray-400"
                              : "border-red-200 text-red-600 hover:bg-red-50"
                          }`}
                          disabled={serviceCards.length <= 1}
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) =>
                              handleServiceFieldChange(
                                service.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Enter service title"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={service.description}
                            onChange={(e) =>
                              handleServiceFieldChange(
                                service.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Short supporting copy"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Features{" "}
                            <span className="text-xs font-normal text-gray-500">
                              (one per line)
                            </span>
                          </label>
                          <textarea
                            rows={5}
                            value={service.features.join("\n")}
                            onChange={(e) =>
                              handleServiceFeaturesChange(
                                service.id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="Add bullet points..."
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Empty lines are ignored on save.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Changes are saved to{" "}
                  <code className="font-mono text-[11px] text-gray-600">
                    data/services.json
                  </code>
                  .
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleReloadServicesFromDisk}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={servicesLoading || servicesSaving}
                  >
                    Discard Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveServiceCards}
                    className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                    disabled={servicesSaving || servicesLoading}
                  >
                    {servicesSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">About Us</h2>
                  <p className="text-sm text-gray-600">
                    Edit the static copy for your About Us section.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReloadAboutFromDisk}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={aboutLoading}
                  >
                    {aboutLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {aboutError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {aboutError}
                </div>
              )}

              {aboutSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {aboutSuccess}
                </div>
              )}

              {aboutLoading ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
                  Loading About Us content...
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        Main About Us Copy
                      </label>
                      <p className="mb-2 text-xs text-gray-500">
                        This text appears in the About Us section on your site.
                      </p>
                      <textarea
                        rows={10}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                        value={about.body}
                        onChange={(e) => handleAboutBodyChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Awards and Recognition
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Update the list of awards shown under your About Us
                          section.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAward}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                        disabled={aboutLoading || aboutSaving}
                      >
                        Add Award
                      </button>
                    </div>

                    <div className="space-y-4">
                      {about.awards.map((award) => (
                        <div
                          key={award.id}
                          className="grid gap-3 md:grid-cols-[2fr,1fr,auto] items-start"
                        >
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                              Award Title
                            </label>
                            <input
                              type="text"
                              value={award.title}
                              onChange={(e) =>
                                handleAboutAwardChange(
                                  award.id,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                              Years
                            </label>
                            <input
                              type="text"
                              value={award.years}
                              onChange={(e) =>
                                handleAboutAwardChange(
                                  award.id,
                                  "years",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                          </div>
                          <div className="pt-6 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveAward(award.id)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium ${
                                about.awards.length <= 1
                                  ? "cursor-not-allowed border-gray-200 text-gray-400"
                                  : "border-red-200 text-red-600 hover:bg-red-50"
                              }`}
                              disabled={about.awards.length <= 1}
                            >
                              <X className="h-3 w-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                      About Us content is saved to{" "}
                      <code className="font-mono text-[11px] text-gray-600">
                        data/about.json
                      </code>
                      .
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleReloadAboutFromDisk}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={aboutLoading || aboutSaving}
                      >
                        Discard Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAbout}
                        className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                        disabled={aboutSaving || aboutLoading}
                      >
                        {aboutSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
