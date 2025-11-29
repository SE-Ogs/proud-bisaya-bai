"use client";

import React from "react";

type Article = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  subcategory?: string;
  thumbnail_url?: string;
  content: string;
  created_at: string;
  reading_time: string;
};

interface ArticleRendererProps {
  article: Article;
}

// Component types matching your CustomEditor
const COMPONENT_TYPES = {
  HEADING: "Heading",
  PARAGRAPH: "Paragraph",
  RICH_TEXT: "TiptapRichText",
  IMAGE: "ImageBlock",
  COLUMNS: "ColumnBlock",
};

export default function ArticleRenderer({ article }: ArticleRendererProps) {
  let editorData;
  try {
    editorData =
      typeof article.content === "string"
        ? JSON.parse(article.content)
        : article.content;
  } catch (e) {
    console.error("Failed to parse article content:", e);
    editorData = { content: [] };
  }

  // Extract content array from either the old Puck format or new CustomEditor format
  const contentArray = Array.isArray(editorData)
    ? editorData
    : editorData.content || [];

  const renderComponent = (component: any, index: number) => {
    const { type, props } = component;

    switch (type) {
      case COMPONENT_TYPES.HEADING: {
        const HeadingTag = `h${props.level || 2}` as
          | "h1"
          | "h2"
          | "h3"
          | "h4"
          | "h5"
          | "h6";
        const headingStyles: Record<number, string> = {
          1: "text-4xl font-bold mb-6 text-gray-900",
          2: "text-3xl font-bold mb-5 text-gray-900",
          3: "text-2xl font-bold mb-4 text-gray-900",
          4: "text-xl font-bold mb-3 text-gray-900",
          5: "text-lg font-bold mb-3 text-gray-900",
          6: "text-base font-bold mb-2 text-gray-900",
        };
        return (
          <HeadingTag
            key={index}
            className={headingStyles[props.level] || headingStyles[2]}
          >
            {props.text}
          </HeadingTag>
        );
      }

      case COMPONENT_TYPES.PARAGRAPH:
        return (
          <div 
            key={index}
            className="prose prose-lg max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: props.content || '' }}
          />
        );
      
      case COMPONENT_TYPES.RICH_TEXT:
        return (
          <div
            key={index}
            className="prose prose-lg max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: props.content || "" }}
          />
        );

      case COMPONENT_TYPES.IMAGE:
        // Check if custom dimensions are set
        const hasCustomDimensions = Boolean(props.width && props.height);
        
        console.log('Image props:', {
          src: props.src,
          width: props.width,
          height: props.height,
          hasCustomDimensions
        });
        
        if (hasCustomDimensions) {
          return (
            <figure key={index} className="mb-8 flex justify-center">
              {props.src && (
                <div style={{ maxWidth: '100%', display: 'inline-block' }}>
                  <img
                    src={props.src}
                    alt={props.alt || ""}
                    width={props.width}
                    height={props.height}
                    className="rounded-xl shadow-lg"
                    style={{ 
                      display: 'block',
                      maxWidth: '100%',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
              {props.caption && (
                <figcaption className="text-sm text-gray-600 mt-3 text-center italic">
                  {props.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        
        return (
          <figure key={index} className="mb-8">
            {props.src && (
              <img
                src={props.src}
                alt={props.alt || ""}
                className="w-full rounded-xl object-cover shadow-lg"
              />
            )}
            {props.caption && (
              <figcaption className="text-sm text-gray-600 mt-3 text-center italic">
                {props.caption}
              </figcaption>
            )}
          </figure>
        );

      case COMPONENT_TYPES.COLUMNS:
        const columnCount = props.columnCount || 2;
        const gridCols =
          columnCount === 2
            ? "grid-cols-2"
            : columnCount === 3
            ? "grid-cols-3"
            : "grid-cols-4";

        return (
          <div key={index} className={`grid ${gridCols} gap-6 mb-8`}>
            {(props.columns || []).map((column: any, colIndex: number) => (
              <div key={colIndex} className="space-y-4">
                {column.components &&
                  column.components.map(
                    (colComponent: any, colCompIndex: number) =>
                      renderComponent(colComponent, colCompIndex)
                  )}
              </div>
            ))}
          </div>
        );

      default:
        console.warn(`Unknown component type: ${type}`);
        return null;
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-2 bg-white">
      <a
        href="/articles"
        className="block text-blue-600 hover:text-blue-800 font-medium transition-colors mb-6"
      >
        &larr; Back to Articles
      </a>
      <header className="mb-12">
        {article.thumbnail_url && (
          <img
            src={article.thumbnail_url}
            alt={article.title}
            className="w-full h-[400px] object-cover rounded-2xl shadow-xl mb-8"
          />
        )}

        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          {article.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {article.category}
          </span>
          {article.subcategory && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {article.subcategory}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <span className="font-medium">By {article.author}</span>
          <span>&bull;</span>
          <time dateTime={article.created_at}>
            {new Date(article.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>&bull;</span>
          <span>~{article.reading_time} minutes read</span>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        {contentArray.length > 0 ? (
          contentArray.map((component: any, index: number) =>
            renderComponent(component, index)
          )
        ) : (
          <p className="text-gray-500 italic">No content available.</p>
        )}
      </div>

      <footer className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
        </div>
      </footer>
    </article>
  );
}