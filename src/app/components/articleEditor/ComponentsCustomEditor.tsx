"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  GripVertical,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
} from "lucide-react";
import {
  COMPONENT_TYPES,
  COLUMN_OPTIONS,
  Component,
  ComponentProps,
  RichTextEditorProps,
  ColumnDropZoneProps,
  ComponentRendererInternalProps,
} from "@/app/components/articleEditor/PropsCustomEditor";

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

// Resizable Image Component 
interface ResizableImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  onResize: (width: number, height: number) => void;
  onRemove: () => void;
}

const ResizableImage: React.FC<ResizableImageProps> = ({
  src,
  alt,
  width: initialWidth,
  height: initialHeight,
  onResize,
  onRemove
}) => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth || 0,
    height: initialHeight || 0
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  // Track the final dimensions to call onResize after resizing stops
  const finalDimensions = useRef({ width: 0, height: 0 });

  // Load natural dimensions when image loads
  useEffect(() => {
    if (imageRef.current && !initialWidth && !initialHeight) {
      const img = imageRef.current;
      if (img.complete) {
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      } else {
        img.onload = () => {
          setDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
      }
    }
  }, [src, initialWidth, initialHeight]);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔴 ResizableImage: handleMouseDown', handle);
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;

      const aspectRatio = startPos.current.width / startPos.current.height;

      switch (handle) {
        case 'se': // bottom-right
          newWidth = Math.max(100, startPos.current.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(100, startPos.current.width - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'ne': // top-right
          newWidth = Math.max(100, startPos.current.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'nw': // top-left
          newWidth = Math.max(100, startPos.current.width - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'e': // right
          newWidth = Math.max(100, startPos.current.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'w': // left
          newWidth = Math.max(100, startPos.current.width - deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 's': // bottom
          newHeight = Math.max(100, startPos.current.height + deltaY);
          newWidth = newHeight * aspectRatio;
          break;
        case 'n': // top
          newHeight = Math.max(100, startPos.current.height - deltaY);
          newWidth = newHeight * aspectRatio;
          break;
      }

      // Store final dimensions
      finalDimensions.current = { width: newWidth, height: newHeight };
      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      console.log('🟢 ResizableImage: handleMouseUp - calling onResize with:', finalDimensions.current);
      setIsResizing(false);
      setResizeHandle(null);
      
      // Call onResize with the final dimensions
      onResize(finalDimensions.current.width, finalDimensions.current.height);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const ResizeHandle = ({ position, cursor }: { position: string; cursor: string }) => (
    <div
      className={`absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity z-50 ${
        position.includes('n') ? '-top-2' : ''
      } ${position.includes('s') ? '-bottom-2' : ''} ${
        position.includes('e') ? '-right-2' : ''
      } ${position.includes('w') ? '-left-2' : ''} ${
        position === 'n' || position === 's' ? 'left-1/2 -translate-x-1/2' : ''
      } ${position === 'e' || position === 'w' ? 'top-1/2 -translate-y-1/2' : ''}`}
      style={{ cursor }}
      onMouseDown={(e) => handleMouseDown(e, position)}
    />
  );

  return (
    <div className="relative inline-block max-w-full">
      <div
        ref={containerRef}
        className="relative group/resize"
        style={{
          width: dimensions.width ? `${dimensions.width}px` : 'auto',
          height: dimensions.height ? `${dimensions.height}px` : 'auto',
          maxWidth: '100%'
        }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-contain rounded-lg select-none"
          draggable={false}
        />

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-20"
          title="Remove image"
        >
          <X size={16} />
        </button>

        {/* Resize indicator */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/resize:opacity-100 transition-opacity pointer-events-none z-20">
          {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
        </div>

        {/* Resize handles */}
        <ResizeHandle position="nw" cursor="nw-resize" />
        <ResizeHandle position="n" cursor="n-resize" />
        <ResizeHandle position="ne" cursor="ne-resize" />
        <ResizeHandle position="e" cursor="e-resize" />
        <ResizeHandle position="se" cursor="se-resize" />
        <ResizeHandle position="s" cursor="s-resize" />
        <ResizeHandle position="sw" cursor="sw-resize" />
        <ResizeHandle position="w" cursor="w-resize" />

        {/* Resize overlay */}
        {isResizing && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Dimensions display when resizing */}
      {isResizing && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-mono z-50 pointer-events-none">
          {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
        </div>
      )}
    </div>
  );
};

// Rich Text Editor Component
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onFocus,
  onBlur,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const isUpdatingRef = useRef(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      // Mark that user is making an action
      if ((window as any).__setUserAction) {
        (window as any).__setUserAction();
      }
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFocus = () => {
    setShowToolbar(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!editorRef.current?.contains(document.activeElement)) {
        setShowToolbar(false);
        onBlur?.();
      }
    }, 150);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      const selection = window.getSelection();
      const hadFocus = editorRef.current.contains(document.activeElement);
      let cursorPosition = 0;

      if (hadFocus && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorPosition = preCaretRange.toString().length;
      }

      isUpdatingRef.current = true;
      editorRef.current.innerHTML = content || "<p>Start typing...</p>";
      isUpdatingRef.current = false;

      if (hadFocus && cursorPosition > 0) {
        const restore = () => {
          if (!editorRef.current) return;

          const range = document.createRange();
          const sel = window.getSelection();
          let charCount = 0;
          let found = false;

          const traverseNodes = (node: Node): boolean => {
            if (node.nodeType === Node.TEXT_NODE) {
              const textLength = node.textContent?.length || 0;
              if (charCount + textLength >= cursorPosition) {
                range.setStart(node, cursorPosition - charCount);
                range.collapse(true);
                found = true;
                return true;
              }
              charCount += textLength;
            } else {
              for (let i = 0; i < node.childNodes.length; i++) {
                if (traverseNodes(node.childNodes[i])) return true;
              }
            }
            return false;
          };

          traverseNodes(editorRef.current);

          if (found && sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        };

        requestAnimationFrame(restore);
      }
    }
  }, [content]);

  return (
    <div className="relative">
      {showToolbar && (
        <div className="sticky top-4 z-50 bg-white shadow-lg border border-gray-300 rounded-lg p-2 mb-2 flex gap-1 flex-wrap">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand("bold");
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand("italic");
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand("underline");
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <Underline size={16} />
          </button>
          <div className="w-px bg-gray-300 mx-1" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand("justifyLeft");
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand("justifyCenter");
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand("justifyRight");
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <AlignRight size={16} />
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:bg-blue-50 prose max-w-none"
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        suppressContentEditableWarning
      />
    </div>
  );
};

// Column Drop Zone Component
export const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({
  columnIndex,
  parentIndex,
  components,
  updateColumn,
  removeFromMainCanvas,
}) => {
  const [showDropZone, setShowDropZone] = useState(false);
  const imageInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropZone(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setShowDropZone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropZone(false);

    const isNewComponent = e.dataTransfer.getData("isNewComponent") === "true";
    const componentType = e.dataTransfer.getData("componentType");
    const fromIndexStr = e.dataTransfer.getData("componentIndex");

    if (isNewComponent && componentType) {
      const newComponent: Component = {
        type: componentType,
        props: getDefaultPropsForColumn(componentType),
      };
      updateColumn([...components, newComponent]);
    } else if (fromIndexStr) {
      const fromIndex = parseInt(fromIndexStr);
      if (!isNaN(fromIndex)) {
        const currentComponents = (window as any).currentComponents || [];
        const componentToMove = currentComponents[fromIndex];

        // Allow ALL components including columns
        if (componentToMove) {
          const componentCopy: Component = JSON.parse(
            JSON.stringify(componentToMove)
          );
          const componentIndexToRemove = fromIndex;
          const componentToMoveRef = componentToMove;

          const newColumnComponents = [...components, componentCopy];
          updateColumn(newColumnComponents);

          setTimeout(() => {
            if (removeFromMainCanvas) {
              const currentComponents = (window as any).currentComponents || [];
              if (currentComponents[componentIndexToRemove]) {
                removeFromMainCanvas(componentIndexToRemove);
              }
            } else {
              const updatedComponents = (window as any).currentComponents || [];
              if (
                updatedComponents[componentIndexToRemove] === componentToMoveRef
              ) {
                const newMainComponents = updatedComponents.filter(
                  (_: Component, i: number) => i !== componentIndexToRemove
                );
                (window as any).setComponentsFromDrop(newMainComponents);
              }
            }
          }, 200);
        }
      }
    }
  };

  const getDefaultPropsForColumn = (type: string): ComponentProps => {
    switch (type) {
      case COMPONENT_TYPES.HEADING:
        return { text: "", level: 3 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { content: "<p></p>" };
      case COMPONENT_TYPES.IMAGE:
        return { src: "", alt: "", caption: "" };
      case COMPONENT_TYPES.COLUMNS:
        return {
          columnCount: 2,
          columns: [{ components: [] }, { components: [] }],
        };
      default:
        return {};
    }
  };

  const deleteColumnComponent = (compIndex: number) => {
    updateColumn(components.filter((_, i) => i !== compIndex));
  };

  const updateColumnComponent = (compIndex: number, newProps: ComponentProps) => {
    // Mark user action
    if ((window as any).__setUserAction) {
      (window as any).__setUserAction();
    }
    const newComponents = [...components];
    newComponents[compIndex] = { ...newComponents[compIndex], props: newProps };
    updateColumn(newComponents);
  };

  const handleColumnImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, compIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages(prev => ({ ...prev, [compIndex]: true }));
    try {
      const imageUrl = await uploadImage(file);
      updateColumnComponent(compIndex, { 
        ...components[compIndex].props, 
        src: imageUrl,
        alt: components[compIndex].props.alt || file.name.replace(/\.[^/.]+$/, "")
      });
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImages(prev => ({ ...prev, [compIndex]: false }));
      if (imageInputRefs.current[compIndex]) {
        imageInputRefs.current[compIndex]!.value = "";
      }
    }
  };

  const renderColumnComponent = (comp: Component, compIndex: number) => {
    switch (comp.type) {
      case COMPONENT_TYPES.HEADING:
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={comp.props.text || ""}
              onChange={(e) =>
                updateColumnComponent(compIndex, {
                  ...comp.props,
                  text: e.target.value,
                })
              }
              className="w-full text-xl font-bold p-2 border rounded"
              placeholder="Heading..."
            />
            <select
              value={comp.props.level || 3}
              onChange={(e) =>
                updateColumnComponent(compIndex, {
                  ...comp.props,
                  level: parseInt(e.target.value),
                })
              }
              className="px-2 py-1 text-sm border rounded"
            >
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <option key={level} value={level}>
                  H{level}
                </option>
              ))}
            </select>
          </div>
        );

      case COMPONENT_TYPES.PARAGRAPH:
        return (
          <RichTextEditor
            content={comp.props.content || '<p>Type here...</p>'}
            onChange={(html: string) => {
              const { text, ...restProps } = comp.props;
              updateColumnComponent(compIndex, { ...restProps, content: html });
            }}
          />
        );

      case COMPONENT_TYPES.IMAGE:
        return (
          <div className="space-y-2">
            <input
              ref={(el) => { imageInputRefs.current[compIndex] = el; }}
              type="file"
              accept="image/*"
              onChange={(e) => handleColumnImageUpload(e, compIndex)}
              className="hidden"
            />
            {comp.props.src ? (
              <ResizableImage
                src={comp.props.src}
                alt={comp.props.alt || ''}
                width={comp.props.width}
                height={comp.props.height}
                onResize={(width, height) => {
                  updateColumnComponent(compIndex, { 
                    ...comp.props, 
                    width, 
                    height 
                  });
                }}
                onRemove={() => {
                  updateColumnComponent(compIndex, { 
                    ...comp.props, 
                    src: '',
                    alt: '',
                    caption: '',
                    width: undefined,
                    height: undefined
                  });
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => imageInputRefs.current[compIndex]?.click()}
                disabled={uploadingImages[compIndex]}
                className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages[compIndex] ? "Uploading..." : "Click to upload image"}
              </button>
            )}
            <input
              type="text"
              value={comp.props.src || ""}
              onChange={(e) =>
                updateColumnComponent(compIndex, {
                  ...comp.props,
                  src: e.target.value,
                })
              }
              className="w-full p-2 text-sm border rounded"
              placeholder="Or paste image URL..."
            />
            <input
              type="text"
              value={comp.props.alt || ''}
              onChange={(e) => updateColumnComponent(compIndex, { ...comp.props, alt: e.target.value })}
              className="w-full p-2 text-sm border rounded"
              placeholder="Alt text..."
            />
            <input
              type="text"
              value={comp.props.caption || ''}
              onChange={(e) => updateColumnComponent(compIndex, { ...comp.props, caption: e.target.value })}
              className="w-full p-2 text-sm border rounded"
              placeholder="Caption (optional)..."
            />
          </div>
        );

      case COMPONENT_TYPES.COLUMNS:
        const nestedColumnCount = comp.props.columnCount || 2;
        const nestedGridCols =
          nestedColumnCount === 2
            ? "grid-cols-2"
            : nestedColumnCount === 3
            ? "grid-cols-3"
            : "grid-cols-4";

        return (
          <div className="space-y-3 border-2 border-purple-200 rounded-lg p-3 bg-purple-50/30">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-purple-700">Nested Columns:</label>
              <select
                value={nestedColumnCount}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value);
                  const currentNestedColumns = comp.props.columns || [];
                  const newNestedColumns = Array.from(
                    { length: newCount },
                    (_, i) => currentNestedColumns[i] || { components: [] }
                  );
                  updateColumnComponent(compIndex, {
                    ...comp.props,
                    columnCount: newCount,
                    columns: newNestedColumns,
                  });
                }}
                className="px-2 py-1 text-xs border rounded"
              >
                {[2, 3, 4].map((count) => (
                  <option key={count} value={count}>
                    {count} Columns
                  </option>
                ))}
              </select>
            </div>
            <div className={`grid ${nestedGridCols} gap-2`}>
              {(comp.props.columns || []).map((nestedCol, nestedColIndex) => (
                <ColumnDropZone
                  key={`nested-col-${compIndex}-${nestedColIndex}`}
                  columnIndex={nestedColIndex}
                  parentIndex={parentIndex}
                  components={nestedCol.components || []}
                  updateColumn={(newNestedComponents) => {
                    const currentNestedColumns = comp.props.columns || [];
                    const newNestedColumns = currentNestedColumns.map(
                      (col: { components: Component[] }, idx: number) =>
                        idx === nestedColIndex
                          ? { components: [...newNestedComponents] }
                          : { ...col, components: [...col.components] }
                    );
                    updateColumnComponent(compIndex, {
                      ...comp.props,
                      columns: newNestedColumns,
                    });
                  }}
                  removeFromMainCanvas={removeFromMainCanvas}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-[200px] p-3 border-2 border-dashed rounded-lg transition-colors ${
        showDropZone ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-xs text-gray-400 mb-2 font-medium">
        Column {columnIndex + 1}
      </div>

      {components.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          Drop components here
        </div>
      ) : (
        <div className="space-y-2">
          {components.map((comp, compIndex) => (
            <div
              key={compIndex}
              className="relative group bg-white p-3 rounded border border-gray-200"
            >
              <button
                onClick={() => deleteColumnComponent(compIndex)}
                className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
              >
                <Trash2 size={12} />
              </button>
              <div className="text-xs text-gray-400 mb-1 uppercase">
                {comp.type}
              </div>
              {renderColumnComponent(comp, compIndex)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component Renderer
export const ComponentRenderer: React.FC<ComponentRendererInternalProps> = ({ 
  component, 
  index, 
  updateComponent, 
  deleteComponent, 
  moveComponent,
  removeFromMainCanvas,
  setUserActionFlag,
  getComponents,
  setComponentsDirect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropIndicator, setShowDropIndicator] = useState<'top' | 'bottom' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    // Only allow drag from the grip handle
    if (e.target !== dragHandleRef.current && !dragHandleRef.current?.contains(e.target as Node)) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentIndex', index.toString());
    e.dataTransfer.setData('isNewComponent', 'false');
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setShowDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if it's a new component from sidebar or existing component
    const isNewComponent = e.dataTransfer.types.includes('componenttype');
    
    // Get the component element bounds
    const rect = e.currentTarget.getBoundingClientRect();
    
    // More generous drop zone - 40% top, 40% bottom, 20% middle
    const topZone = rect.top + (rect.height * 0.4);
    const bottomZone = rect.bottom - (rect.height * 0.4);

    if (e.clientY < topZone) {
      setShowDropIndicator("top");
      e.dataTransfer.dropEffect = isNewComponent ? "copy" : "move";
    } else if (e.clientY > bottomZone) {
      setShowDropIndicator("bottom");
      e.dataTransfer.dropEffect = isNewComponent ? "copy" : "move";
    } else {
      setShowDropIndicator(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the component
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setShowDropIndicator(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isNewComponent = e.dataTransfer.getData("isNewComponent") === "true";
    const componentType = e.dataTransfer.getData("componentType");
    const fromIndexStr = e.dataTransfer.getData("componentIndex");
    
    const rect = e.currentTarget.getBoundingClientRect();
    const topZone = rect.top + (rect.height * 0.4);
    const dropPosition = e.clientY < topZone ? index : index + 1;

    if (isNewComponent && componentType) {
      // Adding new component from sidebar
      const newComponent: Component = {
        type: componentType,
        props: getDefaultPropsForDrop(componentType),
      };

      // Mark as user action
      (window as any).__setUserAction?.();

      const currentComponents = (window as any).currentComponents || [];
      const newComponents = [...currentComponents];
      newComponents.splice(dropPosition, 0, newComponent);
      (window as any).setComponentsFromDrop(newComponents);
    } else if (fromIndexStr) {
      // Moving existing component
      const fromIndex = parseInt(fromIndexStr);
      if (!isNaN(fromIndex) && fromIndex !== index) {
        let targetIndex = dropPosition;
        if (fromIndex < dropPosition) {
          targetIndex--;
        }
        moveComponent(fromIndex, targetIndex);
      }
    }

    setShowDropIndicator(null);
  };

  const getDefaultPropsForDrop = (type: string): ComponentProps => {
    switch (type) {
      case COMPONENT_TYPES.HEADING:
        return { text: "New Heading", level: 2 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { content: "<p>Start typing...</p>" };
      case COMPONENT_TYPES.IMAGE:
        return { src: "", alt: "", caption: "" };
      case COMPONENT_TYPES.COLUMNS:
        return {
          columnCount: 2,
          columns: [{ components: [] }, { components: [] }],
        };
      default:
        return {};
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      updateComponent(index, {
        ...component.props,
        src: imageUrl,
        alt: component.props.alt || file.name.replace(/\.[^/.]+$/, ""),
      });
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    updateComponent(index, { 
      ...component.props, 
      src: '',
      alt: '',
      caption: '',
      width: undefined,
      height: undefined
    });
  };

  // Handle text selection state
  const handleTextFocus = () => {
    setIsEditing(true);
  };

  const handleTextBlur = () => {
    // Use setTimeout to allow click events to complete before setting editing to false
    setTimeout(() => {
      setIsEditing(false);
    }, 150);
  };

  const renderComponent = () => {
    switch (component.type) {
      case COMPONENT_TYPES.HEADING:
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={component.props.text || ""}
              onChange={(e) =>
                updateComponent(index, {
                  ...component.props,
                  text: e.target.value,
                })
              }
              className="w-full text-3xl font-bold p-2 border-2 border-dashed border-transparent hover:border-gray-300 focus:border-blue-500 outline-none rounded"
              placeholder="Heading text..."
              onFocus={handleTextFocus}
              onBlur={handleTextBlur}
            />
            <select
              value={component.props.level || 2}
              onChange={(e) =>
                updateComponent(index, {
                  ...component.props,
                  level: parseInt(e.target.value),
                })
              }
              className="px-3 py-1 border rounded"
            >
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <option key={level} value={level}>
                  H{level}
                </option>
              ))}
            </select>
          </div>
        );

      case COMPONENT_TYPES.PARAGRAPH:
        return (
          <RichTextEditor
            content={component.props.content || '<p>Start typing...</p>'}
            onChange={(html: string) => {
              const { text, ...restProps } = component.props;
              updateComponent(index, { ...component.props, content: html });
            }}
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
          />
        );

      case COMPONENT_TYPES.IMAGE:
        return (
          <div className="space-y-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {component.props.src ? (
              <ResizableImage
                src={component.props.src}
                alt={component.props.alt || ''}
                width={component.props.width}
                height={component.props.height}
                onResize={(width, height) => {
                  console.log('🔵 onResize called in ComponentRenderer:', width, height);
                  console.log('🟢 Calling updateComponent with new dimensions');
                  updateComponent(index, { 
                    ...component.props, 
                    width, 
                    height 
                  });
                  console.log('🟢 updateComponent called successfully');
                }}
                onRemove={handleRemoveImage}
              />
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full h-48 bg-gray-100 border-dotted border-3 border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold italic hover:border-gray-400 hover:text-gray-500 transition-colors ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? "Uploading..." : "Click here to upload Image"}
              </button>
            )}
            <input
              type="text"
              value={component.props.src || ""}
              onChange={(e) =>
                updateComponent(index, {
                  ...component.props,
                  src: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              placeholder="Image URL..."
              onFocus={handleTextFocus}
              onBlur={handleTextBlur}
            />
            <input
              type="text"
              value={component.props.alt || ""}
              onChange={(e) =>
                updateComponent(index, {
                  ...component.props,
                  alt: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              placeholder="Alt text..."
              onFocus={handleTextFocus}
              onBlur={handleTextBlur}
            />
            <input
              type="text"
              value={component.props.caption || ""}
              onChange={(e) =>
                updateComponent(index, {
                  ...component.props,
                  caption: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              placeholder="Caption (optional)..."
              onFocus={handleTextFocus}
              onBlur={handleTextBlur}
            />
          </div>
        );

      case COMPONENT_TYPES.COLUMNS:
        const columnCount = component.props.columnCount || 2;
        const gridCols =
          columnCount === 2
            ? "grid-cols-2"
            : columnCount === 3
            ? "grid-cols-3"
            : "grid-cols-4";

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Columns:</label>
              <select
                value={columnCount}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value);
                  const currentColumns = component.props.columns || [];
                  const newColumns = Array.from(
                    { length: newCount },
                    (_, i) => currentColumns[i] || { components: [] }
                  );
                  updateComponent(index, {
                    ...component.props,
                    columnCount: newCount,
                    columns: newColumns,
                  });
                }}
                className="px-3 py-1 border rounded"
              >
                {COLUMN_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {count} Columns
                  </option>
                ))}
              </select>
            </div>
            <div className={`grid ${gridCols} gap-4`}>
              {(component.props.columns || []).map((col, colIndex) => (
                <ColumnDropZone
                  key={`col-${colIndex}-${
                    component.props.columns?.length || 0
                  }`}
                  columnIndex={colIndex}
                  parentIndex={index}
                  components={col.components || []}
                  updateColumn={(newComponents) => {
                    if (setComponentsDirect) {
                      (window as any).__setUserAction?.();
                      setComponentsDirect((prevComponents) => {
                        const currentComponent = prevComponents[index];
                        if (
                          !currentComponent ||
                          currentComponent.type !== COMPONENT_TYPES.COLUMNS
                        ) {
                          return prevComponents;
                        }

                        const currentColumns =
                          currentComponent.props.columns || [];
                        const newColumns = currentColumns.map(
                          (col: { components: Component[] }, idx: number) =>
                            idx === colIndex
                              ? { components: [...newComponents] }
                              : { ...col, components: [...col.components] }
                        );

                        const updatedComponents = [...prevComponents];
                        updatedComponents[index] = {
                          ...currentComponent,
                          props: {
                            ...currentComponent.props,
                            columns: newColumns,
                          },
                        };

                        return updatedComponents;
                      });
                    } else {
                      const currentColumns = component.props.columns || [];
                      const newColumns = currentColumns.map(
                        (col: { components: Component[] }, idx: number) =>
                          idx === colIndex
                            ? { components: [...newComponents] }
                            : { ...col, components: [...col.components] }
                      );
                      updateComponent(index, {
                        ...component.props,
                        columns: newColumns,
                      });
                    }
                  }}
                  removeFromMainCanvas={removeFromMainCanvas}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-lg p-4 mb-4 border-2 ${
        isEditing ? "border-blue-500" : "border-gray-200"
      } hover:border-gray-300 transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {showDropIndicator === "top" && (
        <div className="absolute -top-1 left-0 right-0 h-2 bg-blue-500 rounded-full z-50" />
      )}
      {showDropIndicator === "bottom" && (
        <div className="absolute -bottom-1 left-0 right-0 h-2 bg-blue-500 rounded-full z-50" />
      )}
      
      {/* Drag handle - only this element should be draggable */}
      <div 
        ref={dragHandleRef}
        className="absolute -left-8 top-4 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <GripVertical size={20} className="text-gray-400" />
      </div>

      <button
        onClick={() => deleteComponent(index)}
        className="absolute -right-3 -top-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
      >
        <Trash2 size={16} />
      </button>

      <div className="text-xs text-gray-500 mb-2 font-medium uppercase">
        {component.type}
      </div>

      {renderComponent()}
    </div>
  );
};