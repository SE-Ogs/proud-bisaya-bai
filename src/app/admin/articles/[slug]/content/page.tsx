"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { LoadingOverlay } from "@/app/components/LoadingOverlay";
import AdminHeader from "@/app/components/AdminHeader";
import { CustomEditor } from "@/app/components/articleEditor/CustomEditor";
import type { CustomEditorData } from "@/app/components/articleEditor/CustomEditor";

export default function ArticleContentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const isEdit = slug !== "new";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<CustomEditorData>({
    content: [],
    root: { props: {} },
  });

  const [metadata, setMetadata] = useState<{
    title: string;
    slug: string;
    author: string;
    category: string;
    subcategory?: string;
    thumbnail_url?: string;
    category_slug: string;
    subcategory_slug?: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedMetadata = sessionStorage.getItem("articleMetadata");

      if (slug === "new") {
        if (savedMetadata) {
          setMetadata(JSON.parse(savedMetadata));
        } else {
          alert("No metadata found. Redirecting to metadata page.");
          router.push("/admin/articles/new/metadata");
        }
      } else {
        try {
          const res = await fetch(`/api/admin/articles/${slug}`);
          if (!res.ok) throw new Error("Failed to fetch article");

          const article = await res.json();

          if (savedMetadata) {
            setMetadata(JSON.parse(savedMetadata));
          } else {
            setMetadata({
              title: article.title,
              slug: article.slug,
              author: article.author,
              category: article.category,
              subcategory: article.subcategory,
              thumbnail_url: article.thumbnail_url,
              category_slug: article.category_slug,
              subcategory_slug: article.subcategory_slug,
            });
          }

          if (article.content) {
            try {
              const parsedContent =
                typeof article.content === "string"
                  ? JSON.parse(article.content)
                  : article.content;

              // Ensure the parsed content matches CustomEditorData structure
              if (parsedContent && Array.isArray(parsedContent.content)) {
                setData({
                  content: parsedContent.content,
                  root: parsedContent.root || { props: {} },
                });
              } else if (Array.isArray(parsedContent)) {
                // Handle case where content is just an array
                setData({
                  content: parsedContent,
                  root: { props: {} },
                });
              } else {
                setData({ content: [], root: { props: {} } });
              }
            } catch (e) {
              console.error("Failed to parse content:", e);
              setData({ content: [], root: { props: {} } });
            }
          }
        } catch (error: any) {
          console.error("Error fetching article:", error);
          alert(`Failed to load article: ${error.message}`);
          router.push("/admin/dashboard");
        }
      }
      setLoading(false);
    };

    loadData();
  }, [slug, router]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);

      await navigator.clipboard.writeText(imageUrl);
      alert(
        `Image uploaded successfully!\nURL copied to clipboard:\n${imageUrl}\n\nPaste this URL into the Image Block's "Image URL" field.`
      );
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (editorData: CustomEditorData) => {
    if (!metadata) {
      alert("Metadata not found");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: metadata.title,
        slug: metadata.slug,
        author: metadata.author,
        category: metadata.category,
        subcategory: metadata.subcategory || undefined,
        thumbnail_url: metadata.thumbnail_url || undefined,
        category_slug: metadata.category_slug,
        subcategory_slug: metadata.subcategory_slug || undefined,
        content: JSON.stringify(editorData),
      };

      let res;
      if (isEdit) {
        res = await fetch(`/api/admin/articles/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to save article");
      }

      alert(
        isEdit
          ? "Article updated successfully!"
          : "Article published successfully!"
      );
      sessionStorage.removeItem("articleMetadata");
      router.push("/admin/dashboard");
    } catch (e: any) {
      console.error("Save error:", e);
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <AdminHeader />

      {/* Header Section */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <button
          onClick={() => router.push(`/admin/articles/${slug}/metadata`)}
          className="text-blue-600 hover:underline text-sm mb-2 inline-block"
        >
          ← Back to Metadata
        </button>
        <h1 className="text-2xl text-black font-bold">
          {isEdit ? "Edit" : "Create"} Content: {metadata.title}
        </h1>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 How to add images:</strong> Click "Upload Image" button
            below, select your image, and the URL will be copied to your
            clipboard. Then paste it into the Image Block's "Image URL" field in
            the editor.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "📤 Upload Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Custom Editor */}
      <div className="flex-1">
        <CustomEditor data={data} onChange={setData} onPublish={handleSave} />
      </div>

      <LoadingOverlay
        saving={saving}
        uploading={uploading}
        uploadingThumbnail={false}
      />
    </div>
  );
}
