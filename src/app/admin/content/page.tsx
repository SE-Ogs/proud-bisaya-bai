"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

import AdminHeader from "@/app/components/AdminHeader";
import { DEFAULT_SERVICE_CARDS } from "@/data/servicesDefaults";
import type { ServiceCard } from "@/types/services";
import { RichTextEditor } from "@/app/components/articleEditor/ComponentsCustomEditor";

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
  const [aboutDescription, setAboutDescription] = useState("");
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [aboutSuccess, setAboutSuccess] = useState<string | null>(null);
  const [aboutInitialized, setAboutInitialized] = useState(false);
  const [teamMembers, setTeamMembers] = useState<
    Array<{
      id: string;
      photo_url: string | null;
      name: string;
      company_title: string | null;
      display_order: number;
      created_at?: string;
      updated_at?: string;
    }>
  >([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersSaving, setTeamMembersSaving] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null);
  const [teamMembersSuccess, setTeamMembersSuccess] = useState<string | null>(
    null
  );
  const [teamMembersInitialized, setTeamMembersInitialized] = useState(false);
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(
    null
  );
  const teamMemberFileInputRefs = useRef<{
    [key: string]: HTMLInputElement | null;
  }>({});

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

  async function fetchAboutContent(showSuccessMessage = false) {
    try {
      setAboutLoading(true);
      setAboutError(null);
      const res = await fetch("/api/admin/about-us-content");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const description = data?.description || "";
      // If description is plain text (no HTML tags), convert to HTML paragraphs
      let htmlDescription = "";
      if (description) {
        if (!description.includes("<") && !description.includes(">")) {
          // Plain text - convert to HTML paragraphs
          htmlDescription = description
            .split(/\n{2,}/)
            .filter((para: string) => para.trim().length > 0)
            .map((para: string) => `<p>${para.trim()}</p>`)
            .join("");
        } else {
          // Already HTML
          htmlDescription = description;
        }
      } else {
        // Empty - use placeholder
        htmlDescription = "<p>Start typing...</p>";
      }
      setAboutDescription(htmlDescription);
      setAboutSuccess(showSuccessMessage ? "About Us content reloaded." : null);
    } catch (error: any) {
      console.error("Failed to load About Us content", error);
      setAboutDescription("");
      setAboutError(error?.message || "Failed to load About Us content.");
    } finally {
      setAboutLoading(false);
      setAboutInitialized(true);
    }
  }

  async function fetchTeamMembers(showSuccessMessage = false) {
    try {
      setTeamMembersLoading(true);
      setTeamMembersError(null);
      const res = await fetch("/api/admin/team-members");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setTeamMembers(Array.isArray(data) ? data : []);
      setTeamMembersSuccess(
        showSuccessMessage ? "Team members reloaded." : null
      );
    } catch (error: any) {
      console.error("Failed to load team members", error);
      setTeamMembers([]);
      setTeamMembersError(error?.message || "Failed to load team members.");
    } finally {
      setTeamMembersLoading(false);
      setTeamMembersInitialized(true);
    }
  }

  useEffect(() => {
    if (activeTab === "about" && !aboutInitialized && !aboutLoading) {
      fetchAboutContent();
    }
    if (
      activeTab === "about" &&
      !teamMembersInitialized &&
      !teamMembersLoading
    ) {
      fetchTeamMembers();
    }
  }, [
    activeTab,
    aboutInitialized,
    aboutLoading,
    teamMembersInitialized,
    teamMembersLoading,
  ]);

  function handleAboutDescriptionChange(value: string) {
    setAboutDescription(value);
    setAboutSuccess(null);
  }

  async function handleSaveAboutDescription() {
    try {
      setAboutSaving(true);
      setAboutError(null);
      setAboutSuccess(null);

      const res = await fetch("/api/admin/about-us-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aboutDescription }),
      });

      const responseBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          responseBody.error || "Failed to save About Us content."
        );
      }

      setAboutSuccess("About Us description updated successfully.");
    } catch (error: any) {
      console.error("Failed to save About Us", error);
      setAboutError(error?.message || "Failed to save About Us content.");
    } finally {
      setAboutSaving(false);
    }
  }

  function handleTeamMemberFieldChange(
    id: string,
    field: "name" | "company_title" | "photo_url" | "display_order",
    value: string | number
  ) {
    setTeamMembers((prev) => {
      const updated = prev.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      );

      // Check for duplicate display_order if field is display_order
      if (field === "display_order" && typeof value === "number") {
        const duplicates = updated.filter(
          (m) => m.id !== id && m.display_order === value
        );
        if (duplicates.length > 0) {
          setTeamMembersError(
            `Display order ${value} is already used by another team member. Please use a unique number.`
          );
        } else {
          setTeamMembersError(null);
        }
      }

      return updated;
    });
    setTeamMembersSuccess(null);
  }

  async function handleAddTeamMember() {
    try {
      setTeamMembersSaving(true);
      setTeamMembersError(null);
      const maxOrder =
        teamMembers.length > 0
          ? Math.max(...teamMembers.map((m) => m.display_order))
          : -1;

      const res = await fetch("/api/admin/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Team Member",
          company_title: "",
          photo_url: "",
          display_order: maxOrder + 1,
        }),
      });

      const responseBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseBody.error || "Failed to add team member.");
      }

      setTeamMembers((prev) =>
        [...prev, responseBody].sort(
          (a, b) => a.display_order - b.display_order
        )
      );
      setTeamMembersSuccess("Team member added successfully.");
    } catch (error: any) {
      console.error("Failed to add team member", error);
      setTeamMembersError(error?.message || "Failed to add team member.");
    } finally {
      setTeamMembersSaving(false);
    }
  }

  async function handleSaveTeamMember(memberId: string) {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    // Check for duplicate display_order before saving
    const duplicate = teamMembers.find(
      (m) => m.id !== memberId && m.display_order === member.display_order
    );
    if (duplicate) {
      setTeamMembersError(
        `Cannot save: Display order ${member.display_order} is already used by "${duplicate.name}". Please use a unique number.`
      );
      return;
    }

    try {
      setTeamMembersSaving(true);
      setTeamMembersError(null);

      const res = await fetch("/api/admin/team-members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          name: member.name.trim(),
          company_title: member.company_title?.trim() || "",
          photo_url: member.photo_url?.trim() || "",
          display_order: member.display_order,
        }),
      });

      const responseBody = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseBody.error || "Failed to save team member.");
      }

      setTeamMembers((prev) =>
        prev
          .map((m) => (m.id === memberId ? responseBody : m))
          .sort((a, b) => a.display_order - b.display_order)
      );
      setTeamMembersSuccess("Team member updated successfully.");
    } catch (error: any) {
      console.error("Failed to save team member", error);
      setTeamMembersError(error?.message || "Failed to save team member.");
    } finally {
      setTeamMembersSaving(false);
    }
  }

  async function handleDeleteTeamMember(id: string) {
    if (!confirm("Delete this team member?")) return;

    try {
      setTeamMembersSaving(true);
      setTeamMembersError(null);

      const res = await fetch(`/api/admin/team-members?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const responseBody = await res.json().catch(() => ({}));
        throw new Error(responseBody.error || "Failed to delete team member.");
      }

      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      setTeamMembersSuccess("Team member deleted successfully.");
    } catch (error: any) {
      console.error("Failed to delete team member", error);
      setTeamMembersError(error?.message || "Failed to delete team member.");
    } finally {
      setTeamMembersSaving(false);
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Image upload failed");

    return data.url;
  };

  const handleTeamMemberImageUpload = async (
    memberId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageFor(memberId);
    try {
      const imageUrl = await uploadImage(file);
      handleTeamMemberFieldChange(memberId, "photo_url", imageUrl);
      setTeamMembersSuccess("Image uploaded successfully!");
    } catch (error: any) {
      setTeamMembersError(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImageFor(null);
      if (teamMemberFileInputRefs.current[memberId]) {
        teamMemberFileInputRefs.current[memberId]!.value = "";
      }
    }
  };

  function handleReloadAbout() {
    fetchAboutContent(true);
    fetchTeamMembers(true);
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
                    Edit the About Us description and manage team members.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReloadAbout}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={aboutLoading || teamMembersLoading}
                  >
                    {aboutLoading || teamMembersLoading
                      ? "Refreshing..."
                      : "Refresh"}
                  </button>
                </div>
              </div>

              {(aboutError || teamMembersError) && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {aboutError || teamMembersError}
                </div>
              )}

              {(aboutSuccess || teamMembersSuccess) && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {aboutSuccess || teamMembersSuccess}
                </div>
              )}

              {aboutLoading || teamMembersLoading ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
                  Loading About Us content...
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        About Us Description
                      </label>
                      <p className="mb-2 text-xs text-gray-500">
                        This text appears in the About Us section on your site.
                        Use the toolbar to format text (bold, italic,
                        underline).
                      </p>
                      <RichTextEditor
                        content={aboutDescription || "<p>Start typing...</p>"}
                        onChange={(html) => handleAboutDescriptionChange(html)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveAboutDescription}
                        className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                        disabled={aboutSaving || aboutLoading}
                      >
                        {aboutSaving ? "Saving..." : "Save Description"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Team Members
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Manage team members shown on the About Us page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                        disabled={teamMembersLoading || teamMembersSaving}
                      >
                        Add Team Member
                      </button>
                    </div>

                    <div className="space-y-4">
                      {teamMembers.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No team members yet. Add one to get started.
                        </p>
                      ) : (
                        teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="grid gap-4 md:grid-cols-[auto,1fr,1fr,auto,auto] items-start p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex flex-col items-center gap-2">
                              {member.photo_url ? (
                                <img
                                  src={member.photo_url}
                                  alt={member.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                  No Photo
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                ref={(el) => {
                                  teamMemberFileInputRefs.current[member.id] =
                                    el;
                                }}
                                onChange={(e) =>
                                  handleTeamMemberImageUpload(member.id, e)
                                }
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  teamMemberFileInputRefs.current[
                                    member.id
                                  ]?.click()
                                }
                                disabled={uploadingImageFor === member.id}
                                className="w-full text-xs rounded-lg bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                              >
                                {uploadingImageFor === member.id
                                  ? "Uploading..."
                                  : "Upload Image"}
                              </button>
                              <input
                                type="text"
                                placeholder="Photo URL"
                                value={member.photo_url || ""}
                                onChange={(e) =>
                                  handleTeamMemberFieldChange(
                                    member.id,
                                    "photo_url",
                                    e.target.value
                                  )
                                }
                                className="w-full text-xs rounded border border-gray-300 px-2 py-1"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) =>
                                  handleTeamMemberFieldChange(
                                    member.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-gray-700">
                                Company Title
                              </label>
                              <input
                                type="text"
                                value={member.company_title || ""}
                                onChange={(e) =>
                                  handleTeamMemberFieldChange(
                                    member.id,
                                    "company_title",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-semibold text-gray-700">
                                Display Order
                              </label>
                              <input
                                type="number"
                                value={member.display_order}
                                onChange={(e) =>
                                  handleTeamMemberFieldChange(
                                    member.id,
                                    "display_order",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className={`w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 ${
                                  teamMembers.some(
                                    (m) =>
                                      m.id !== member.id &&
                                      m.display_order === member.display_order
                                  )
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50"
                                    : "border-gray-300 focus:border-red-500 focus:ring-red-200"
                                }`}
                              />
                              {teamMembers.some(
                                (m) =>
                                  m.id !== member.id &&
                                  m.display_order === member.display_order
                              ) && (
                                <p className="mt-1 text-xs text-red-600">
                                  This display order is already used by another
                                  team member.
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 pt-6">
                              <button
                                type="button"
                                onClick={() => handleSaveTeamMember(member.id)}
                                className="rounded-lg bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
                                disabled={teamMembersSaving}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteTeamMember(member.id)
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
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
