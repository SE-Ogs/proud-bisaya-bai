"use client"

import { Puck } from "@measured/puck";
import type { Config, Data } from "@measured/puck";
import { title } from "process";
import React, { useEffect, useMemo, useState } from "react";
import SEOAnalyzerModal from "./SEOAnalyzerModal";

interface PuckEditorProps {
  config: Config;
  data: Data;
  metadata?: {
    title: string;
    author: string;
    category: string;
    subcategory?: string;
    thumbnail_url?: string;
  };
  onPublish: (data: Data) => void;
  onChange: (data: Data) => void;
}

export function PuckEditor({
  config,
  data,
  metadata: metadataProp,
  onPublish,
  onChange,
}: PuckEditorProps) {
  const [showSEO, setShowSEO] = useState(false);
  const [metadata, setMetadata] = useState(metadataProp);

    useEffect(() => {
    if (!metadataProp && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("articleMetadata");
      if (stored) {
        try {
          setMetadata(JSON.parse(stored));
        } catch (err) {
          console.error("Failed to parse stored metadata:", err);
        }
      }
    }
  }, [metadataProp]);

const countWords = (text: string) =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const decodeHtmlEntities = (text: string) =>
  text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const stripHtml = (html: string) =>
  decodeHtmlEntities(
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
  ).trim();

const normalizeText = (value?: string) =>
  value ? stripHtml(value).replace(/\s+/g, " ").trim() : "";

interface ImageStats {
  total: number;
  missingAlt: number;
}

const extractContentMetrics = (
  data: any
): { readableText: string; wordCount: number; imageStats: ImageStats } => {
  if (!data) {
    return {
      readableText: "",
      wordCount: 0,
      imageStats: { total: 0, missingAlt: 0 },
    };
  }

  const parts: string[] = [];
  let imageTotal = 0;
  let imageMissingAlt = 0;

  const addText = (value: any) => {
    if (typeof value === "string") {
      const normalized = normalizeText(value);
      if (normalized) {
        parts.push(normalized);
      }
    }
  };

  const traverse = (node: any) => {
    if (!node) return;

    if (node.props) {
      addText(node.props.content);
      addText(node.props.text);
      addText(node.props.children);
      addText(node.props.value);
      addText(node.props.caption);

      const hasImageProps =
        typeof node.props.src === "string" ||
        typeof node.props.alt === "string" ||
        typeof node.props.imageUrl === "string";

      if (hasImageProps) {
        imageTotal += 1;
        const altText =
          typeof node.props.alt === "string" ? normalizeText(node.props.alt) : "";
        if (!altText) {
          imageMissingAlt += 1;
        }
      }
    }

    if (Array.isArray(node.content)) node.content.forEach(traverse);
    if (Array.isArray(node.blocks)) node.blocks.forEach(traverse);
    if (Array.isArray(node.children)) node.children.forEach(traverse);
  };

  traverse(data);

  const readableText = parts.join(" ").trim();
  return {
    readableText,
    wordCount: countWords(readableText),
    imageStats: {
      total: imageTotal,
      missingAlt: imageMissingAlt,
    },
  };
};

const extractFirstParagraph = (text: string): string => {
  if (!text) return "";

  // Split into potential paragraphs — double newlines, or two spaces after punctuation.
  const paragraphs = text
    .split(/\n\s*\n|(?<=[.?!])\s{2,}/)
    .map((p) => p.trim())
    .filter(Boolean); // remove empty strings

  // Filter out headings, short intros, and metadata-like lines
  const meaningfulParagraphs = paragraphs.filter(
    (p) =>
      p.length > 40 && // skip short one-liners
      !/^#{1,6}\s/.test(p) && // skip markdown headings
      !/^by\s/i.test(p) && // skip author lines
      !/^(introduction|summary|about)\b/i.test(p) // skip common non-content headers
  );

  const first = meaningfulParagraphs[0] || paragraphs[0] || "";

  // Truncate if longer than 160 chars
  return first.length > 160 ? first.slice(0, 157).trim() + "..." : first;
};


  const { readableText, wordCount, imageStats } = useMemo(
    () => extractContentMetrics(data),
    [data]
  );
  const metaDescription = useMemo(
    () => extractFirstParagraph(readableText),
    [readableText]
  );

  return (
    <>
    <div className="flex-1 overflow-y-hidden">
      <Puck
        config={config}
        data={data}
        onPublish={onPublish}
        onChange={onChange}
        overrides={{
          header: ({ actions, children, }) => (
            <>
              {children}
              <div></div>
            </>
          ),
          headerActions: () => (
            <>
            {/* TODO: Logic for SEO and Preview buttons */}
              <button
                onClick={() => setShowSEO(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                SEO
              </button>
              <button
                onClick={ console.log }
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Preview
              </button>
              <button
                onClick={() => onPublish(data)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Create
              </button>
            </>
          ),
        }}
      />
    </div>
    <SEOAnalyzerModal
      open={showSEO}
      onClose={() => setShowSEO(false)}
      title={metadata?.title || ""}
      metaDescription={metaDescription}
      content={readableText}
      wordCount={wordCount}
      imageStats={imageStats}
    />
    </>
  );
}