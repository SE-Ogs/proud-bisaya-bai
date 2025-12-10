"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface HeroBanner {
  id: string;
  image_url: string;
  subtitle?: string | null;
  is_active: boolean;
  updated_at: string;
}

export default function HeroBannerAdmin() {
  const [heroBanner, setHeroBanner] = useState<HeroBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [subtitle, setSubtitle] = useState("");

  const supabase = createClient();

  useEffect(() => {
    checkAdminStatus();
    fetchHeroBanner();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setIsAdmin(profile?.role === "admin");
    if (profile?.role !== "admin") {
      setLoading(false);
    }
  };

  const fetchHeroBanner = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_banner")
        .select(
          "id, image_url, is_active, updated_at, subtitle"
        )
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setHeroBanner(data);
      setPreviewUrl(data.image_url);
      setSubtitle(
        data.subtitle ||
          "Your daily guide to the best of Central Visayas."
      );
    } catch (error) {
      console.error("Error fetching hero banner:", error);
      setMessage("Error loading hero banner");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-banner-${Date.now()}.${fileExt}`;
      const filePath = `hero-banners/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      // ONLY update previewUrl, NOT heroBanner
      setPreviewUrl(publicUrl);
      setMessage("Image uploaded! Click 'Save Changes' to apply.");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setMessage(error.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!heroBanner) return;
    if (!subtitle.trim()) {
      setMessage("Please enter the hero subtitle before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("hero_banner")
        .update({
          image_url: previewUrl,
          subtitle: subtitle.trim(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq("id", heroBanner.id);

      if (error) throw error;
      
      // Update local state after successful save
      setHeroBanner({
        ...heroBanner,
        image_url: previewUrl,
        subtitle: subtitle.trim(),
        updated_at: new Date().toISOString(),
      });

      setMessage("Hero banner updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Error saving hero banner:", error);
      setMessage(error.message || "Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (heroBanner) {
      setPreviewUrl(heroBanner.image_url);
      setSubtitle(heroBanner.subtitle || "");
      setMessage("");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hero banner settings...</p>
        </div>
      </div>
    );
  }

  const hasChanges =
    previewUrl !== heroBanner?.image_url ||
    subtitle !== (heroBanner?.subtitle || "");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Hero Banner
            </h1>
            <p className="text-gray-600">
              Upload and change the background image for the homepage hero banner
            </p>
            {heroBanner?.updated_at && (
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(heroBanner.updated_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.includes("Error")
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-green-50 text-green-800 border border-green-200"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {message.includes("Error") ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <span>{message}</span>
            </div>
          )}

          {heroBanner && (
            <div className="space-y-6">
              {/* Image Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Banner Background Image
                </label>
                <div className="relative h-80 w-full mb-4 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={previewUrl}
                    alt="Hero Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  {hasChanges && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Unsaved Changes
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      "Choose New Image"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Recommended: 1920x1080px or larger</p>
                    <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hero Subtitle</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Your daily guide to the best of Central Visayas."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges || saving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Reset Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-sm"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}