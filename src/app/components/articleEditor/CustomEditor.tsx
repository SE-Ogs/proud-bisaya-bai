"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Type, Image, Layout, PanelLeft, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { ComponentRenderer } from '@/app/components/articleEditor/ComponentsCustomEditor';
import {
  COMPONENT_TYPES,
  Component,
  ComponentProps,
  CustomEditorData,
  CustomEditorProps,
} from "@/app/components/articleEditor/PropsCustomEditor";

export function CustomEditor({ data, onChange, onPublish, isMetadataVisible = true, onToggleMetadata, metadata }: CustomEditorProps) {
  const [components, setComponents] = useState<Component[]>(data.content || []);
  const [showCanvasDropZone, setShowCanvasDropZone] = useState(false);
  const isInitialMountRef = useRef(true);
  const lastSyncedDataRef = useRef<string>(JSON.stringify(data.content || []));
  const isUserActionRef = useRef(false);
  const skipNextSyncRef = useRef(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Make current components accessible for debugging
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

  // Sync external data changes
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
    if (isInitialMountRef.current) return;

    const currentComponentsStr = JSON.stringify(components);
    const lastSyncedStr = lastSyncedDataRef.current;

    if (currentComponentsStr !== lastSyncedStr && isUserActionRef.current) {
      console.log('🔄 Calling onChange with new components:', components);
      isUserActionRef.current = false;
      skipNextSyncRef.current = true;
      lastSyncedDataRef.current = currentComponentsStr;
      
      onChange({ 
        ...data,
        content: components 
      });
    }
  }, [components, onChange, data]);

  // Default props per component type
  const getDefaultProps = (type: string): ComponentProps => {
    switch (type) {
      case COMPONENT_TYPES.HEADING:
        return { text: "", level: 2 };
      case COMPONENT_TYPES.PARAGRAPH:
        return { content: "<p></p>" };
      case COMPONENT_TYPES.IMAGE:
        return { src: "", alt: "", caption: "" };
      case COMPONENT_TYPES.COLUMNS:
        return { columns: [{ components: [] }, { components: [] }] };
      default:
        return {};
    }
  };

  // Add new component
  const addComponent = (type: string) => {
    isUserActionRef.current = true;
    const newComponent: Component = { type, props: getDefaultProps(type) };
    setComponents([...components, newComponent]);
  };

  // Update existing component
  const updateComponent = useCallback((index: number, newProps: ComponentProps) => {
    isUserActionRef.current = true;
    setComponents(prev => {
      const newComponents = [...prev];
      const currentComponent = prev[index];
      newComponents[index] = {
        ...currentComponent,
        props: { ...newProps }
      };
      return newComponents;
    });
  }, []);

  // Delete component
  const deleteComponent = (index: number) => {
    isUserActionRef.current = true;
    setComponents(components.filter((_, i) => i !== index));
  };

  // Move component
  const moveComponent = (fromIndex: number, toIndex: number) => {
    isUserActionRef.current = true;
    const newComponents = [...components];
    const [movedComponent] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, movedComponent);
    setComponents(newComponents);
  };

  // Drag handling
  const handleSidebarDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.setData('isNewComponent', 'true');
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const isNewComponent = e.dataTransfer.types.includes("componenttype");
    if (isNewComponent || e.dataTransfer.types.includes("componentindex")) {
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
    if (isNewComponent && componentType) addComponent(componentType);
  };

  // Preview handler
  const handlePreview = () => {
    const previewData = { 
      content: components, 
      root: data.root || { props: {} } 
    };
    
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

  // Save handler
  const handleSave = () => {
    console.log('🔴 SAVE clicked - components:', components);
    const publishData = { 
      ...data,
      content: components 
    };
    console.log('🔴 Calling onPublish with:', publishData);
    onPublish(publishData);
  };

  return (
    <div className="flex h-full bg-gray-50 relative">
      {/* Sidebar - Changed from fixed to absolute */}
      <div
        className={`absolute left-0 top-0 bg-white border-r h-full transition-all duration-300 ease-in-out z-30 ${
          isSidebarCollapsed ? '-translate-x-full w-64' : 'translate-x-0 w-64'
        }`}
      >
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-800">Components</h2>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
          {[
            { type: COMPONENT_TYPES.HEADING, icon: <Type size={20} />, label: "Heading" },
            { type: COMPONENT_TYPES.PARAGRAPH, icon: <Type size={20} />, label: "Paragraph" },
            { type: COMPONENT_TYPES.IMAGE, icon: <Image size={20} />, label: "Image" },
            { type: COMPONENT_TYPES.COLUMNS, icon: <Layout size={20} />, label: "Columns" },
          ].map((item) => (
            <button
              key={item.type}
              draggable
              onDragStart={(e) => handleSidebarDragStart(e, item.type)}
              onClick={() => addComponent(item.type)}
              className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
            >
              {item.icon}
              <span className="font-medium flex-1 ml-3">{item.label}</span>
              <GripVertical size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-0' : 'ml-64'}`}>
        {/* Sticky Toolbar - Reduced z-index */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-300 px-6 py-4 z-20 flex items-center justify-between shadow-md">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            <PanelLeft size={20} className="text-gray-600" />
          </button>

          <div className="flex gap-2 items-center">
            {onToggleMetadata && (
              <button
                onClick={onToggleMetadata}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isMetadataVisible ? 'Hide metadata' : 'Show metadata'}
              >
                {isMetadataVisible !== false ? (
                  <ChevronUp size={20} className="text-gray-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600" />
                )}
              </button>
            )}
            <button
              onClick={handlePreview}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Preview
            </button>
            <button
              onClick={() => console.log('SEO')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              SEO
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Scrollable Canvas */}
        <div
          className="relative overflow-y-auto"
          style={{ height: 'calc(100% - 72px)' }}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
        >
          <div className="max-w-screen mx-10 py-8 min-h-full pt-4">
            {components.length === 0 ? (
              <div
                className={`text-center py-16 border-2 border-dashed rounded-lg transition-colors ${
                  showCanvasDropZone ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <p className="text-lg text-gray-400">No components yet</p>
                <p className="text-sm mt-2 text-gray-400">
                  Drag components from the left sidebar or click to add
                </p>
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
                    setComponents((prev) => prev.filter((_, i) => i !== fromIndex));
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