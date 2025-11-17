// Component types matching your Puck config
export const COMPONENT_TYPES = {
  HEADING: 'Heading',
  PARAGRAPH: 'Paragraph',
  RICH_TEXT: 'TiptapRichText',
  IMAGE: 'ImageBlock',
  COLUMNS: 'ColumnBlock'
} as const;

// Column count options
export const COLUMN_OPTIONS = [2, 3, 4] as const;

// Type definitions
export interface ComponentProps {
  text?: string;
  level?: number;
  content?: string;
  src?: string;
  alt?: string;
  caption?: string;
  columns?: Array<{ components: Component[] }>;
  columnCount?: number;
}

export interface Component {
  type: string;
  props: ComponentProps;
}

export interface CustomEditorData {
  content: Component[];
  root?: { props: Record<string, any> };
}

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface ComponentRendererProps {
  component: Component;
  index: number;
  updateComponent: (index: number, newProps: ComponentProps) => void;
  deleteComponent: (index: number) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
}

export interface ColumnDropZoneProps {
  columnIndex: number;
  parentIndex: number;
  components: Component[];
  updateColumn: (components: Component[]) => void;
  onMoveFromCanvas?: (fromIndex: number, component: Component) => void;
  removeFromMainCanvas?: (index: number) => void;
}

export interface ComponentRendererInternalProps extends ComponentRendererProps {
  removeFromMainCanvas?: (index: number) => void;
  setUserActionFlag?: () => void;
  getComponents?: () => Component[];
  setComponentsDirect?: (updater: (prev: Component[]) => Component[]) => void;
}

export interface CustomEditorProps {
  data: CustomEditorData;
  onChange: (data: CustomEditorData) => void;
  onPublish: (data: CustomEditorData) => void;
}