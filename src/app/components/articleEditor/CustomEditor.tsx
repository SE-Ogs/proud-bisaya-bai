"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Type, Image, Layout, PanelLeft, GripVertical } from "lucide-react";
import { ComponentRenderer } from "@/app/components/articleEditor/ComponentsCustomEditor";
import {
  COMPONENT_TYPES,
  Component,
  ComponentProps,
  CustomEditorData,
  CustomEditorProps,
} from "@/app/components/articleEditor/PropsCustomEditor";

export function CustomEditor({ data, onChange, onPublish }: CustomEditorProps) {
  const [components, setComponents] = useState<Component[]>(data.content || []);
  const [showCanvasDropZone, setShowCanvasDropZone] = useState(false);
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
      props: getDefaultProps(type),
    };
    setComponents([...components, newComponent]);
  };

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

  const updateComponent = useCallback(
    (index: number, newProps: ComponentProps) => {
      isUserActionRef.current = true;
      setComponents((prevComponents) => {
        const newComponents = [...prevComponents];
        const currentComponent = prevComponents[index];
        newComponents[index] = {
          ...currentComponent,
          type: currentComponent.type,
          props: { ...newProps },
        };
        return newComponents;
      });
    },
    []
  );

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

  const handleSidebarDragStart = (
    e: React.DragEvent,
    componentType: string
  ) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("componentType", componentType);
    e.dataTransfer.setData("isNewComponent", "true");
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

    const isNewComponent = e.dataTransfer.getData("isNewComponent") === "true";
    const componentType = e.dataTransfer.getData("componentType");

    if (isNewComponent && componentType) {
      addComponent(componentType);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 pt-4">
      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto top-64px">
        {/* Header */}
        <div className="bg-white border-b border-gray-400 fixed top-64px z-40 px-6 py-4 flex w-full">
          <div className="col-span-1 flex-1">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeft size={20} className="text-gray-600" />
              ) : (
                <PanelLeft size={20} className="text-gray-600" />
              )}
            </button>
          </div>
          <div className="flex gap-2 flex-1 justify-end">
            <button
              onClick={() => console.log("SEO")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              SEO
            </button>
            <button
              onClick={() => console.log("Preview")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Preview
            </button>
            <button
              onClick={() =>
                onPublish({
                  content: components,
                  root: data.root || { props: {} },
                })
              }
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Create
            </button>
          </div>
        </div>

        <div className="flex-auto relative">
          {/* Left Sidebar - Components */}
          <div
            className={`fixed left-0 pt-16 bg-white border-r min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarCollapsed
                ? "-translate-x-full w-85"
                : "translate-x-0 w-85"
            }`}
            style={{
              visibility: isSidebarCollapsed ? "hidden" : "visible",
              zIndex: 30,
            }}
          >
            <div className="p-4 border-b border-gray-300 mt-3">
              <h2 className="text-lg font-bold text-gray-800">Components</h2>
            </div>
            <div className="p-4 space-y-2">
              <button
                draggable
                onDragStart={(e) =>
                  handleSidebarDragStart(e, COMPONENT_TYPES.HEADING)
                }
                onClick={() => addComponent(COMPONENT_TYPES.HEADING)}
                onMouseDown={(e) =>
                  e.currentTarget.setAttribute("draggable", "true")
                }
                className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
              >
                <Type size={20} className="text-gray-600 flex-shrink-0" />
                <span className="font-medium flex-1 ml-3">Heading</span>
                <GripVertical
                  size={20}
                  className="text-gray-400 flex-shrink-0"
                />
              </button>
              <button
                draggable
                onDragStart={(e) =>
                  handleSidebarDragStart(e, COMPONENT_TYPES.PARAGRAPH)
                }
                onClick={() => addComponent(COMPONENT_TYPES.PARAGRAPH)}
                onMouseDown={(e) =>
                  e.currentTarget.setAttribute("draggable", "true")
                }
                className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
              >
                <Type size={20} className="text-gray-600 flex-shrink-0" />
                <span className="font-medium flex-1 ml-3">Paragraph</span>
                <GripVertical
                  size={20}
                  className="text-gray-400 flex-shrink-0"
                />
              </button>
              <button
                draggable
                onDragStart={(e) =>
                  handleSidebarDragStart(e, COMPONENT_TYPES.IMAGE)
                }
                onClick={() => addComponent(COMPONENT_TYPES.IMAGE)}
                onMouseDown={(e) =>
                  e.currentTarget.setAttribute("draggable", "true")
                }
                className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
              >
                <Image size={20} className="text-gray-600 flex-shrink-0" />
                <span className="font-medium flex-1 ml-3">Image</span>
                <GripVertical
                  size={20}
                  className="text-gray-400 flex-shrink-0"
                />
              </button>
              <button
                draggable
                onDragStart={(e) =>
                  handleSidebarDragStart(e, COMPONENT_TYPES.COLUMNS)
                }
                onClick={() => addComponent(COMPONENT_TYPES.COLUMNS)}
                onMouseDown={(e) =>
                  e.currentTarget.setAttribute("draggable", "true")
                }
                className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-move"
              >
                <Layout size={20} className="text-gray-600 flex-shrink-0" />
                <span className="font-medium flex-1 ml-3">Columns</span>
                <GripVertical
                  size={20}
                  className="text-gray-400 flex-shrink-0"
                />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? "ml-0" : "ml-85"
            }`}
          >
            <div
              className="max-w-screen mx-10 py-8 pt-28"
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
            >
              <div className="">
                {components.length === 0 ? (
                  <div
                    className={`text-center py-16 border-2 border-dashed rounded-lg transition-colors ${
                      showCanvasDropZone
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
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
                        setComponents((prevComponents) =>
                          prevComponents.filter((_, i) => i !== fromIndex)
                        );
                      }}
                      setComponentsDirect={setComponents}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
