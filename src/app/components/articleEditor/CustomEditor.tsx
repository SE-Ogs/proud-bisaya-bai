"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Type, Image, Layout, PanelLeft, GripVertical, ChevronUp, ChevronDown, CornerUpLeft } from 'lucide-react';
import { ComponentRenderer } from '@/app/components/articleEditor/ComponentsCustomEditor';
import {
  COMPONENT_TYPES,
  Component,
  ComponentProps,
  CustomEditorData,
  CustomEditorProps
} from '@/app/components/articleEditor/PropsCustomEditor';

export function CustomEditor({ data, onChange, onPublish, isMetadataVisible = true, onToggleMetadata, metadata }: CustomEditorProps) {
  const [components, setComponents] = useState<Component[]>(data.content || []);
  const [showCanvasDropZone, setShowCanvasDropZone] = useState(false);
  const [showBottomDropZone, setShowBottomDropZone] = useState(false);
  const isInitialMountRef = useRef(true);
  const lastSyncedDataRef = useRef<string>(JSON.stringify(data.content || []));
  const isUserActionRef = useRef(false);
  const skipNextSyncRef = useRef(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  useEffect(() => {
    if (isInitialMountRef.current) {
      lastSyncedDataRef.current = JSON.stringify(data.content || []);
      isInitialMountRef.current = false;
      return;
    }

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      lastSyncedDataRef.current = JSON.stringify(data.content || []);
      return;
    }

    const currentDataStr = JSON.stringify(data.content || []);
    const lastSyncedStr = lastSyncedDataRef.current;

    if (currentDataStr !== lastSyncedStr && !isUserActionRef.current) {
      setComponents(data.content || []);
      lastSyncedDataRef.current = currentDataStr;
    }
  }, [data]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      return;
    }

    const currentComponentsStr = JSON.stringify(components);
    const lastSyncedStr = lastSyncedDataRef.current;

    if (currentComponentsStr !== lastSyncedStr && isUserActionRef.current) {
      isUserActionRef.current = false;
      skipNextSyncRef.current = true;
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
        return { text: '', level: 2 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { content: '<p></p>' };
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
      const currentComponent = prevComponents[index];
      newComponents[index] = {
        ...currentComponent,
        type: currentComponent.type,
        props: { ...newProps }
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

  // Bottom drop zone handlers
  const handleBottomDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBottomDropZone(true);
  };

  const handleBottomDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setShowBottomDropZone(false);
  };

  const handleBottomDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBottomDropZone(false);

    const isNewComponent = e.dataTransfer.getData('isNewComponent') === 'true';
    const componentType = e.dataTransfer.getData('componentType');

    if (isNewComponent && componentType) {
      // Add to the end
      isUserActionRef.current = true;
      const newComponent: Component = {
        type: componentType,
        props: getDefaultProps(componentType)
      };
      setComponents([...components, newComponent]);
    } else {
      // Moving existing component to end
      const fromIndex = parseInt(e.dataTransfer.getData('componentIndex'));
      if (!isNaN(fromIndex)) {
        moveComponent(fromIndex, components.length);
      }
    }
  };

  // Preview handler
  const handlePreview = () => {
    // Use the current components state (which has the latest dimensions)
    const previewData = { 
      content: components, 
      root: data.root || { props: {} } 
    };
    
    console.log('Preview data:', JSON.stringify(previewData, null, 2));
    sessionStorage.setItem('articlePreview', JSON.stringify(previewData));

    const previewMetadata = {
      title: metadata?.title || data.title || 'Article Preview',
      slug: metadata?.slug || data.slug || 'preview',
      author: metadata?.author || data.author || 'Author',
      category: metadata?.category || data.category || 'General',
      subcategory: metadata?.subcategory || data.subcategory || '',
      thumbnail_url: metadata?.thumbnail_url || data.thumbnail_url || '',
      created_at: metadata?.created_at || new Date().toISOString()
    };

    sessionStorage.setItem('articleMetadata', JSON.stringify(previewMetadata));

    const targetSlug = encodeURIComponent(previewMetadata.slug?.trim() || 'preview');
    window.open(`/admin/articles/${targetSlug}/preview`, '_blank');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-400 shrink-0 px-6 py-2 flex h-20 max-w-screen">
        <div className='grow flex-row w-5xl flex'>
          <a
            href="/admin/dashboard"
            className="px-3 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
            title="Go back to Dashboard"
          >
            <CornerUpLeft size={20} className="text-gray-600" />
          </a>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="px-3 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            <PanelLeft size={20} className="text-gray-600" />
          </button>

          <div className='pl-4 flex items-center w-full'>
            <div className='flex-col flex'>
              <div className='text-lg/5 font-bold pb-1'>
                {metadata?.title}
              </div>
              <div className='text-xs'>
                By {metadata?.author}  |  {metadata?.created_at && (
                  <>
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
        <div className="flex-auto flex flex-col overflow-hidden">
        </div>
        <div className="flex gap-2 flex-1 justify-end">
          <button
            onClick={() => console.log('SEO')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 my-3 rounded-lg font-semibold transition-colors"
          >
            SEO
          </button>
          <button
            onClick={handlePreview}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 my-3 rounded-lg font-semibold transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => onPublish({ content: components, root: data.root || { props: {} } })}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 my-3 rounded-lg font-semibold transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar - Components */}
        <div
          className={`bg-white border-r flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0' : 'w-85'
            }`}
          style={{
            visibility: isSidebarCollapsed ? 'hidden' : 'visible'
          }}
        >
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-lg font-bold text-gray-800">Components</h2>
          </div>
          <div className="p-4 space-y-2">
            <button
              draggable
              onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.HEADING)}
              onClick={() => addComponent(COMPONENT_TYPES.HEADING)}
              className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
            >
              <Type size={20} className="text-gray-600 flex-shrink-0" />
              <span className="font-medium flex-1 ml-3">Heading</span>
              <GripVertical size={20} className="text-gray-400 flex-shrink-0" />
            </button>
            <button
              draggable
              onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.PARAGRAPH)}
              onClick={() => addComponent(COMPONENT_TYPES.PARAGRAPH)}
              className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
            >
              <Type size={20} className="text-gray-600 flex-shrink-0" />
              <span className="font-medium flex-1 ml-3">Paragraph</span>
              <GripVertical size={20} className="text-gray-400 flex-shrink-0" />
            </button>
            <button
              draggable
              onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.IMAGE)}
              onClick={() => addComponent(COMPONENT_TYPES.IMAGE)}
              className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
            >
              <Image size={20} className="text-gray-600 flex-shrink-0" />
              <span className="font-medium flex-1 ml-3">Image</span>
              <GripVertical size={20} className="text-gray-400 flex-shrink-0" />
            </button>
            <button
              draggable
              onDragStart={(e) => handleSidebarDragStart(e, COMPONENT_TYPES.COLUMNS)}
              onClick={() => addComponent(COMPONENT_TYPES.COLUMNS)}
              className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
            >
              <Layout size={20} className="text-gray-600 flex-shrink-0" />
              <span className="font-medium flex-1 ml-3">Columns</span>
              <GripVertical size={20} className="text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>
        {/* Canvas - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Actual Canvas Area */}
          <div 
            className="max-w-screen mx-10 py-8 min-h-full"
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
          >
            {components.length === 0 ? (
              <div className={`text-center py-16 border-2 border-dashed rounded-lg transition-colors ${showCanvasDropZone ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}>
                <p className="text-lg text-gray-400">No components yet</p>
                <p className="text-sm mt-2 text-gray-400">Drag components from the left sidebar or click to add</p>
              </div>
            ) : (
              <>
                {components.map((component, index) => (
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
                ))}
                
                {/* Bottom drop zone */}
                <div
                  className={`h-auto mt-4 rounded-lg flex items-center justify-center`}
                  onDragOver={handleBottomDragOver}
                  onDragLeave={handleBottomDragLeave}
                  onDrop={handleBottomDrop}
                >
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}