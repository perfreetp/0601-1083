import React, { useState, useCallback } from 'react';
import { Upload, Image, FileText, Shield, X, Search, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { MaterialCard } from '@/components/common/MaterialCard';
import { cn } from '@/lib/utils';
import type { Material, MaterialType } from '@/types';

const tabs = [
  { id: 'all', label: '全部', icon: null },
  { id: 'exhibit', label: '展品图', icon: Image },
  { id: 'pattern', label: '纹样', icon: Image },
  { id: 'copy', label: '文案', icon: FileText },
  { id: 'auth', label: '授权', icon: Shield },
];

const typeConfig: Record<MaterialType, { label: string; color: string }> = {
  exhibit: { label: '展品图', color: 'bg-blue-500' },
  pattern: { label: '纹样', color: 'bg-purple-500' },
  copy: { label: '文案', color: 'bg-green-500' },
  auth: { label: '授权', color: 'bg-orange-500' },
};

interface UploadItem { id: string; file: File; progress: number; status: 'uploading' | 'success'; type: MaterialType; preview?: string; }

export default function Material() {
  const { currentProject, addMaterial, removeMaterial } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<MaterialType>('exhibit');

  const materials = currentProject?.materials || [];
  const filteredMaterials = materials.filter((m) => {
    const matchesTab = activeTab === 'all' || m.type === activeTab;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFiles = (files: File[]) => {
    const newItems: UploadItem[] = files.map((file, index) => ({
      id: `upload_${Date.now()}_${index}`, file, progress: 0, status: 'uploading', type: uploadType,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setUploadItems(prev => [...prev, ...newItems]);
    setShowUploadModal(true);
    newItems.forEach(item => simulateUpload(item.id));
  };

  const simulateUpload = (itemId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100; clearInterval(interval);
        setUploadItems(prev => prev.map(item => {
          if (item.id === itemId) {
            addMaterial({
              id: `m_${Date.now()}`, type: item.type,
              name: item.file.name.replace(/\.[^/.]+$/, ''),
              url: item.preview, description: '新上传的素材',
              tags: ['新上传'], createdAt: new Date().toISOString(),
            });
            return { ...item, progress: 100, status: 'success' };
          }
          return item;
        }));
      } else {
        setUploadItems(prev => prev.map(item => item.id === itemId ? { ...item, progress } : item));
      }
    }, 150);
  };

  const stats = [
    { type: 'exhibit', count: materials.filter(m => m.type === 'exhibit').length },
    { type: 'pattern', count: materials.filter(m => m.type === 'pattern').length },
    { type: 'copy', count: materials.filter(m => m.type === 'copy').length },
    { type: 'auth', count: materials.filter(m => m.type === 'auth').length },
  ];

  const TypeIcon = (type: MaterialType) => type === 'copy' ? FileText : type === 'auth' ? Shield : Image;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">素材管理</h1>
          <p className="text-gray-500">管理项目素材，支持上传、分类、搜索和预览</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="搜索素材..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10 w-64" />
          </div>
          <button onClick={() => document.getElementById('fileInput')?.click()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> 上传素材
          </button>
          <input id="fileInput" type="file" multiple accept="image/*,.txt,.doc,.docx,.pdf" className="hidden"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={stat.type} className={cn('card p-4 flex items-center gap-4 flex-1 animate-slide-up', `stagger-${index + 1}`)}>
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', typeConfig[stat.type as MaterialType].color)}>
              {React.createElement(TypeIcon(stat.type as MaterialType), { className: 'w-6 h-6' })}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-sm text-gray-500">{typeConfig[stat.type as MaterialType].label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
              activeTab === tab.id ? 'bg-primary-800 text-white shadow-card' : 'bg-white text-gray-600 hover:bg-stone-100 border border-stone-200'
            )}>
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            <span className={cn('px-2 py-0.5 rounded-full text-xs', activeTab === tab.id ? 'bg-white/20' : 'bg-stone-100')}>
              {tab.id === 'all' ? materials.length : materials.filter(m => m.type === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={cn('border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all duration-300',
          isDragging ? 'border-primary-500 bg-primary-50 scale-[1.01]' : 'border-stone-300 bg-stone-50/50 hover:border-primary-300 hover:bg-stone-50'
        )}>
        <div className="flex flex-col items-center gap-3">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300', isDragging ? 'bg-primary-100 scale-110' : 'bg-stone-100')}>
            <Upload className={cn('w-7 h-7 transition-colors', isDragging ? 'text-primary-600' : 'text-gray-400')} />
          </div>
          <p className="font-medium text-gray-700">{isDragging ? '松开鼠标上传文件' : '拖拽文件到此处上传'}</p>
          <p className="text-sm text-gray-500">支持 JPG、PNG、GIF、PDF、TXT 等格式</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">类型:</span>
            {(['exhibit', 'pattern', 'copy', 'auth'] as MaterialType[]).map((type) => (
              <button key={type} onClick={() => setUploadType(type)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all',
                  uploadType === type ? 'bg-primary-800 text-white' : 'bg-white text-gray-600 border border-stone-200 hover:border-primary-300'
                )}>{typeConfig[type].label}</button>
            ))}
          </div>
        </div>
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {filteredMaterials.map((material, index) => (
            <div key={material.id} className={cn('animate-slide-up', `stagger-${(index % 6) + 1}`)}>
              <MaterialCard material={material} onDelete={removeMaterial} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Image className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无素材</h3>
          <p className="text-gray-500 mb-4">点击上传按钮或拖拽文件开始添加</p>
          <button onClick={() => document.getElementById('fileInput')?.click()} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-2" /> 添加第一个素材
          </button>
        </div>
      )}

      {showUploadModal && uploadItems.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover w-full max-w-lg mx-4 animate-slide-up">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">上传进度</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {uploadItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl mb-3 last:mb-0">
                  {item.preview ? (
                    <img src={item.preview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-700 truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-300',
                          item.status === 'success' ? 'bg-green-500' : 'bg-primary-500'
                        )} style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{Math.round(item.progress)}%</span>
                    </div>
                  </div>
                  {item.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-stone-200 flex justify-end">
              <button onClick={() => setShowUploadModal(false)} className="btn-secondary">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
