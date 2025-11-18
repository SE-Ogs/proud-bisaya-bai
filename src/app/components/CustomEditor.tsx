"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, GripVertical, Plus, Type, Image, Layout, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

// Component types matching your Puck config
const COMPONENT_TYPES = {
  HEADING: 'Heading',
  PARAGRAPH: 'Paragraph',
  RICH_TEXT: 'TiptapRichText',
  IMAGE: 'ImageBlock',
  COLUMNS: 'ColumnBlock'
};

// Column count options
const COLUMN_OPTIONS = [2, 3, 4];

export interface CustomEditorData {
  content: Component[];
  root?: { props: Record<string, any> };
}

// Type definitions
interface ComponentProps {
  text?: string;
  level?: number;
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
  columns?: Array<{ components: Component[] }>;
  columnCount?: number;
}

interface Component {
  type: string;
  props: ComponentProps;
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface ComponentRendererProps {
  component: Component;
  index: number;
  updateComponent: (index: number, newProps: ComponentProps) => void;
  deleteComponent: (index: number) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
}

// Column Drop Zone Component
interface ColumnDropZoneProps {
  columnIndex: number;
  parentIndex: number;
  components: Component[];
  updateColumn: (components: Component[]) => void;
  onMoveFromCanvas?: (fromIndex: number, component: Component) => void;
  removeFromMainCanvas?: (index: number) => void;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({ 
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
      // Adding new component from sidebar
      const newComponent: Component = {
        type: componentType,
        props: getDefaultPropsForColumn(componentType)
      };
      updateColumn([...components, newComponent]);
    } else if (fromIndexStr) {
      // Moving existing component from canvas
      const fromIndex = parseInt(fromIndexStr);
      if (!isNaN(fromIndex)) {
        const currentComponents = (window as any).currentComponents || [];
        const componentToMove = currentComponents[fromIndex];
        
        if (componentToMove && componentToMove.type !== COMPONENT_TYPES.COLUMNS) {
          // Create a deep copy of the component to avoid reference issues
          const componentCopy: Component = JSON.parse(JSON.stringify(componentToMove));
          
          // Store the fromIndex in a closure-safe variable
          const componentIndexToRemove = fromIndex;
          const componentToMoveRef = componentToMove; // Store reference for comparison
          
          // Add to column immediately - use the current components prop
          const newColumnComponents = [...components, componentCopy];
          
          // Call updateColumn to update the column's state
          updateColumn(newColumnComponents);
          
          // Remove from main canvas after React has had time to process the column update
          // Use a longer delay to ensure the state update has propagated
          setTimeout(() => {
            if (removeFromMainCanvas) {
              // Get the current components array from the window (which should be updated)
              const currentComponents = (window as any).currentComponents || [];
              // Verify the component still exists at that index before removing
              if (currentComponents[componentIndexToRemove]) {
                removeFromMainCanvas(componentIndexToRemove);
              }
            } else {
              // Fallback to window method
              const updatedComponents = (window as any).currentComponents || [];
              // Only remove if component at that index matches what we're moving
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
        return { text: 'Column Heading', level: 3 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { text: 'Column paragraph text.' };
      case COMPONENT_TYPES.RICH_TEXT:
        return { content: '<p>Column content...</p>' };
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
          <textarea
            value={comp.props.text || ''}
            onChange={(e) => updateColumnComponent(compIndex, { ...comp.props, text: e.target.value })}
            className="w-full min-h-[80px] p-2 border rounded resize-none text-sm"
            placeholder="Paragraph..."
          />
        );

      case COMPONENT_TYPES.RICH_TEXT:
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

// Rich Text Editor Component
const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, onFocus, onBlur }) => {
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

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      const selection = window.getSelection();
      const hadFocus = editorRef.current.contains(document.activeElement);
      let cursorPosition = 0;
      
      // Save cursor position if editor has focus
      if (hadFocus && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorPosition = preCaretRange.toString().length;
      }
      
      // Update content
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = content || '<p>Start typing...</p>';
      isUpdatingRef.current = false;
      
      // Restore cursor position if it had focus
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

// Component Renderer
interface ComponentRendererInternalProps extends ComponentRendererProps {
  removeFromMainCanvas?: (index: number) => void;
  setUserActionFlag?: () => void;
  getComponents?: () => Component[];
  setComponentsDirect?: (updater: (prev: Component[]) => Component[]) => void;
}

const ComponentRenderer: React.FC<ComponentRendererInternalProps> = ({ 
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
        // Insert at specific position
        const newComponents = [...(window as any).currentComponents];
        newComponents.splice(dropPosition, 0, newComponent);
        (window as any).setComponentsFromDrop(newComponents);
      }
    } else {
      const fromIndex = parseInt(e.dataTransfer.getData('componentIndex'));
      if (!isNaN(fromIndex) && fromIndex !== index) {
        let targetIndex = dropPosition;
        // Adjust target index if moving from before to after
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
        return { text: 'New paragraph text.' };
      case COMPONENT_TYPES.RICH_TEXT:
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
          <textarea
            value={component.props.text || ''}
            onChange={(e) => updateComponent(index, { ...component.props, text: e.target.value })}
            className="w-full min-h-[100px] p-4 border-2 border-dashed border-gray-300 hover:border-gray-400 focus:border-blue-500 outline-none rounded resize-none"
            placeholder="Paragraph text..."
          />
        );

      case COMPONENT_TYPES.RICH_TEXT:
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
            {component.props.src ? (
              <img src={component.props.src} alt={component.props.alt || ''} className="w-full rounded-lg" />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                No image
              </div>
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
                     // Use setComponentsDirect if available to get fresh state, otherwise use updateComponent
                     if (setComponentsDirect) {
                       // Mark as user action via the parent's mechanism
                       (window as any).__setUserAction?.();
                       setComponentsDirect((prevComponents) => {
                         const currentComponent = prevComponents[index];
                         if (!currentComponent || currentComponent.type !== COMPONENT_TYPES.COLUMNS) {
                           return prevComponents;
                         }
                         
                         const currentColumns = currentComponent.props.columns || [];
                         const newColumns = currentColumns.map((col: { components: Component[] }, idx: number) => 
                           idx === colIndex 
                             ? { components: [...newComponents] } // New object for updated column
                             : { ...col, components: [...col.components] } // New object for other columns
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
                       // Fallback to updateComponent
                       const currentColumns = component.props.columns || [];
                       const newColumns = currentColumns.map((col: { components: Component[] }, idx: number) => 
                         idx === colIndex 
                           ? { components: [...newComponents] } // New object for updated column
                           : { ...col, components: [...col.components] } // New object for other columns
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

// Main Custom Editor Component
interface CustomEditorProps {
  data: CustomEditorData;
  onChange: (data: CustomEditorData) => void;
  onPublish: (data: CustomEditorData) => void;
}

export function CustomEditor({ data, onChange, onPublish }: CustomEditorProps) {
  const [components, setComponents] = useState<Component[]>(data.content || []);
  const [showCanvasDropZone, setShowCanvasDropZone] = useState(false);
  const isInitialMountRef = useRef(true);
  const lastSyncedDataRef = useRef<string>(JSON.stringify(data.content || []));
  const isUserActionRef = useRef(false);
  const skipNextSyncRef = useRef(false);

  // Expose components and setter to window for drop handling
  useEffect(() => {
    (window as any).currentComponents = components;
    (window as any).setComponentsFromDrop = (newComponents: Component[]) => {
      isUserActionRef.current = true;
      setComponents(newComponents);
    };
    (window as any).__setUserAction = () => {
      isUserActionRef.current = true;
    };
  }, [components]);

  // Sync from props only when data actually changes externally (not from our onChange)
  useEffect(() => {
    if (isInitialMountRef.current) {
      lastSyncedDataRef.current = JSON.stringify(data.content || []);
      isInitialMountRef.current = false;
      return;
    }

    // Skip if we just triggered the update ourselves
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      lastSyncedDataRef.current = JSON.stringify(data.content || []);
      return;
    }

    const currentDataStr = JSON.stringify(data.content || []);
    const lastSyncedStr = lastSyncedDataRef.current;

    // Only sync if data changed and it wasn't from a user action
    if (currentDataStr !== lastSyncedStr && !isUserActionRef.current) {
      setComponents(data.content || []);
      lastSyncedDataRef.current = currentDataStr;
    }
  }, [data]);

  // Only call onChange when components change due to user interaction
  useEffect(() => {
    if (isInitialMountRef.current) {
      return;
    }

    const currentComponentsStr = JSON.stringify(components);
    const lastSyncedStr = lastSyncedDataRef.current;

    // Only call onChange if:
    // 1. Components actually changed
    // 2. It was a user action
    // 3. It's different from what we last synced
    if (currentComponentsStr !== lastSyncedStr && isUserActionRef.current) {
      isUserActionRef.current = false;
      skipNextSyncRef.current = true; // Skip the next sync from props
      lastSyncedDataRef.current = currentComponentsStr;
      onChange({ content: components, root: data.root || { props: {} } });
    }
  }, [components, onChange, data.root]);

  const addComponent = (type: string) => {
    isUserActionRef.current = true;
    const newComponent: Component = {
      type,
      props: getDefaultProps(type)
    };
    setComponents([...components, newComponent]);
  };

  const getDefaultProps = (type: string): ComponentProps => {
    switch (type) {
      case COMPONENT_TYPES.HEADING:
        return { text: 'New Heading', level: 2 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { text: 'New paragraph text.' };
      case COMPONENT_TYPES.RICH_TEXT:
        return { content: '<p>Start typing...</p>' };
      case COMPONENT_TYPES.IMAGE:
        return { src: '', alt: '', caption: '' };
      case COMPONENT_TYPES.COLUMNS:
        return { columns: [{ components: [] }, { components: [] }] };
      default:
        return {};
    }
  };

  const updateComponent = useCallback((index: number, newProps: ComponentProps) => {
    isUserActionRef.current = true;
    setComponents(prevComponents => {
      const newComponents = [...prevComponents];
      // Create a completely new component object to ensure React detects the change
      const currentComponent = prevComponents[index];
      newComponents[index] = { 
        ...currentComponent,
        type: currentComponent.type, // Preserve type
        props: { ...newProps } // Ensure props is also a new object
      };
      return newComponents;
    });
  }, []);

  const deleteComponent = (index: number) => {
    isUserActionRef.current = true;
    setComponents(components.filter((_, i) => i !== index));
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    isUserActionRef.current = true;
    const newComponents = [...components];
    const [movedComponent] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, movedComponent);
    setComponents(newComponents);
  };

  const handleSidebarDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.setData('isNewComponent', 'true');
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const isNewComponent = e.dataTransfer.types.includes('componenttype');
    if (isNewComponent || e.dataTransfer.types.includes('componentindex')) {
      setShowCanvasDropZone(true);
    }
  };

  const handleCanvasDragLeave = () => {
    setShowCanvasDropZone(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setShowCanvasDropZone(false);
    
    const isNewComponent = e.dataTransfer.getData('isNewComponent') === 'true';
    const componentType = e.dataTransfer.getData('componentType');
    
    if (isNewComponent && componentType) {
      addComponent(componentType);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - Components */}
      <div className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Components</h2>
        </div>
        <div className="p-4 space-y-2">
          <button
            draggable
            onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.HEADING)}
            onClick={() => addComponent(COMPONENT_TYPES.HEADING)}
            className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors cursor-move"
          >
            <Type size={20} className="text-gray-600" />
            <span className="font-medium">Heading</span>
          </button>
          <button
            draggable
            onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.PARAGRAPH)}
            onClick={() => addComponent(COMPONENT_TYPES.PARAGRAPH)}
            className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors cursor-move"
          >
            <Type size={20} className="text-gray-600" />
            <span className="font-medium">Paragraph</span>
          </button>
          <button
            draggable
            onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.RICH_TEXT)}
            onClick={() => addComponent(COMPONENT_TYPES.RICH_TEXT)}
            className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors cursor-move"
          >
            <Type size={20} className="text-gray-600" />
            <span className="font-medium">Rich Text</span>
          </button>
          <button
            draggable
            onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.IMAGE)}
            onClick={() => addComponent(COMPONENT_TYPES.IMAGE)}
            className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors cursor-move"
          >
            <Image size={20} className="text-gray-600" />
            <span className="font-medium">Image</span>
          </button>
          <button
            draggable
            onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.COLUMNS)}
            onClick={() => addComponent(COMPONENT_TYPES.COLUMNS)}
            className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors cursor-move"
          >
            <Layout size={20} className="text-gray-600" />
            <span className="font-medium">Columns</span>
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40 px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => console.log('SEO')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              SEO
            </button>
            <button
              onClick={() => console.log('Preview')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Preview
            </button>
            <button
              onClick={() => onPublish({ content: components, root: data.root || { props: {} } })}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Create
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div 
          className="max-w-5xl mx-auto px-4 py-8"
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
        >
          <div className="pl-8">
            {components.length === 0 ? (
              <div className={`text-center py-16 border-2 border-dashed rounded-lg transition-colors ${
                showCanvasDropZone ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}>
                <p className="text-lg text-gray-400">No components yet</p>
                <p className="text-sm mt-2 text-gray-400">Drag components from the left sidebar or click to add</p>
              </div>
             ) : (
               components.map((component, index) => (
                 <ComponentRenderer
                   key={index}
                   component={component}
                   index={index}
                   updateComponent={updateComponent}
                   deleteComponent={deleteComponent}
                   moveComponent={moveComponent}
                   removeFromMainCanvas={(fromIndex) => {
                     isUserActionRef.current = true;
                     setComponents(prevComponents => prevComponents.filter((_, i) => i !== fromIndex));
                   }}
                   setComponentsDirect={setComponents}
                 />
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}