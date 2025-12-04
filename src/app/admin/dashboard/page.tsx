"use client";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Star, Bell, Pencil } from "lucide-react";
import AdminHeader from "@/app/components/AdminHeader";
import { detectVideoPlatform, getVideoEmbedUrl } from "@/lib/utils/videos";
import VideoCard from "@/app/components/VideoCard";
import HeroBannerAdmin from "@/app/components/HeroBannerAdmin";

type Article = {
  id: string;
  slug: string;
  title: string;
  author?: string;
  category?: string;
  subcategory?: string;
  created_at?: string;
  updated_at?: string;
  thumbnail_url?: string;
  status?: string;
  isPublished?: boolean;
  isArchived?: boolean;
  isEditorsPick?: boolean;
  isBreakingNews?: boolean;
};

type Video = {
  id: string;
  title: string;
  url: string;
  platform: "youtube" | "facebook" | "tiktok";
  thumbnail_url?: string | null;
  isFeatured?: boolean;
  created_at?: string;
};

type FacebookLiveSettings = {
  fb_url: string;
  fb_embed_url: string;
  is_active: boolean;
};

type ToggleSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleSwitch({ checked, disabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
        disabled
          ? "bg-gray-200 border-gray-300 cursor-not-allowed opacity-60"
          : checked
          ? "bg-green-500 border-green-600"
          : "bg-gray-300 border-gray-400"
      }`}
      aria-pressed={checked}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  //filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [createdDateFrom, setCreatedDateFrom] = useState("");
  const [createdDateTo, setCreatedDateTo] = useState("");
  const [updatedDateFrom, setUpdatedDateFrom] = useState("");
  const [updatedDateTo, setUpdatedDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [videosInitialized, setVideosInitialized] = useState(false);
  const [videoValidationError, setVideoValidationError] = useState<
    string | null
  >(null);
  const [articleValidationError, setArticleValidationError] = useState<
    string | null
  >(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    url: "",
    platform: "",
    thumbnail_url: "",
  });
  const [videoFormLoading, setVideoFormLoading] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingVideoTitle, setEditingVideoTitle] = useState("");
  const [editingVideoLoading, setEditingVideoLoading] = useState(false);
  const [uploadingVideoThumbnail, setUploadingVideoThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [facebookLive, setFacebookLive] = useState<FacebookLiveSettings | null>(
    null
  );
  const [facebookLiveLoading, setFacebookLiveLoading] = useState(false);
  const [facebookLiveError, setFacebookLiveError] = useState<string | null>(
    null
  );
  const [showFacebookLiveForm, setShowFacebookLiveForm] = useState(false);
  
  // Helper to check if current tab is hero-banner
  const isHeroBannerTab = activeTab === "hero-banner";
  const isVideosTab = activeTab === "videos";
  const isArticlesTab = !isVideosTab && !isHeroBannerTab;

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (activeTab === "videos" && !videosInitialized && !videosLoading) {
      fetchVideos();
    }
    if (activeTab !== "videos") {
      setShowVideoForm(false);
      setShowFacebookLiveForm(false);
    }
  }, [activeTab, videosInitialized, videosLoading]);

  async function fetchArticles() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/articles");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON from server");
      }

      // Parse the articles and ensure boolean values for the status fields
      let articlesArray: Article[] = [];

      if (Array.isArray(data)) {
        articlesArray = data;
      } else if (Array.isArray(data.articles)) {
        articlesArray = data.articles;
      } else if (Array.isArray(data.data)) {
        articlesArray = data.data;
      }

      // Ensure boolean values for the status fields
      const normalizedArticles = articlesArray.map((article) => ({
        ...article,
        isEditorsPick: Boolean(article.isEditorsPick),
        isBreakingNews: Boolean(article.isBreakingNews),
        isPublished: Boolean(article.isPublished),
        isArchived: Boolean(article.isArchived),
      }));

      setArticles(normalizedArticles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVideos() {
    try {
      setVideosLoading(true);
      setVideosError(null);

      const res = await fetch("/api/admin/videos");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setVideos(Array.isArray(data) ? data : []);
      setVideosInitialized(true);
    } catch (err: any) {
      setVideosError(err.message);
    } finally {
      setVideosLoading(false);
    }
  }

  async function fetchFacebookLive() {
    try {
      setFacebookLiveLoading(true);
      setFacebookLiveError(null);

      const res = await fetch("/api/admin/facebook-live");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      setFacebookLive({
        fb_url: data.fb_url || "",
        fb_embed_url: data.fb_embed_url || "",
        is_active: Boolean(data.is_active),
      });
    } catch (err: any) {
      setFacebookLiveError(
        err.message || "Failed to load Facebook Live settings"
      );
    } finally {
      setFacebookLiveLoading(false);
    }
  }

  const uploadVideoThumbnailImage = async (file: File): Promise<string> => {
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

  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  async function handleCreateVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!videoForm.title.trim() || !videoForm.url.trim()) {
      alert("Please provide both title and URL.");
      return;
    }

    const wordCount = countWords(videoForm.title);
    if (wordCount > 50) {
      alert(
        `Video title must be 50 words or less. Current: ${wordCount} words.`
      );
      return;
    }

    const autoPlatform =
      videoForm.platform || detectVideoPlatform(videoForm.url);
    if (!autoPlatform) {
      alert("Could not detect video platform. Please select one.");
      return;
    }

    if (
      (autoPlatform === "facebook" || autoPlatform === "tiktok") &&
      !videoForm.thumbnail_url.trim()
    ) {
      alert(
        `Please upload or paste a thumbnail URL for ${autoPlatform} videos.`
      );
      return;
    }

    try {
      setVideoFormLoading(true);
      setVideosError(null);
      const payload: Record<string, any> = {
        title: videoForm.title.trim(),
        url: videoForm.url.trim(),
        platform: autoPlatform,
      };

      if (videoForm.thumbnail_url.trim()) {
        payload.thumbnail_url = videoForm.thumbnail_url.trim();
      }

      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to add video");
      }

      const newVideo = await res.json();
      setVideos((prev) => [newVideo, ...prev]);
      setVideoForm({ title: "", url: "", platform: "", thumbnail_url: "" });
      setShowVideoForm(false); //hide form after success
    } catch (err: any) {
      setVideosError(err.message);
      alert(err.message);
    } finally {
      setVideoFormLoading(false);
    }
  }

  async function handleToggleVideoActive(video: Video) {
    // Clear any previous validation errors
    setVideoValidationError(null);
  }

  async function handleToggleVideoFeatured(video: Video) {
    // Clear any previous validation errors
    setVideoValidationError(null);

    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !video.isFeatured }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update video");
      }

      const updated = await res.json();
      setVideos((prev) =>
        prev.map((item) => (item.id === video.id ? updated : item))
      );
      setVideoValidationError(null);
    } catch (err: any) {
      setVideoValidationError(err.message);
    }
  }

  async function handleDeleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete video");
      }

      setVideos((prev) => prev.filter((video) => video.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleSaveFacebookLive(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!facebookLive) return;

    const trimmedUrl = facebookLive.fb_url.trim();
    if (!trimmedUrl) {
      alert("Please paste a valid Facebook live URL.");
      return;
    }

    try {
      setFacebookLiveLoading(true);
      setFacebookLiveError(null);

      const res = await fetch("/api/admin/facebook-live", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fb_url: trimmedUrl,
          is_active: facebookLive.is_active,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save Facebook Live settings");
      }

      const saved = await res.json();

      setFacebookLive({
        fb_url: saved.fb_url,
        fb_embed_url: saved.fb_embed_url,
        is_active: Boolean(saved.is_active),
      });

      alert("Facebook Live settings saved!");
    } catch (err: any) {
      setFacebookLiveError(err.message);
      alert(err.message);
    } finally {
      setFacebookLiveLoading(false);
    }
  }

  async function handleToggleFacebookLive() {
    if (!facebookLive) return;

    const newActiveState = !facebookLive.is_active;

    // If turning ON and we don't have data yet, fetch first
    if (newActiveState && !facebookLive.fb_url) {
      try {
        await fetchFacebookLive();
      } catch (err: any) {
        alert("Failed to load Facebook Live settings");
        return;
      }
    }

    try {
      setFacebookLiveLoading(true);
      setFacebookLiveError(null);

      const res = await fetch("/api/admin/facebook-live", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fb_url: facebookLive.fb_url || "",
          is_active: newActiveState,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update live status");
      }

      const saved = await res.json();
      setFacebookLive({
        fb_url: saved.fb_url,
        fb_embed_url: saved.fb_embed_url,
        is_active: Boolean(saved.is_active),
      });
    } catch (err: any) {
      setFacebookLiveError(err.message);
      alert(err.message);
    } finally {
      setFacebookLiveLoading(false);
    }
  }

  const startEditingVideo = (video: Video) => {
    setEditingVideoId(video.id);
    setEditingVideoTitle(video.title);
  };

  const cancelEditingVideo = () => {
    setEditingVideoId(null);
    setEditingVideoTitle("");
  };

  const handleVideoThumbnailUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingVideoThumbnail(true);
    try {
      const url = await uploadVideoThumbnailImage(file);
      setVideoForm((prev) => ({ ...prev, thumbnail_url: url }));
      alert("Thumbnail uploaded successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingVideoThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
    }
  };

  async function handleSaveVideoTitle() {
    if (!editingVideoId) return;
    if (!editingVideoTitle.trim()) {
      alert("Title is required.");
      return;
    }

    const wordCount = countWords(editingVideoTitle);
    if (wordCount > 50) {
      alert(
        `Video title must be 50 words or less. Current: ${wordCount} words.`
      );
      return;
    }
    try {
      setEditingVideoLoading(true);
      const res = await fetch(`/api/admin/videos/${editingVideoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingVideoTitle.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update video");
      }
      const updated = await res.json();
      setVideos((prev) =>
        prev.map((video) =>
          video.id === updated.id ? { ...video, title: updated.title } : video
        )
      );
      cancelEditingVideo();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEditingVideoLoading(false);
    }
  }

  // Helper function to update a single article in state
  const updateArticleInState = (slug: string, updates: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.slug === slug ? { ...article, ...updates } : article
      )
    );
  };

  async function handlePublish(slug: string) {
    if (!confirm("Publish this article?")) return;
    try {
      const res = await fetch(`/api/admin/articles/${slug}/publish`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to publish");

      // Update state optimistically
      updateArticleInState(slug, {
        isPublished: true,
        isArchived: false,
        status: "published",
      });
    } catch (err: any) {
      alert(err.message);
      // Refresh to get correct state from server
      fetchArticles();
    }
  }

  async function handleUnpublish(slug: string) {
    if (!confirm("Unpublish this article? It will return to pending status."))
      return;
    try {
      const res = await fetch(`/api/admin/articles/${slug}/unpublish`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to unpublish");

      // Update state optimistically
      updateArticleInState(slug, {
        isPublished: false,
        isArchived: false,
        status: "pending",
      });
    } catch (err: any) {
      alert(err.message);
      fetchArticles();
    }
  }

  async function handleArchive(slug: string) {
    if (!confirm("Archive this article?")) return;
    try {
      const res = await fetch(`/api/admin/articles/${slug}/archive`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to archive");

      // Update state optimistically
      updateArticleInState(slug, {
        isArchived: true,
        isPublished: false,
      });
    } catch (err: any) {
      alert(err.message);
      fetchArticles();
    }
  }

  async function handleDeleteArticle(slug: string) {
    if (
      !confirm(
        "Permanently delete this archived article? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete article");
      }

      setArticles((prev) =>
        prev.filter((article) => (article.slug ? article.slug !== slug : true))
      );
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleUnarchive(slug: string) {
    if (
      !confirm("Unarchive this article? It will return to its previous state.")
    )
      return;
    try {
      const res = await fetch(`/api/admin/articles/${slug}/unarchive`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to unarchive");

      // Refresh to get the correct previous state
      fetchArticles();
    } catch (err: any) {
      alert(err.message);
      fetchArticles();
    }
  }

  async function handleToggleEditorsPick(
    slug: string,
    currentStatus: boolean = false
  ) {
    const newStatus = !currentStatus;

    // Clear any previous validation errors
    setArticleValidationError(null);

    // If trying to favorite, check if there are already 3 favorited posts
    if (newStatus) {
      const currentFavoritedCount = articles.filter(
        (a) => a.isEditorsPick && a.slug !== slug
      ).length;

      // Check if adding this one would exceed the limit of 3
      if (currentFavoritedCount >= 3) {
        setArticleValidationError(
          "Cannot favorite this post. You can only have a maximum of 3 favorited posts. Please remove a favorited post first before favoriting this one."
        );
        return;
      }
    }

    // Optimistic update
    updateArticleInState(slug, { isEditorsPick: newStatus });

    try {
      const res = await fetch(`/api/admin/articles/${slug}/editors-pick`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEditorsPick: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update editor's pick status");

      // Get response data and update state with server response
      const data = await res.json();

      // refresh articles and sync state
      if (newStatus) {
        await fetchArticles();
      } else {
        // just update this article with the server response
        updateArticleInState(slug, {
          isEditorsPick: Boolean(data.isEditorsPick),
          updated_at: data.updated_at,
        });
      }
      setArticleValidationError(null);
    } catch (err: any) {
      // Revert optimistic update on error
      updateArticleInState(slug, { isEditorsPick: currentStatus });
      setArticleValidationError(err.message);
      // Revert on error
      updateArticleInState(slug, { isEditorsPick: currentStatus });
    }
  }

  async function handleToggleBreakingNews(
    slug: string,
    currentStatus: boolean = false
  ) {
    const newStatus = !currentStatus;

    // Clear any previous validation errors
    setArticleValidationError(null);

    // If trying to mark as breaking news, check if there are already 10 breaking news posts
    if (newStatus) {
      const currentBreakingNewsCount = articles.filter(
        (a) => a.isBreakingNews && a.slug !== slug
      ).length;

      // Check if adding this one would exceed the limit of 10
      if (currentBreakingNewsCount >= 10) {
        setArticleValidationError(
          "Cannot mark this post as breaking news. You can only have a maximum of 10 breaking news posts. Please remove a breaking news post first before marking this one as breaking news."
        );
        return;
      }
    }

    // Optimistic update
    updateArticleInState(slug, { isBreakingNews: newStatus });

    try {
      const res = await fetch(`/api/admin/articles/${slug}/breaking-news`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isBreakingNews: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update breaking news status");

      const data = await res.json();

      // refresh articles and sync state
      if (newStatus) {
        await fetchArticles();
      } else {
        // just update this article with the server response
        updateArticleInState(slug, {
          isBreakingNews: Boolean(data.isBreakingNews),
          updated_at: data.updated_at,
        });
      }
      setArticleValidationError(null);
    } catch (err: any) {
      // Revert on error
      updateArticleInState(slug, { isBreakingNews: currentStatus });
      setArticleValidationError(err.message);
    }
  }

  const categories = Array.from(
    new Set(articles.map((a) => a.category).filter(Boolean))
  ).sort();
  const subcategories = Array.from(
    new Set(articles.map((a) => a.subcategory).filter(Boolean))
  ).sort();

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setCreatedDateFrom("");
    setCreatedDateTo("");
    setUpdatedDateFrom("");
    setUpdatedDateTo("");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedSubcategory ||
    createdDateFrom ||
    createdDateTo ||
    updatedDateFrom ||
    updatedDateTo;

  const normalize = (value?: string) => value?.toLowerCase().trim();
  const isVideoArticle = (article: Article) => {
    const category = normalize(article.category);
    const subcategory = normalize(article.subcategory);
    const status = normalize(article.status);
    return (
      category === "videos" ||
      subcategory === "videos" ||
      status === "videos" ||
      status === "video"
    );
  };

  const matchesActiveTab = (article: Article) => {
    if (activeTab === "pending") {
      return !article.isPublished && !article.isArchived;
    }
    if (activeTab === "archived") {
      return !!article.isArchived;
    }
    if (activeTab === "published") {
      return !!article.isPublished && !article.isArchived;
    }
    if (activeTab === "videos") {
      return isVideoArticle(article);
    }
    return true;
  };

  const filteredArticles = articles.filter((article) => {
    if (!matchesActiveTab(article)) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = article.title?.toLowerCase().includes(query);
      const matchesAuthor = article.author?.toLowerCase().includes(query);
      const matchesCategory = article.category?.toLowerCase().includes(query);
      const matchesSubcategory = article.subcategory
        ?.toLowerCase()
        .includes(query);

      if (
        !matchesTitle &&
        !matchesAuthor &&
        !matchesCategory &&
        !matchesSubcategory
      ) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory && article.category !== selectedCategory) {
      return false;
    }

    // Subcategory filter
    if (selectedSubcategory && article.subcategory !== selectedSubcategory) {
      return false;
    }

    // Created date filter
    if (createdDateFrom && article.created_at) {
      const articleDate = new Date(article.created_at).setHours(0, 0, 0, 0);
      const fromDate = new Date(createdDateFrom).setHours(0, 0, 0, 0);
      if (articleDate < fromDate) return false;
    }

    if (createdDateTo && article.created_at) {
      const articleDate = new Date(article.created_at).setHours(0, 0, 0, 0);
      const toDate = new Date(createdDateTo).setHours(0, 0, 0, 0);
      if (articleDate > toDate) return false;
    }

    // Updated date filter
    if (updatedDateFrom && article.updated_at) {
      const articleDate = new Date(article.updated_at).setHours(0, 0, 0, 0);
      const fromDate = new Date(updatedDateFrom).setHours(0, 0, 0, 0);
      if (articleDate < fromDate) return false;
    }
    if (updatedDateTo && article.updated_at) {
      const articleDate = new Date(article.updated_at).setHours(0, 0, 0, 0);
      const toDate = new Date(updatedDateTo).setHours(0, 0, 0, 0);
      if (articleDate > toDate) return false;
    }

    return true;
  });

  // Count active filters
  const activeFilterCount = [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    createdDateFrom,
    createdDateTo,
    updatedDateFrom,
    updatedDateTo,
  ].filter(Boolean).length;

  // Count breaking news and editors picks for published articles
  const breakingNewsCount = articles.filter(
    (article) => article.isBreakingNews && article.isPublished && !article.isArchived
  ).length;
  const editorsPicksCount = articles.filter(
    (article) => article.isEditorsPick && article.isPublished && !article.isArchived
  ).length;

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-black">
        Loading articles...
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 inline-block">
          <h2 className="text-red-800 font-bold mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className={`min-h-screen bg-gray-50 p-8 ${isHeroBannerTab ? "" : "overflow-hidden"}`}>
      <AdminHeader />
      <div className="max-w-8xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {isHeroBannerTab ? "Hero Banner" : "Articles"}
            </h1>
            {!isHeroBannerTab && (
              <div className="relative w-96 text-gray-600">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, author, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 flex items-center justify-between">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "pending"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending Posts
              </button>
              <button
                onClick={() => setActiveTab("archived")}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "archived"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Archived Posts
              </button>
              <button
                onClick={() => setActiveTab("published")}
                className={`py-4 font-medium border-b-2 transition-colors relative ${
                  activeTab === "published"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  Published Posts
                  {breakingNewsCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-300">
                      <Bell className="w-3 h-3" />
                      {breakingNewsCount}
                    </span>
                  )}
                  {editorsPicksCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                      <Star className="w-3 h-3" />
                      {editorsPicksCount}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "videos"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Videos
              </button>
              {/* NEW: Hero Banner Tab */}
              <button
                onClick={() => setActiveTab("hero-banner")}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === "hero-banner"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Hero Banner
              </button>
            </div>

            {/* Action buttons - hide for hero banner tab */}
            {!isHeroBannerTab && (
              <div className="flex gap-3 px-6">
                {isVideosTab ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowVideoForm((prev) => !prev);
                        setShowFacebookLiveForm(false);
                      }}
                      className={`flex items-center gap-2 text-white font-bold px-4 py-2 rounded transition-colors ${
                        showVideoForm
                          ? "bg-gray-400 hover:bg-gray-500"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {showVideoForm ? "Hide Form" : "Add Video"}
                    </button>
                    <button
                      onClick={() => {
                        setShowFacebookLiveForm((prev) => !prev);
                        setShowVideoForm(false);
                      }}
                      className={`flex items-center gap-2 text-white font-bold px-4 py-2 rounded transition-colors ${
                        showFacebookLiveForm
                          ? "bg-gray-400 hover:bg-gray-500"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {showFacebookLiveForm ? "Hide" : "Facebook Live"}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 text-white font-bold px-4 py-2 rounded transition-colors ${
                        hasActiveFilters
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                    <Link
                      href="/admin/articles/new/metadata"
                      className="bg-red-500 flex items-center gap-2 text-white font-bold px-4 py-2 rounded transition-colors hover:bg-red-600 active:bg-red-700"
                    >
                      Add Article
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Filter Panel */}
          {isArticlesTab && showFilters && (
            <div className="border-b border-gray-200 bg-gray-50 p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                  >
                    <option value="">All Subcategories</option>
                    {subcategories.map((subcat) => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Created Date
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={createdDateFrom}
                        onChange={(e) => setCreatedDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={createdDateTo}
                        onChange={(e) => setCreatedDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Updated Date
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={updatedDateFrom}
                        onChange={(e) => setUpdatedDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={updatedDateTo}
                        onChange={(e) => setUpdatedDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isVideosTab && showVideoForm && (
            <div className="border-b border-gray-200 bg-gray-50 p-6">
              <form
                onSubmit={handleCreateVideo}
                className="grid gap-4 md:grid-cols-4"
              >
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Title
                  </label>
                  <div>
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) =>
                        setVideoForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      placeholder="Enter video title"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {countWords(videoForm.title)}/50 words
                    </p>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    URL
                  </label>
                  <input
                    type="url"
                    value={videoForm.url}
                    onChange={(e) =>
                      setVideoForm((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="Youtube, Facebook, TikTok link"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Platform
                  </label>
                  <select
                    value={videoForm.platform}
                    onChange={(e) =>
                      setVideoForm((prev) => ({
                        ...prev,
                        platform: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <option value="">Auto-detect</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleVideoThumbnailUpload}
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={uploadingVideoThumbnail}
                      className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {uploadingVideoThumbnail
                        ? "Uploading..."
                        : "Upload Thumbnail"}
                    </button>
                    <input
                      type="url"
                      value={videoForm.thumbnail_url}
                      onChange={(e) =>
                        setVideoForm((prev) => ({
                          ...prev,
                          thumbnail_url: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      placeholder="Or paste image URL"
                    />
                    {videoForm.thumbnail_url && (
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={videoForm.thumbnail_url}
                          alt="Video thumbnail preview"
                          className="h-32 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVideoForm((prev) => ({
                              ...prev,
                              thumbnail_url: "",
                            }))
                          }
                          className="w-full bg-gray-100 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                        >
                          Remove Thumbnail
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={videoFormLoading}
                    className="inline-flex items-center rounded-lg bg-red-500 px-5 py-2 text-white font-semibold shadow hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    {videoFormLoading ? "Saving..." : "Add Video"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isVideosTab && showFacebookLiveForm && (
            <div className="border-b border-gray-200 bg-gray-50 p-6">
              {facebookLiveError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {facebookLiveError}
                </div>
              )}

              <form onSubmit={handleSaveFacebookLive} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Facebook Live URL
                    </label>
                    <input
                      type="url"
                      value={facebookLive?.fb_url || ""}
                      onChange={(e) =>
                        setFacebookLive((prev) =>
                          prev
                            ? { ...prev, fb_url: e.target.value }
                            : {
                                fb_url: e.target.value,
                                fb_embed_url: "",
                                is_active: false,
                              }
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      placeholder="https://www.facebook.com/yourpage/live/..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Paste the normal Facebook live link here. The embed URL
                      will be generated automatically.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Live Status
                    </span>

                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        checked={Boolean(facebookLive?.is_active)}
                        disabled={facebookLiveLoading || !facebookLive?.fb_url}
                        onChange={() => handleToggleFacebookLive()}
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {facebookLive?.is_active ? "Live is ON" : "Live is OFF"}
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">
                      {facebookLive?.fb_url
                        ? facebookLive?.is_active
                          ? "The Facebook Live section is currently visible on the homepage."
                          : "The Facebook Live section is currently hidden on the homepage."
                        : "Enter and save a Facebook Live URL first, then you can turn it ON."}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={facebookLiveLoading}
                    className="inline-flex items-center rounded-lg bg-red-500 px-5 py-2 text-white font-semibold shadow hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    {facebookLiveLoading ? "Saving..." : "Save Facebook Live"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NEW: Hero Banner Content */}
          {isHeroBannerTab && (
            <div className="p-6">
              <HeroBannerAdmin />
            </div>
          )}

          {/* Results count */}
          {!isVideosTab && !isHeroBannerTab && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredArticles.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {
                    articles.filter((article) => matchesActiveTab(article))
                      .length
                  }
                </span>{" "}
                articles
              </p>
            </div>
          )}

          {!isVideosTab && !isHeroBannerTab && articleValidationError && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 font-semibold">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{articleValidationError}</span>
              </div>
            </div>
          )}

          {isArticlesTab && filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">
                {hasActiveFilters
                  ? "No articles match your filters."
                  : "No articles found. Feel free to generate!"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : isArticlesTab ? (
            <div className={`${isHeroBannerTab ? "" : "max-h-[calc(100vh-350px)] overflow-y-auto"}`}>
              <table className="min-w-full table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                      Cover & Status
                    </th>
                    <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                      Article Title
                    </th>
                    <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                      Author
                    </th>
                    <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                      Status
                    </th>
                    <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                      Category
                    </th>
                    {activeTab !== "pending" && activeTab !== "archived" && (
                      <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                        Quick Actions
                      </th>
                    )}
                    <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                        {a.thumbnail_url && (
                          <img
                            src={a.thumbnail_url}
                            alt={a.title}
                            className="mx-auto h-28 object-cover rounded-lg mb-2"
                          />
                        )}
                        {a.created_at && (
                          <div className="text-xs text-gray-600">
                            Created:{" "}
                            {new Date(a.created_at).toLocaleDateString()}
                          </div>
                        )}
                        {a.updated_at && (
                          <div className="text-xs text-gray-500">
                            Updated:{" "}
                            {new Date(a.updated_at).toLocaleDateString()}
                          </div>
                        )}
                        {/* Show badges for special status */}
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                          {a.isEditorsPick && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              <Star size={12} className="fill-current" />
                              Editor's Pick
                            </span>
                          )}
                          {a.isBreakingNews && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              <Bell size={12} />
                              Breaking
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                        {a.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                        {a.author}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                        {a.status ?? "no status:("}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                        {a.category ?? "Uncategorized"}
                        {a.subcategory && (
                          <span className="block text-xs text-gray-500">
                            {a.subcategory}
                          </span>
                        )}
                      </td>
                      {activeTab !== "pending" && activeTab !== "archived" && (
                        <td className="px-4 py-3 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                          <div className="flex flex-col gap-2 items-center">
                            {/* Favorite / Editor's Picks */}
                            <div className="relative group w-full max-w-[140px]">
                              <button
                                onClick={() =>
                                  handleToggleEditorsPick(
                                    a.slug,
                                    a.isEditorsPick
                                  )
                                }
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 w-full ${
                                  a.isEditorsPick
                                    ? "bg-yellow-50 border-yellow-300 text-yellow-700 shadow-sm"
                                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                                aria-label={
                                  a.isEditorsPick
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                <Star
                                  size={18}
                                  className={
                                    a.isEditorsPick
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-400"
                                  }
                                  fill={
                                    a.isEditorsPick ? "currentColor" : "none"
                                  }
                                />
                                <span className="text-sm font-medium">
                                  {a.isEditorsPick ? "Favorited" : "Favorite"}
                                </span>
                              </button>

                              {/* Tooltip for Editor's Picks */}
                              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-10 z-20 hidden w-max max-w-xs rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                                For Editor&apos;s Picks: only pick a maximum of
                                3
                                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black" />
                              </div>
                            </div>

                            {/* Breaking News */}
                            <div className="relative group w-full max-w-[140px]">
                              <button
                                onClick={() =>
                                  handleToggleBreakingNews(
                                    a.slug,
                                    a.isBreakingNews
                                  )
                                }
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 w-full ${
                                  a.isBreakingNews
                                    ? "bg-red-50 border-red-300 text-red-700 shadow-sm"
                                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                                aria-label={
                                  a.isBreakingNews
                                    ? "Mark as normal news"
                                    : "Mark as breaking news"
                                }
                              >
                                <Bell
                                  size={18}
                                  className={
                                    a.isBreakingNews
                                      ? "text-red-500 fill-current"
                                      : "text-gray-400"
                                  }
                                  fill={
                                    a.isBreakingNews ? "currentColor" : "none"
                                  }
                                />
                                <span className="text-sm font-medium">
                                  {a.isBreakingNews ? "Breaking!" : "Breaking"}
                                </span>
                              </button>

                              {/* Tooltip for Breaking News */}
                              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-10 z-20 hidden w-max max-w-xs rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                                For Breaking News: only pick a maximum of 10
                                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black" />
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="w-1/6 px-4 py-3 text-m text-gray-900 text-center align-middle border-b border-gray-200">
                        <div className="flex flex-col gap-1 items-center">
                          {!a.isPublished && !a.isArchived && (
                            <button
                              onClick={() => handlePublish(a.slug)}
                              className="text-white font-bold px-10 py-2 rounded-lg bg-green-500 hover:bg-green-600 w-full"
                            >
                              Publish
                            </button>
                          )}

                          {a.isPublished && !a.isArchived && (
                            <button
                              onClick={() => handleUnpublish(a.slug)}
                              className="text-white font-bold px-10 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 w-full"
                            >
                              Unpublish
                            </button>
                          )}

                          {a.isArchived === true && (
                            <button
                              onClick={() => handleUnarchive(a.slug)}
                              className="text-white font-bold px-10 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 w-full"
                            >
                              Unarchive
                            </button>
                          )}

                          <Link
                            href={`/admin/articles/${a.slug}`}
                            target="_blank"
                            className="bg-blue-500 text-white font-bold px-12 py-2 rounded-lg text-center hover:bg-blue-600 w-full"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/articles/${a.slug}/metadata`}
                            className="bg-yellow-500 text-white font-bold px-13 py-2 rounded-lg text-center hover:bg-yellow-600 w-full"
                          >
                            Edit
                          </Link>

                          {!a.isArchived && (
                            <button
                              onClick={() => handleArchive(a.slug)}
                              className="text-white font-bold px-10.5 py-2 rounded-lg bg-red-400 hover:bg-red-500 w-full"
                            >
                              Archive
                            </button>
                          )}
                          {a.isArchived && (
                            <button
                              onClick={() => handleDeleteArticle(a.slug)}
                              className="text-white font-bold px-10 py-2 rounded-lg bg-red-600 hover:bg-red-700 w-full"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : isVideosTab ? (
            <div className="p-6">
              {videosError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {videosError}
                </div>
              )}

              {videoValidationError && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 font-semibold">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{videoValidationError}</span>
                  </div>
                </div>
              )}

              {videosLoading ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
                  Loading videos...
                </div>
              ) : videos.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-600">
                  No videos found. Add one above!
                </div>
              ) : (
                <>
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-semibold text-gray-900">
                        {videos.length}
                      </span>{" "}
                      videos
                    </p>
                  </div>
                  <div className={`${isHeroBannerTab ? "" : "max-h-[calc(100vh-350px)] overflow-y-auto"}`}>
                    <table className="min-w-full table-fixed">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                            Preview
                          </th>
                          <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                            Details
                          </th>
                          <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                            Status
                          </th>
                          <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                            Quick Actions
                          </th>
                          <th className="w-1/6 px-4 py-3 font-bold text-gray-900 text-center align-middle bg-gray-50">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos.map((video) => (
                          <tr
                            key={video.id}
                            className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                          >
                            <td className="px-4 py-4 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                              <div className="mx-auto max-w-xs">
                                <VideoCard
                                  id={video.id}
                                  title={video.title}
                                  url={video.url}
                                  platform={video.platform}
                                  orientation="horizontal"
                                  thumbnailUrl={video.thumbnail_url}
                                  disablePlay={true}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 align-middle border-b border-gray-200">
                              <p className="font-semibold">{video.title}</p>
                              <p className="text-xs uppercase text-gray-500 mt-1">
                                {video.platform}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Added{" "}
                                {video.created_at
                                  ? new Date(video.created_at).toLocaleString()
                                  : "—"}
                              </p>
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 text-xs hover:underline mt-2 inline-block"
                              >
                                Open Source Link
                              </a>
                              {editingVideoId === video.id ? (
                                <div className="mt-3 flex flex-col gap-2">
                                  <div>
                                    <input
                                      type="text"
                                      value={editingVideoTitle}
                                      onChange={(e) =>
                                        setEditingVideoTitle(e.target.value)
                                      }
                                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                      {countWords(editingVideoTitle)}/50 words
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleSaveVideoTitle}
                                      disabled={editingVideoLoading}
                                      className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
                                    >
                                      {editingVideoLoading
                                        ? "Saving..."
                                        : "Save"}
                                    </button>
                                    <button
                                      onClick={cancelEditingVideo}
                                      className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditingVideo(video)}
                                  className="mt-1 block text-xs font-semibold text-blue-600 hover:text-blue-800"
                                >
                                  Edit Title
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  video.isFeatured
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {video.isFeatured ? "Featured" : "Not Featured"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                              <div className="flex flex-col gap-2 items-center">
                                <div className="relative group w-full max-w-[140px]">
                                  <button
                                    onClick={() =>
                                      handleToggleVideoFeatured(video)
                                    }
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 w-full ${
                                      video.isFeatured
                                        ? "bg-yellow-50 border-yellow-300 text-yellow-700 shadow-sm"
                                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                                    }`}
                                    aria-label={
                                      video.isFeatured
                                        ? "Remove from featured"
                                        : "Mark as featured"
                                    }
                                  >
                                    <Star
                                      size={18}
                                      className={
                                        video.isFeatured
                                          ? "text-yellow-600 fill-current"
                                          : "text-gray-400"
                                      }
                                      fill={
                                        video.isFeatured
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                    <span className="text-sm font-medium">
                                      {video.isFeatured
                                        ? "Featured!"
                                        : "Feature"}
                                    </span>
                                  </button>

                                  {/* Tooltip for Featured */}
                                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-10 z-20 hidden w-max max-w-xs rounded-md bg-black px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                                    Featured: only pick a maximum of 10
                                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-black" />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 text-center align-middle border-b border-gray-200">
                              <div className="flex flex-col gap-2 items-center">
                                <button
                                  onClick={() => handleDeleteVideo(video.id)}
                                  className="text-white font-bold px-10 py-2 rounded-lg bg-red-600 hover:bg-red-700 w-full"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}