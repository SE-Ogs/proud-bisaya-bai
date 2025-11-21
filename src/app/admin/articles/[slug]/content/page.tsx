"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { LoadingOverlay } from "@/app/components/LoadingOverlay";
import AdminHeader from "@/app/components/AdminHeader";
import { CustomEditor } from "@/app/components/articleEditor/CustomEditor";
import type { CustomEditorData } from "@/app/components/articleEditor/PropsCustomEditor";

export default function ArticleContentPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const isEdit = slug !== "new";

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMetadataVisible, setIsMetadataVisible] = useState(true);

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
        created_at?: string;
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
                const parsed = JSON.parse(savedMetadata);
                setMetadata({
                    ...parsed,
                    created_at: article.created_at || parsed.created_at,
                });
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
                created_at: article.created_at,
            });
        }

            if (article.content) {
                try {
                const parsedContent =
                    typeof article.content === "string"
                    ? JSON.parse(article.content)
                    : article.content;
                
                if (parsedContent && Array.isArray(parsedContent.content)) {
                  setData({
                    content: parsedContent.content,
                    root: parsedContent.root || { props: {} }
                  });
                } else if (Array.isArray(parsedContent)) {
                  setData({
                    content: parsedContent,
                    root: { props: {} }
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
        console.log('💾 handleSave called with:', editorData);
        console.log('💾 Current data state:', data);
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

        console.log('📤 Sending payload:', payload);
        console.log('📤 Stringified content:', payload.content);

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

        alert(isEdit ? "Article updated successfully!" : "Article published successfully!");
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
        <div className="h-screen flex flex-col overflow-hidden fixed inset-0">
            <div className="mt-10"></div>
            <AdminHeader/>
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Metadata Header */}
                <div className="bg-white border-b border-gray-200 flex-shrink-0">
                    {/* Collapsed State - Minimal Bar */}
                    {!isMetadataVisible && (
                        <div className="h-12 flex items-center justify-center px-4 py-2">
                            <span className="text-sm text-gray-500 font-medium">Metadata hidden</span>
                        </div>
                    )}
                    
                    {/* Expanded State */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isMetadataVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="px-6 py-4">
                            <div className="max-w-4xl mx-auto">
                                <a
                                    href="/admin/dashboard"
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors mb-4 inline-block"
                                >
                                    &larr; Back to Dashboard
                                </a>
                                
                                {metadata.thumbnail_url && (
                                    <img
                                        src={metadata.thumbnail_url}
                                        alt={metadata.title}
                                        className="w-full h-[250px] object-cover rounded-xl shadow-lg mb-4"
                                    />
                                )}

                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {metadata.category}
                                    </span>
                                    {metadata.subcategory && (
                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {metadata.subcategory}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold mb-3 text-gray-900">
                                    {metadata.title}
                                </h1>

                                <div className="flex items-center gap-4 text-gray-600">
                                    <span className="font-medium">By {metadata.author}</span>
                                    {metadata.created_at && (
                                        <>
                                            <span>&bull;</span>
                                            <time dateTime={metadata.created_at}>
                                                {new Date(metadata.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </time>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor - Takes remaining space */}
                <div className="flex-1 overflow-hidden">
                    <CustomEditor
                        data={data}
                        onChange={setData}
                        onPublish={handleSave}
                        isMetadataVisible={isMetadataVisible}
                        onToggleMetadata={() => setIsMetadataVisible(!isMetadataVisible)}
                        metadata={metadata || undefined}
                    />
                </div>
            </div>

            <LoadingOverlay
                saving={saving}
                uploading={uploading}
                uploadingThumbnail={false}
            />
        </div>
    );
}