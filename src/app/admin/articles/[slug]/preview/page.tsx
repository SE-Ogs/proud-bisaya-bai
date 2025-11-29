"use client";

import React, { useState, useEffect } from "react";
import ArticleRenderer from "@/app/components/ArticleRenderer";

export default function PreviewPage() {
  const [previewData, setPreviewData] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preview = sessionStorage.getItem('articlePreview');
    const meta = sessionStorage.getItem('articleMetadata');
    
    if (!preview) {
      console.error('No preview data found');
      setIsLoading(false);
      return;
    }

    try {
      setPreviewData(JSON.parse(preview));
      setMetadata(meta ? JSON.parse(meta) : {
        title: 'Article Preview',
        slug: 'preview',
        author: 'Author',
        category: 'General', // Make sure category is included
        subcategory: '',
        thumbnail_url: '',
        reading_time: '',
      });
    } catch (error) {
      console.error('Error parsing preview data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Preview Data</h2>
          <p className="text-gray-600 mb-4">Please use the Preview button in the editor.</p>
          <button
            onClick={() => window.close()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Create a complete mock article object that matches your Article type requirements
  const mockArticle = {
    id: 'preview',
    slug: metadata?.slug || 'preview',
    title: metadata?.title || 'Article Preview',
    author: metadata?.author || 'Author',
    category: metadata?.category || 'General', // This is the required field
    subcategory: metadata?.subcategory || '',
    thumbnail_url: metadata?.thumbnail_url || '',
    reading_time: metadata?.reading_time || '',
    content: JSON.stringify(previewData),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    status: 'published',
    excerpt: '',
    tags: []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-yellow-100 border-b-2 border-yellow-400 p-4 text-center sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-yellow-900 font-semibold">
            🔍 Preview Mode - This is how your article will look when published
          </p>
          <button
            onClick={() => window.close()}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
      
      <ArticleRenderer article={mockArticle} />
    </div>
  );
}