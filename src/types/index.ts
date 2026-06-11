export type ProjectStatus = 'draft' | 'designing' | 'reviewing' | 'completed';
export type DesignStyle = 'elegant' | 'playful' | 'festive' | 'minimal';
export type MaterialType = 'exhibit' | 'pattern' | 'copy' | 'auth';
export type LayoutType = 'box' | 'tag' | 'sticker' | 'bag' | 'card';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string[];
  contrast: string[];
}

export type AuthStatus = 'verified' | 'pending' | 'missing';

export interface Material {
  id: string;
  type: MaterialType;
  name: string;
  url?: string;
  content?: string;
  description: string;
  tags: string[];
  authScope?: string[];
  authStatus?: AuthStatus;
  contentSummary?: string;
  createdAt: string;
}

export interface LayoutElement {
  id: string;
  type: 'image' | 'text' | 'pattern' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, string | number>;
}

export interface Layout {
  id: string;
  type: LayoutType;
  name: string;
  size: { width: number; height: number; unit: string };
  previewUrl: string;
  elements: LayoutElement[];
}

export interface DesignVersion {
  id: string;
  version: number;
  style: DesignStyle;
  layouts: Layout[];
  colorScheme: ColorScheme;
  createdAt: string;
  creator: string;
  description?: string;
}

export interface ReviewComment {
  id: string;
  author: string;
  content: string;
  position?: { x: number; y: number };
  createdAt: string;
  resolved: boolean;
}

export interface Review {
  id: string;
  versionId: string;
  score: number;
  comments: ReviewComment[];
  status: ReviewStatus;
  createdAt: string;
  reviewer: string;
}

export interface ExportConfig {
  formats: string[];
  namingRule: string;
  includeSpec: boolean;
  includePreview: boolean;
  dpi: number;
}

export interface ExportFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  museumName: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  currentStyle: DesignStyle;
  colorScheme: ColorScheme;
  materials: Material[];
  versions: DesignVersion[];
  reviews: Review[];
  exportConfig: ExportConfig;
  description?: string;
}

export interface ProofreadResult {
  id: string;
  type: 'era' | 'person' | 'museum' | 'forbidden';
  text: string;
  position: { start: number; end: number };
  suggestion: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ProofreadReport {
  id: string;
  content: string;
  results: ProofreadResult[];
  checkedAt: string;
  totalIssues: number;
}

export interface User {
  id: string;
  name: string;
  role: 'designer' | 'reviewer' | 'admin';
  avatar: string;
}

export interface DeliveryLayoutItem {
  type: string;
  name: string;
  size: string;
  formats: string[];
  previewUrl?: string;
}

export interface DeliveryRecord {
  id: string;
  projectId: string;
  projectName: string;
  museumName: string;
  createdAt: string;
  layouts: DeliveryLayoutItem[];
  formats: string[];
  fileCount: number;
  includeSpec: boolean;
  includePreview: boolean;
  dpi: number;
  namingRule: string;
  packageContent: string;
  files: ExportFile[];
  totalSize: number;
}
