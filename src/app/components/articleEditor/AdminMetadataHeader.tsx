import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/app/components/Categories";

interface ArticleMetadataHeaderProps {
  slug?: string;
  title: string;
  setTitle: (title: string) => void;
  articleSlug: string;
  setArticleSlug: (slug: string) => void;
  author: string;
  setAuthor: (author: string) => void;
  category: string;
  setCategory: (category: string) => void;
  subcategory: string;
  setSubcategory: (subcategory: string) => void;
  thumbnail: string;
  setThumbnail: (thumbnail: string) => void;
  availableSubcategories: string[];
  uploading: boolean;
  uploadingThumbnail: boolean;
  onGenerateSlug: () => void;
  onImageUploadClick: () => void;
  onThumbnailUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  thumbnailInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categorySlug: string;
  setCategorySlug: (slug: string) => void;
  subcategorySlug: string;
  setSubcategorySlug: (slug: string) => void;
}

export function ArticleMetadataHeader({
  slug,
  title,
  setTitle,
  articleSlug,
  setArticleSlug,
  author,
  setAuthor,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  thumbnail,
  setThumbnail,
  availableSubcategories,
  uploading,
  uploadingThumbnail,
  onGenerateSlug,
  onImageUploadClick,
  onThumbnailUploadClick,
  fileInputRef,
  thumbnailInputRef,
  onImageUpload,
  onThumbnailUpload,
  categorySlug,
  setCategorySlug,
  subcategorySlug,
  setSubcategorySlug,
}: ArticleMetadataHeaderProps) {
  const router = useRouter();

  return (
    <>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-blue-600 hover:underline text-2xl mb-2 inline-block pb-4 font-bold"
          >
            ← Back to Articles
          </button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl text-black font-bold">
                {slug ? "Edit Article" : "Create New Article"}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onImageUploadClick}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={onGenerateSlug}
                placeholder="Enter article title"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={articleSlug}
                onChange={(e) =>
                  setArticleSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                  )
                }
                placeholder="article-slug"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">
                Author *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCategorySlug(
                    e.target.value.toLowerCase().replace(/\s+/g, "-")
                  );
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" className="text-gray-400">
                  Select a category
                </option>
                {Object.keys(CATEGORIES).map((cat) => (
                  <option key={cat} value={cat} className="text-gray-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => {
                  setSubcategory(e.target.value);
                  setSubcategorySlug(
                    e.target.value.toLowerCase().replace(/\s+/g, "-")
                  );
                }}
                disabled={!category}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option value="" className="text-gray-400">
                  Select a subcategory (optional)
                </option>
                {availableSubcategories.map((subcat) => (
                  <option key={subcat} value={subcat} className="text-gray-900">
                    {subcat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">
                Thumbnail
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="Or paste URL"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={onThumbnailUploadClick}
                  disabled={uploadingThumbnail}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-3 rounded-lg text-md font-medium transition disabled:opacity-50"
                >
                  {uploadingThumbnail ? "..." : "📤"}
                </button>
              </div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={onThumbnailUpload}
                className="hidden"
              />
            </div>
          </div>

          {thumbnail && (
            <div className="mt-4">
              <p className="text-md font-medium text-gray-700 mb-2">
                Thumbnail Preview:
              </p>
              <img
                src={thumbnail}
                alt="Thumbnail preview"
                className="h-32 w-auto object-cover rounded-lg border"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
