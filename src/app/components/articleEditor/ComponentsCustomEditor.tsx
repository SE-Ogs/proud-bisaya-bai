"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, X } from 'lucide-react';
import {
  COMPONENT_TYPES,
  COLUMN_OPTIONS,
  Component,
  ComponentProps,
  RichTextEditorProps,
  ColumnDropZoneProps,
  ComponentRendererInternalProps
} from '@/app/components/articleEditor/PropsCustomEditor';

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

// Rich Text Editor Component
export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onFocus, onBlur }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const isUpdatingRef = useRef(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current && !isUpdatingRef.current) {
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
      editorRef.current.innerHTML = content || '<p>Start typing...</p>';
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
              execCommand('bold');
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('italic');
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('underline');
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
              execCommand('justifyLeft');
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('justifyCenter');
            }}
            className="px-3 py-1 rounded border hover:bg-gray-100"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execCommand('justifyRight');
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
  removeFromMainCanvas
}) => {
  const [showDropZone, setShowDropZone] = useState(false);

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

    const isNewComponent = e.dataTransfer.getData('isNewComponent') === 'true';
    const componentType = e.dataTransfer.getData('componentType');
    const fromIndexStr = e.dataTransfer.getData('componentIndex');

    if (isNewComponent && componentType) {
      const newComponent: Component = {
        type: componentType,
        props: getDefaultPropsForColumn(componentType)
      };
      updateColumn([...components, newComponent]);
    } else if (fromIndexStr) {
      const fromIndex = parseInt(fromIndexStr);
      if (!isNaN(fromIndex)) {
        const currentComponents = (window as any).currentComponents || [];
        const componentToMove = currentComponents[fromIndex];
        
        if (componentToMove && componentToMove.type !== COMPONENT_TYPES.COLUMNS) {
          const componentCopy: Component = JSON.parse(JSON.stringify(componentToMove));
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
              if (updatedComponents[componentIndexToRemove] === componentToMoveRef) {
                const newMainComponents = updatedComponents.filter((_: Component, i: number) => i !== componentIndexToRemove);
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
        return { text: '', level: 3 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { content: '<p></p>' };
      case COMPONENT_TYPES.IMAGE:
        return { src: '', alt: '', caption: '' };
      default:
        return {};
    }
  };

  const deleteColumnComponent = (compIndex: number) => {
    updateColumn(components.filter((_, i) => i !== compIndex));
  };

  const updateColumnComponent = (compIndex: number, newProps: ComponentProps) => {
    const newComponents = [...components];
    newComponents[compIndex] = { ...newComponents[compIndex], props: newProps };
    updateColumn(newComponents);
  };

  const moveColumnComponent = (fromIndex: number, toIndex: number) => {
    const newComponents = [...components];
    const [movedComponent] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, movedComponent);
    updateColumn(newComponents);
  };

  const renderColumnComponent = (comp: Component, compIndex: number) => {
    switch (comp.type) {
      case COMPONENT_TYPES.HEADING:
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={comp.props.text || ''}
              onChange={(e) => updateColumnComponent(compIndex, { ...comp.props, text: e.target.value })}
              className="w-full text-xl font-bold p-2 border rounded"
              placeholder="Heading..."
            />
            <select
              value={comp.props.level || 3}
              onChange={(e) => updateColumnComponent(compIndex, { ...comp.props, level: parseInt(e.target.value) })}
              className="px-2 py-1 text-sm border rounded"
            >
              {[1, 2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>H{level}</option>
              ))}
            </select>
          </div>
        );

      case COMPONENT_TYPES.PARAGRAPH:
        return (
          <RichTextEditor
            content={comp.props.content || '<p>Type here...</p>'}
            onChange={(html: string) => updateColumnComponent(compIndex, { ...comp.props, content: html })}
          />
        );

      case COMPONENT_TYPES.IMAGE:
        return (
          <div className="space-y-2">
            {comp.props.src ? (
              <img src={comp.props.src} alt={comp.props.alt || ''} className="w-full rounded" />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                No image
              </div>
            )}
            <input
              type="text"
              value={comp.props.src || ''}
              onChange={(e) => updateColumnComponent(compIndex, { ...comp.props, src: e.target.value })}
              className="w-full p-2 text-sm border rounded"
              placeholder="Image URL..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-[200px] p-3 border-2 border-dashed rounded-lg transition-colors ${
        showDropZone ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-xs text-gray-400 mb-2 font-medium">Column {columnIndex + 1}</div>
      
      {components.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          Drop components here
        </div>
      ) : (
        <div className="space-y-2">
          {components.map((comp, compIndex) => (
            <div key={compIndex} className="relative group bg-white p-3 rounded border border-gray-200">
              <button
                onClick={() => deleteColumnComponent(compIndex)}
                className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
              >
                <Trash2 size={12} />
              </button>
              <div className="text-xs text-gray-400 mb-1 uppercase">{comp.type}</div>
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
  setComponentsDirect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropIndicator, setShowDropIndicator] = useState<'top' | 'bottom' | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentIndex', index.toString());
    e.dataTransfer.setData('isNewComponent', 'false');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    if (e.clientY < midpoint) {
      setShowDropIndicator('top');
      e.dataTransfer.dropEffect = 'move';
    } else {
      setShowDropIndicator('bottom');
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = () => {
    setShowDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isNewComponent = e.dataTransfer.getData('isNewComponent') === 'true';
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropPosition = e.clientY < midpoint ? index : index + 1;
    
    if (isNewComponent) {
      const componentType = e.dataTransfer.getData('componentType');
      if (componentType) {
        const newComponent: Component = {
          type: componentType,
          props: getDefaultPropsForDrop(componentType)
        };
        const newComponents = [...(window as any).currentComponents];
        newComponents.splice(dropPosition, 0, newComponent);
        (window as any).setComponentsFromDrop(newComponents);
      }
    } else {
      const fromIndex = parseInt(e.dataTransfer.getData('componentIndex'));
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
        return { text: 'New Heading', level: 2 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { content: '<p>Start typing...</p>' };
      case COMPONENT_TYPES.IMAGE:
        return { src: '', alt: '', caption: '' };
      case COMPONENT_TYPES.COLUMNS:
        return { 
          columnCount: 2,
          columns: [{ components: [] }, { components: [] }] 
        };
      default:
        return {};
    }
  };

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

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      updateComponent(index, { 
        ...component.props, 
        src: imageUrl,
        alt: component.props.alt || file.name.replace(/\.[^/.]+$/, "")
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
      caption: ''
    });
  };

  const renderComponent = () => {
    switch (component.type) {
      case COMPONENT_TYPES.HEADING:
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={component.props.text || ''}
              onChange={(e) => updateComponent(index, { ...component.props, text: e.target.value })}
              className="w-full text-3xl font-bold p-2 border-2 border-dashed border-transparent hover:border-gray-300 focus:border-blue-500 outline-none rounded"
              placeholder="Heading text..."
            />
            <select
              value={component.props.level || 2}
              onChange={(e) => updateComponent(index, { ...component.props, level: parseInt(e.target.value) })}
              className="px-3 py-1 border rounded"
            >
              {[1, 2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>H{level}</option>
              ))}
            </select>
          </div>
        );

      case COMPONENT_TYPES.PARAGRAPH:
        return (
          <RichTextEditor
            content={component.props.content || '<p>Start typing...</p>'}
            onChange={(html: string) => updateComponent(index, { ...component.props, content: html })}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
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
              <div className="relative group/image">
                <img src={component.props.src} alt={component.props.alt || ''} className="w-full rounded-lg" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
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
              value={component.props.src || ''}
              onChange={(e) => updateComponent(index, { ...component.props, src: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Image URL..."
            />
            <input
              type="text"
              value={component.props.alt || ''}
              onChange={(e) => updateComponent(index, { ...component.props, alt: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Alt text..."
            />
            <input
              type="text"
              value={component.props.caption || ''}
              onChange={(e) => updateComponent(index, { ...component.props, caption: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Caption (optional)..."
            />
          </div>
        );

      case COMPONENT_TYPES.COLUMNS:
        const columnCount = component.props.columnCount || 2;
        const gridCols = columnCount === 2 ? 'grid-cols-2' : columnCount === 3 ? 'grid-cols-3' : 'grid-cols-4';
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Columns:</label>
              <select
                value={columnCount}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value);
                  const currentColumns = component.props.columns || [];
                  const newColumns = Array.from({ length: newCount }, (_, i) => 
                    currentColumns[i] || { components: [] }
                  );
                  updateComponent(index, { 
                    ...component.props, 
                    columnCount: newCount,
                    columns: newColumns 
                  });
                }}
                className="px-3 py-1 border rounded"
              >
                {COLUMN_OPTIONS.map(count => (
                  <option key={count} value={count}>{count} Columns</option>
                ))}
              </select>
            </div>
             <div className={`grid ${gridCols} gap-4`}>
               {(component.props.columns || []).map((col, colIndex) => (
                 <ColumnDropZone
                   key={`col-${colIndex}-${component.props.columns?.length || 0}`}
                   columnIndex={colIndex}
                   parentIndex={index}
                   components={col.components || []}
                   updateColumn={(newComponents) => {
                     if (setComponentsDirect) {
                       (window as any).__setUserAction?.();
                       setComponentsDirect((prevComponents) => {
                         const currentComponent = prevComponents[index];
                         if (!currentComponent || currentComponent.type !== COMPONENT_TYPES.COLUMNS) {
                           return prevComponents;
                         }
                         
                         const currentColumns = currentComponent.props.columns || [];
                         const newColumns = currentColumns.map((col: { components: Component[] }, idx: number) => 
                           idx === colIndex 
                             ? { components: [...newComponents] }
                             : { ...col, components: [...col.components] }
                         );
                         
                         const updatedComponents = [...prevComponents];
                         updatedComponents[index] = {
                           ...currentComponent,
                           props: {
                             ...currentComponent.props,
                             columns: newColumns
                           }
                         };
                         
                         return updatedComponents;
                       });
                     } else {
                       const currentColumns = component.props.columns || [];
                       const newColumns = currentColumns.map((col: { components: Component[] }, idx: number) => 
                         idx === colIndex 
                           ? { components: [...newComponents] }
                           : { ...col, components: [...col.components] }
                       );
                       updateComponent(index, { 
                         ...component.props,
                         columns: newColumns
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
        isEditing ? 'border-blue-500' : 'border-gray-200'
      } hover:border-gray-300 transition-colors`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {showDropIndicator === 'top' && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full" />
      )}
      {showDropIndicator === 'bottom' && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 rounded-full" />
      )}
      
      <div className="absolute -left-8 top-4 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={20} className="text-gray-400" />
      </div>

      <button
        onClick={() => deleteComponent(index)}
        className="absolute -right-3 -top-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <Trash2 size={16} />
      </button>

      <div className="text-xs text-gray-500 mb-2 font-medium uppercase">{component.type}</div>

      {renderComponent()}
    </div>
  );
};