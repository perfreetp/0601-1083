import { create } from 'zustand';
import type { Project, Material, ColorScheme, DesignStyle, DesignVersion, ExportConfig, Review, ReviewComment, ProofreadReport } from '@/types';
import { mockProjects, mockColorSchemes } from '@/utils/mockData';
import { generateColorScheme } from '@/utils/colorUtils';
import { createExportPackage, getTimeAgo } from '@/utils/exportUtils';

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  proofreadReport: ProofreadReport | null;
  activeTab: string;
  
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
  exportProject: () => Promise<void>;
  setProofreadReport: (report: ProofreadReport | null) => void;
  setActiveTab: (tab: string) => void;
  createNewProject: (name: string, museumName: string) => void;
  updateProgress: () => void;
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
  projects: mockProjects,
  currentProjectId: mockProjects[0]?.id || null,
  currentProject: mockProjects[0] || null,
  isLoading: false,
  error: null,
  proofreadReport: null,
  activeTab: 'dashboard',

  setCurrentProject: (id: string) => {
    const project = get().projects.find(p => p.id === id);
    set({
      currentProjectId: id,
      currentProject: project || null,
    });
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
  },

  setStyle: (style: DesignStyle) => {
    get().updateProject({ currentStyle: style });
  },

  generateLayouts: () => {
    const { currentProject } = get();
    if (!currentProject) return;

    const newVersion: DesignVersion = {
      id: `v_${Date.now()}`,
      version: currentProject.versions.length + 1,
      style: currentProject.currentStyle,
      layouts: [],
      colorScheme: currentProject.colorScheme,
      createdAt: new Date().toISOString(),
      creator: '当前用户',
      description: '自动生成版式',
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
  },

  updateExportConfig: (config: Partial<ExportConfig>) => {
    const { currentProject } = get();
    if (!currentProject) return;

    get().updateProject({
      exportConfig: { ...currentProject.exportConfig, ...config },
    });
  },

  exportProject: async () => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ isLoading: true });
    try {
      await createExportPackage(currentProject, currentProject.exportConfig);
    } catch (error) {
      set({ error: '导出失败，请重试' });
    } finally {
      set({ isLoading: false });
    }
  },

  setProofreadReport: (report: ProofreadReport | null) => {
    set({ proofreadReport: report });
  },

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
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
  },
}));
