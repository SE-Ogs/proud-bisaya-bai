"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArticleMetadataHeader } from "@/app/components/articleEditor/AdminMetadataHeader";
import { LoadingOverlay } from "@/app/components/LoadingOverlay";
import { CATEGORIES } from "@/app/components/Categories";
import AdminHeader from "@/app/components/AdminHeader";

export default function ArticleMetadataPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const isEdit = slug !== "new";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const [title, setTitle] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [readingTime, setReadingTime] = useState("");

  const availableSubcategories = category
    ? CATEGORIES[category as keyof typeof CATEGORIES] || []
    : [];

  useEffect(() => {
    if (isEdit) {
      fetchArticle(slug);
    } else {
      // For new articles, check if we have saved metadata from the previous session
      const savedMetadata = sessionStorage.getItem("articleMetadata");
      if (savedMetadata) {
        try {
          const parsed = JSON.parse(savedMetadata);
          setTitle(parsed.title || "");
          setArticleSlug(parsed.slug || "");
          setAuthor(parsed.author || "");
          setCategory(parsed.category || "");
          setSubcategory(parsed.subcategory || "");
          setThumbnail(parsed.thumbnail_url || "");
          setCategorySlug(parsed.category_slug || "");
          setSubcategorySlug(parsed.subcategory_slug || "");
          setReadingTime(parsed.reading_time || "");
        } catch (e) {
          console.error("Failed to parse saved metadata:", e);
        }
      }
      setLoading(false);
    }
  }, [slug, isEdit]);


  const fetchArticle = async (articleSlug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleSlug}`);
      if (!res.ok) throw new Error("Failed to fetch article");

      const article = await res.json();

      setTitle(article.title || "");
      setArticleSlug(article.slug || "");
      setAuthor(article.author || "");
      setCategory(article.category || "");
      setSubcategory(article.subcategory || "");
      setThumbnail(article.thumbnail_url || "");
      setCategorySlug(article.category_slug || "");
      setSubcategorySlug(article.subcategory_slug || "");
      setReadingTime(article.reading_time || "");
    } catch (error: any) {
      console.error("Error fetching article:", error);
      alert(`Failed to load article: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category && !availableSubcategories.includes(subcategory)) {
      setSubcategory("");
    }
  }, [category, subcategory, availableSubcategories]);

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

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const imageUrl = await uploadImage(file);
      setThumbnail(imageUrl);
      alert("Thumbnail uploaded successfully!");
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
    }
  };

  const generateSlug = () => {
    if (!isEdit) {
      const s = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setArticleSlug(s);
    }
  };

  const handleBackToDashboard = () => {
    // Clear all session storage when going back to dashboard
    sessionStorage.removeItem("articleMetadata");
    sessionStorage.removeItem("articleContent");
    router.push("/admin/dashboard");
  };

  const handleNext = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!articleSlug.trim()) {
      alert("Please enter a slug");
      return;
    }
    if (!author.trim()) {
      alert("Please enter an author name");
      return;
    }
    if (!category) {
      alert("Please select a category");
      return;
    }
    if (!readingTime.trim()) {
      alert("Please enter reading time");
      return;
    }

    // Validate reading time is a positive integer
    const readingTimeNum = parseInt(readingTime.trim());
    if (isNaN(readingTimeNum) || readingTimeNum <= 0 || readingTime.trim() !== readingTimeNum.toString()) {
      alert("Reading time must be a positive whole number (e.g., 5, 10, 15)");
      return;
    }

    setSaving(true);
    try {
      const metadata = {
        title: title.trim(),
        slug: articleSlug.trim(),
        author: author.trim(),
        category: category,
        subcategory: subcategory || undefined,
        thumbnail_url: thumbnail.trim() || undefined,
        category_slug: categorySlug,
        subcategory_slug: subcategorySlug,
        reading_time: readingTime.trim(),
      };

      // Keep metadata in sessionStorage - DON'T remove it
      sessionStorage.setItem("articleMetadata", JSON.stringify(metadata));

      const targetSlug = isEdit ? slug : "new";
      router.push(`/admin/articles/${targetSlug}/content`);
    } catch (e: any) {
      console.error("Error:", e);
      alert(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-w-screen overflow-y-hidden">
      <AdminHeader />
      <div className="flex-1 p-8 overflow-y-hidden">
        <ArticleMetadataHeader
          slug={isEdit ? slug : undefined}
          title={title}
          setTitle={setTitle}
          articleSlug={articleSlug}
          setArticleSlug={setArticleSlug}
          author={author}
          setAuthor={setAuthor}
          category={category}
          setCategory={setCategory}
          subcategory={subcategory}
          readingTime={readingTime}
          setReadingTime={setReadingTime}
          setSubcategory={setSubcategory}
          thumbnail={thumbnail}
          setThumbnail={setThumbnail}
          availableSubcategories={availableSubcategories}
          uploading={uploading}
          uploadingThumbnail={uploadingThumbnail}
          onGenerateSlug={generateSlug}
          onImageUploadClick={() => fileInputRef.current?.click()}
          onThumbnailUploadClick={() => thumbnailInputRef.current?.click()}
          fileInputRef={fileInputRef}
          thumbnailInputRef={thumbnailInputRef}
          onImageUpload={handleImageUpload}
          onThumbnailUpload={handleThumbnailUpload}
          categorySlug={categorySlug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")}
          setCategorySlug={setCategorySlug}
          subcategorySlug={subcategorySlug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")}
          setSubcategorySlug={setSubcategorySlug}
          onBackToDashboard={handleBackToDashboard}
        />
        <div className="bg-white">
          <LoadingOverlay
            saving={saving}
            uploading={uploading}
            uploadingThumbnail={uploadingThumbnail}
          />
        </div>
        <div className="flex justify-center gap-4 px-6 py-4 bg-white overflow-y-hidden ">
          <button
            onClick={handleNext}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-lg text-white px-27 py-4 rounded-lg font-medium transition disabled:opacity-50"
          >
            {saving
              ? "Processing..."
              : isEdit
                ? "Update & Continue"
                : "Next: Create Content"}
          </button>
        </div>
      </div>
    </div>
  );
}