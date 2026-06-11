import { create } from 'zustand';
import type { Project, Material, ColorScheme, DesignStyle, DesignVersion, ExportConfig, Review, ReviewComment, ProofreadReport, ExportFile } from '@/types';
import { mockProjects, mockColorSchemes } from '@/utils/mockData';
import { generateColorScheme } from '@/utils/colorUtils';
import { createExportPackage, getTimeAgo } from '@/utils/exportUtils';

const STORAGE_KEY = 'museum_creative_design_platform_v1';

interface PersistedState {
  projects: Project[];
  currentProjectId: string | null;
  activeTab: string;
  exportHistory: ExportFile[];
}

const loadFromStorage = (): PersistedState | null => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
};

const saveToStorage = (state: PersistedState) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore
  }
};

const persisted = loadFromStorage();

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  proofreadReport: ProofreadReport | null;
  activeTab: string;
  exportHistory: ExportFile[];
  
  setCurrentProject: (id: string) => void;
  updateProject: (data: Partial<Project>) => void;
  addMaterial: (material: Material) => void;
  removeMaterial: (id: string) => void;
  setStyle: (style: DesignStyle) => void;
  generateLayouts: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  generateColorSchemeFromImage: (imageUrl: string, name: string) => Promise<void>;
  saveVersion: (description?: string) => void;
  rollbackVersion: (versionId: string) => void;
  addReviewComment: (versionId: string, comment: Omit<ReviewComment, 'id' | 'createdAt' | 'resolved'>) => void;
  setReviewScore: (versionId: string, score: number) => void;
  setReviewStatus: (versionId: string, status: 'pending' | 'approved' | 'rejected') => void;
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  exportProject: (files?: ExportFile[]) => Promise<void>;
  addExportHistory: (files: ExportFile[]) => void;
  clearExportHistory: () => void;
  setProofreadReport: (report: ProofreadReport | null) => void;
  setActiveTab: (tab: string) => void;
  createNewProject: (name: string, museumName: string) => void;
  updateProgress: () => void;
  _persist: () => void;
}

const calculateProgress = (project: Project): number => {
  let progress = 0;
  if (project.materials.length > 0) progress += 15;
  if (project.currentStyle) progress += 10;
  if (project.versions.length > 0) progress += 25;
  if (project.colorScheme) progress += 15;
  if (project.reviews.length > 0) progress += 20;
  if (project.status === 'completed') progress = 100;
  return Math.min(100, progress);
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: persisted?.projects && persisted.projects.length > 0 ? persisted.projects : mockProjects,
  currentProjectId: persisted?.currentProjectId || (persisted?.projects && persisted.projects.length > 0 ? persisted.projects[0].id : (mockProjects[0]?.id || null)),
  currentProject: (persisted?.projects && persisted.projects.length > 0 
    ? (persisted.projects.find(p => p.id === (persisted.currentProjectId || persisted.projects[0].id)) || null)
    : mockProjects[0] || null),
  isLoading: false,
  error: null,
  proofreadReport: null,
  activeTab: persisted?.activeTab || 'dashboard',
  exportHistory: persisted?.exportHistory || [],

  setCurrentProject: (id: string) => {
    const project = get().projects.find(p => p.id === id);
    set({
      currentProjectId: id,
      currentProject: project || null,
    });
    get()._persist();
  },

  updateProject: (data: Partial<Project>) => {
    const { currentProjectId, projects } = get();
    if (!currentProjectId) return;

    const updatedProjects = projects.map(p =>
      p.id === currentProjectId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    const updatedCurrent = updatedProjects.find(p => p.id === currentProjectId) || null;

    set({
      projects: updatedProjects,
      currentProject: updatedCurrent ? {
        ...updatedCurrent,
        progress: calculateProgress(updatedCurrent)
      } : null,
    });
    get()._persist();
  },

  addMaterial: (material: Material) => {
    const { currentProjectId, projects } = get();
    if (!currentProjectId) return;

    const updatedProjects = projects.map(p =>
      p.id === currentProjectId
        ? {
            ...p,
            materials: [...p.materials, material],
            updatedAt: new Date().toISOString(),
          }
        : p
    );

    const updatedCurrent = updatedProjects.find(p => p.id === currentProjectId);
    set({
      projects: updatedProjects,
      currentProject: updatedCurrent ? {
        ...updatedCurrent,
        progress: calculateProgress(updatedCurrent)
      } : null,
    });
    get()._persist();
  },

  removeMaterial: (id: string) => {
    const { currentProjectId, projects } = get();
    if (!currentProjectId) return;

    const updatedProjects = projects.map(p =>
      p.id === currentProjectId
        ? {
            ...p,
            materials: p.materials.filter(m => m.id !== id),
            updatedAt: new Date().toISOString(),
          }
        : p
    );

    const updatedCurrent = updatedProjects.find(p => p.id === currentProjectId);
    set({
      projects: updatedProjects,
      currentProject: updatedCurrent ? {
        ...updatedCurrent,
        progress: calculateProgress(updatedCurrent)
      } : null,
    });
    get()._persist();
  },

  setStyle: (style: DesignStyle) => {
    get().updateProject({ currentStyle: style });
  },

  generateLayouts: () => {
    const { currentProject } = get();
    if (!currentProject) return;

    const style = currentProject.currentStyle;
    const exhibitMaterial = currentProject.materials.find(m => m.type === 'exhibit');
    const exhibitImage = exhibitMaterial?.url || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(style + ' style museum cultural relic artifact elegant traditional')}&image_size=square_hd`;

    const styleNames: Record<string, string> = {
      elegant: '典雅',
      playful: '童趣',
      festive: '节庆',
      minimal: '极简',
    };

    const createPreviewUrl = (type: string, name: string) => {
      return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${styleNames[style]} style ${type} ${name} packaging design for museum cultural product traditional chinese aesthetic ${currentProject.museumName}`)}&image_size=landscape_4_3`;
    };

    const layouts: DesignVersion['layouts'] = [
      {
        id: `l_box_${Date.now()}`,
        type: 'box',
        name: '产品包装盒',
        size: { width: 200, height: 150, unit: 'mm' },
        previewUrl: createPreviewUrl('gift box', '包装盒'),
        elements: [
          { id: 'e1', type: 'image', x: 50, y: 20, width: 100, height: 100, content: exhibitImage, style: { borderRadius: '8px' } },
          { id: 'e2', type: 'text', x: 20, y: 130, width: 160, height: 15, content: currentProject.name, style: { fontSize: '14px', fontWeight: 'bold' } },
          { id: 'e3', type: 'text', x: 20, y: 145, width: 160, height: 10, content: currentProject.museumName, style: { fontSize: '10px', opacity: '0.7' } },
        ]
      },
      {
        id: `l_tag_${Date.now()}`,
        type: 'tag',
        name: '产品吊牌',
        size: { width: 60, height: 100, unit: 'mm' },
        previewUrl: createPreviewUrl('hang tag label', '吊牌'),
        elements: [
          { id: 'e1', type: 'shape', x: 25, y: 5, width: 10, height: 10, content: 'hole', style: { borderRadius: '50%', backgroundColor: '#f5f0e6' } },
          { id: 'e2', type: 'image', x: 10, y: 20, width: 40, height: 40, content: exhibitImage, style: { borderRadius: '4px' } },
          { id: 'e3', type: 'text', x: 5, y: 65, width: 50, height: 15, content: currentProject.museumName, style: { fontSize: '9px', textAlign: 'center' } },
          { id: 'e4', type: 'text', x: 5, y: 82, width: 50, height: 12, content: '￥99.00', style: { fontSize: '12px', fontWeight: 'bold', color: '#8B2323' } },
        ]
      },
      {
        id: `l_sticker_${Date.now()}`,
        type: 'sticker',
        name: '装饰贴纸',
        size: { width: 80, height: 80, unit: 'mm' },
        previewUrl: createPreviewUrl('sticker decal', '贴纸'),
        elements: [
          { id: 'e1', type: 'pattern', x: 0, y: 0, width: 80, height: 80, content: 'border', style: { borderStyle: 'dashed', borderWidth: '2px' } },
          { id: 'e2', type: 'image', x: 15, y: 15, width: 50, height: 50, content: exhibitImage, style: { borderRadius: '50%' } },
          { id: 'e3', type: 'text', x: 10, y: 68, width: 60, height: 10, content: currentProject.museumName, style: { fontSize: '8px', textAlign: 'center' } },
        ]
      },
      {
        id: `l_bag_${Date.now()}`,
        type: 'bag',
        name: '手提袋',
        size: { width: 300, height: 400, unit: 'mm' },
        previewUrl: createPreviewUrl('shopping tote bag', '手提袋'),
        elements: [
          { id: 'e1', type: 'shape', x: 100, y: 10, width: 100, height: 30, content: 'handle', style: { borderRadius: '15px', border: '3px solid #8B2323' } },
          { id: 'e2', type: 'image', x: 75, y: 80, width: 150, height: 150, content: exhibitImage, style: { borderRadius: '12px' } },
          { id: 'e3', type: 'text', x: 50, y: 250, width: 200, height: 30, content: currentProject.name, style: { fontSize: '20px', fontWeight: 'bold', textAlign: 'center' } },
          { id: 'e4', type: 'text', x: 50, y: 290, width: 200, height: 20, content: currentProject.museumName, style: { fontSize: '14px', textAlign: 'center', opacity: '0.7' } },
          { id: 'e5', type: 'text', x: 50, y: 330, width: 200, height: 20, content: '承千年文脉 · 藏一世匠心', style: { fontSize: '12px', textAlign: 'center', fontStyle: 'italic' } },
        ]
      },
      {
        id: `l_card_${Date.now()}`,
        type: 'card',
        name: '说明卡',
        size: { width: 120, height: 180, unit: 'mm' },
        previewUrl: createPreviewUrl('information card brochure', '说明卡'),
        elements: [
          { id: 'e1', type: 'text', x: 10, y: 10, width: 100, height: 20, content: currentProject.name, style: { fontSize: '14px', fontWeight: 'bold', textAlign: 'center' } },
          { id: 'e2', type: 'image', x: 20, y: 40, width: 80, height: 60, content: exhibitImage, style: { borderRadius: '6px' } },
          { id: 'e3', type: 'text', x: 10, y: 110, width: 100, height: 50, content: exhibitMaterial?.description || '精选馆藏文物元素，融合现代设计美学，让传统文化走入日常生活。', style: { fontSize: '10px', lineHeight: '1.5' } },
          { id: 'e4', type: 'text', x: 10, y: 165, width: 100, height: 12, content: currentProject.museumName, style: { fontSize: '10px', textAlign: 'center', opacity: '0.6' } },
        ]
      }
    ];

    const newVersion: DesignVersion = {
      id: `v_${Date.now()}`,
      version: currentProject.versions.length + 1,
      style: style,
      layouts,
      colorScheme: currentProject.colorScheme,
      createdAt: new Date().toISOString(),
      creator: '当前用户',
      description: `自动生成${styleNames[style]}风格全套5种版式`,
    };

    const updatedVersions = [...currentProject.versions, newVersion];
    get().updateProject({ versions: updatedVersions });
  },

  setColorScheme: (scheme: ColorScheme) => {
    get().updateProject({ colorScheme: scheme });
  },

  generateColorSchemeFromImage: async (imageUrl: string, name: string) => {
    set({ isLoading: true });
    try {
      const { extractDominantColor } = await import('@/utils/colorUtils');
      const dominantColor = await extractDominantColor(imageUrl);
      const scheme = generateColorScheme(dominantColor, name);
      if (scheme) {
        get().updateProject({ colorScheme: scheme });
      }
    } catch (error) {
      set({ error: '提取颜色失败，请重试' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveVersion: (description?: string) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const newVersion: DesignVersion = {
      id: `v_${Date.now()}`,
      version: currentProject.versions.length + 1,
      style: currentProject.currentStyle,
      layouts: currentProject.versions[currentProject.versions.length - 1]?.layouts || [],
      colorScheme: currentProject.colorScheme,
      createdAt: new Date().toISOString(),
      creator: '当前用户',
      description: description || `版本 ${currentProject.versions.length + 1}`,
    };

    const updatedVersions = [...currentProject.versions, newVersion];
    get().updateProject({ versions: updatedVersions });
  },

  rollbackVersion: (versionId: string) => {
    const { currentProject } = get();
    if (!currentProject) return;

    const targetVersion = currentProject.versions.find(v => v.id === versionId);
    if (!targetVersion) return;

    get().updateProject({
      currentStyle: targetVersion.style,
      colorScheme: targetVersion.colorScheme,
    });
  },

  addReviewComment: (versionId: string, commentData: Omit<ReviewComment, 'id' | 'createdAt' | 'resolved'>) => {
    const { currentProject, projects, currentProjectId } = get();
    if (!currentProject || !currentProjectId) return;

    const newComment: ReviewComment = {
      ...commentData,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    const updatedProjects = projects.map(p => {
      if (p.id !== currentProjectId) return p;
      
      const existingReview = p.reviews.find(r => r.versionId === versionId);
      let updatedReviews: Review[];
      
      if (existingReview) {
        updatedReviews = p.reviews.map(r =>
          r.versionId === versionId
            ? { ...r, comments: [...r.comments, newComment] }
            : r
        );
      } else {
        updatedReviews = [
          ...p.reviews,
          {
            id: `r_${Date.now()}`,
            versionId,
            score: 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            reviewer: '当前用户',
            comments: [newComment],
          },
        ];
      }
      
      return { ...p, reviews: updatedReviews, updatedAt: new Date().toISOString() };
    });

    const updatedCurrent = updatedProjects.find(p => p.id === currentProjectId);
    set({
      projects: updatedProjects,
      currentProject: updatedCurrent || null,
    });
    get()._persist();
  },

  setReviewScore: (versionId: string, score: number) => {
    const { currentProject, projects, currentProjectId } = get();
    if (!currentProject || !currentProjectId) return;

    const updatedProjects = projects.map(p => {
      if (p.id !== currentProjectId) return p;
      
      const existingReview = p.reviews.find(r => r.versionId === versionId);
      let updatedReviews: Review[];
      
      if (existingReview) {
        updatedReviews = p.reviews.map(r =>
          r.versionId === versionId ? { ...r, score } : r
        );
      } else {
        updatedReviews = [
          ...p.reviews,
          {
            id: `r_${Date.now()}`,
            versionId,
            score,
            status: 'pending',
            createdAt: new Date().toISOString(),
            reviewer: '当前用户',
            comments: [],
          },
        ];
      }
      
      return { ...p, reviews: updatedReviews, updatedAt: new Date().toISOString() };
    });

    const updatedCurrent = updatedProjects.find(p => p.id === currentProjectId);
    set({
      projects: updatedProjects,
      currentProject: updatedCurrent || null,
    });
    get()._persist();
  },

  setReviewStatus: (versionId: string, status: 'pending' | 'approved' | 'rejected') => {
    const { currentProject, projects, currentProjectId } = get();
    if (!currentProject || !currentProjectId) return;

    const updatedProjects = projects.map(p => {
      if (p.id !== currentProjectId) return p;
      
      const updatedReviews = p.reviews.map(r =>
        r.versionId === versionId ? { ...r, status } : r
      );
      
      const projectStatus = status === 'approved' ? 'completed' : 
                           status === 'rejected' ? 'designing' : p.status;
      
      return { 
        ...p, 
        reviews: updatedReviews, 
        status: projectStatus,
        updatedAt: new Date().toISOString() 
      };
    });

    const updatedCurrent = updatedProjects.find(p => p.id === currentProjectId);
    set({
      projects: updatedProjects,
      currentProject: updatedCurrent ? {
        ...updatedCurrent,
        progress: calculateProgress(updatedCurrent)
      } : null,
    });
    get()._persist();
  },

  updateExportConfig: (config: Partial<ExportConfig>) => {
    const { currentProject } = get();
    if (!currentProject) return;

    get().updateProject({
      exportConfig: { ...currentProject.exportConfig, ...config },
    });
  },

  setProofreadReport: (report: ProofreadReport | null) => {
    set({ proofreadReport: report });
  },

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
    get()._persist();
  },

  createNewProject: (name: string, museumName: string) => {
    const newProject: Project = {
      id: `p_${Date.now()}`,
      name,
      museumName,
      status: 'draft',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStyle: 'elegant',
      colorScheme: mockColorSchemes[0],
      materials: [],
      versions: [],
      reviews: [],
      exportConfig: {
        formats: ['PNG', 'PDF'],
        namingRule: '{museum}_{style}_{layout}_{date}',
        includeSpec: true,
        includePreview: true,
        dpi: 300,
      },
    };

    set(state => ({
      projects: [...state.projects, newProject],
      currentProjectId: newProject.id,
      currentProject: newProject,
    }));
    get()._persist();
  },

  updateProgress: () => {
    const { currentProject, currentProjectId, projects } = get();
    if (!currentProject || !currentProjectId) return;

    const progress = calculateProgress(currentProject);
    const updatedProjects = projects.map(p =>
      p.id === currentProjectId ? { ...p, progress } : p
    );

    set({
      projects: updatedProjects,
      currentProject: { ...currentProject, progress },
    });
    get()._persist();
  },

  exportProject: async (files?: ExportFile[]) => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ isLoading: true });
    try {
      await createExportPackage(currentProject, currentProject.exportConfig);
      if (files && files.length > 0) {
        get().addExportHistory(files);
      }
    } catch (error) {
      set({ error: '导出失败，请重试' });
    } finally {
      set({ isLoading: false });
    }
  },

  addExportHistory: (files: ExportFile[]) => {
    set(state => ({
      exportHistory: [...files, ...state.exportHistory].slice(0, 100)
    }));
    get()._persist();
  },

  clearExportHistory: () => {
    set({ exportHistory: [] });
    get()._persist();
  },

  _persist: () => {
    const state = get();
    saveToStorage({
      projects: state.projects,
      currentProjectId: state.currentProjectId,
      activeTab: state.activeTab,
      exportHistory: state.exportHistory,
    });
  },
}));
