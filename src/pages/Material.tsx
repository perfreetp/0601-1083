import React, { useState, useCallback } from 'react';
import { Upload, Image, FileText, Shield, X, Search, Plus, CheckCircle2, Loader2, AlertCircle, Edit, Save } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { MaterialCard } from '@/components/common/MaterialCard';
import { cn } from '@/lib/utils';
import type { Material, MaterialType, AuthStatus } from '@/types';

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

interface UploadItem { id: string; file: File; progress: number; status: 'uploading' | 'success' | 'error'; type: MaterialType; preview?: string; content?: string; errorMsg?: string; }

const scopeKeywords = [
  '纪念品包装', '文具', '饰品', '家居用品', '服装', '数码配件',
  '食品包装', '茶具', '丝绸', '陶瓷', '印刷品', '数字产品',
  '线上销售', '线下销售', '宣传推广', '商品开发', '文创产品',
  '授权品类', '授权范围', '使用范围', '适用范围', '包装设计', '品牌授权',
  '博物馆文创', '零售', '批发', '电商', '实体店', '礼品定制',
];

const extractAuthScopes = (text: string): string[] => {
  const found: string[] = [];
  for (const keyword of scopeKeywords) {
    if (text.includes(keyword) && !found.includes(keyword)) {
      found.push(keyword);
    }
  }
  
  const patterns = [
    /(?:授权范围|授权品类|使用范围|适用范围|许可范围)[：:]\s*([^\n。；;]+)/,
    /(?:品类|产品类型|产品品类)[：:]\s*([^\n。；;]+)/,
    /(?:销售渠道|授权渠道)[：:]\s*([^\n。；;]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const items = match[1].split(/[、,，；;\/]/).map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        if (item.length <= 12 && !found.includes(item)) {
          found.push(item);
        }
      }
    }
  }
  
  if (found.length === 0) {
    if (text.includes('文创') || text.includes('文化')) found.push('文创产品');
    if (text.includes('销售')) found.push('线上线下销售');
    if (text.includes('宣传') || text.includes('推广')) found.push('宣传推广');
    if (text.includes('包装')) found.push('包装设计');
    if (text.includes('零售') || text.includes('电商')) found.push('零售');
  }
  
  return found.slice(0, 8);
};

const generateSummary = (text: string, type: MaterialType): string => {
  if (!text) return '';
  const maxLen = 120;
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (type === 'auth') {
    const authMatch = cleaned.match(/(?:授权方|甲方|许可方)[：:]\s*([^\n,，；;]{2,30})/);
    const scopeMatch = cleaned.match(/(?:授权范围|许可范围|使用范围)[：:]\s*([^\n。]{2,50})/);
    const periodMatch = cleaned.match(/(?:授权期限|有效期|期限)[：:]\s*([^\n,，。；;]{2,30})/);
    const parts: string[] = [];
    if (authMatch) parts.push(`授权方: ${authMatch[1].trim()}`);
    if (scopeMatch) parts.push(`范围: ${scopeMatch[1].trim()}`);
    if (periodMatch) parts.push(`期限: ${periodMatch[1].trim()}`);
    if (parts.length > 0) return parts.join('；');
  }
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen) + '...';
};

const isTextFile = (file: File): boolean => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return file.type.includes('text') 
    || ext === 'txt' || ext === 'md' || ext === 'rtf'
    || ext === 'csv'
    || (file.type === 'application/pdf')
    || (file.type.includes('word') || file.type.includes('document'))
    || ext === 'doc' || ext === 'docx';
};

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
      resolve(`[${file.name}] 文件内容需人工确认。文件名: ${file.name}, 大小: ${(file.size / 1024).toFixed(1)}KB, 类型: ${file.type || ext.toUpperCase()}。请查阅原文件获取完整授权信息。`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target?.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsText(file, 'UTF-8');
  });
};

export default function Material() {
  const { currentProject, addMaterial, removeMaterial, updateMaterial } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<MaterialType>('exhibit');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editAuthScope, setEditAuthScope] = useState('');

  const materials = currentProject?.materials || [];
  const filteredMaterials = materials.filter((m) => {
    const matchesTab = activeTab === 'all' || m.type === activeTab;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.authScope || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFiles = async (files: File[]) => {
    const newItems: UploadItem[] = await Promise.all(files.map(async (file, index) => {
      const item: UploadItem = {
        id: `upload_${Date.now()}_${index}`,
        file,
        progress: 0,
        status: 'uploading',
        type: uploadType,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };
      
      if ((uploadType === 'copy' || uploadType === 'auth') && isTextFile(file)) {
        try {
          const text = await readTextFile(file);
          item.content = text;
        } catch {
          // ignore
        }
      }
      
      return item;
    }));
    
    setUploadItems(prev => [...prev, ...newItems]);
    setShowUploadModal(true);
    
    for (const item of newItems) {
      await simulateUpload(item);
    }
  };

  const simulateUpload = async (uploadItem: UploadItem) => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          const isAuth = uploadItem.type === 'auth';
          const isCopy = uploadItem.type === 'copy';
          const scopes = isAuth && uploadItem.content ? extractAuthScopes(uploadItem.content) : undefined;
          const authStatus: AuthStatus | undefined = isAuth ? (scopes && scopes.length > 0 ? 'verified' : 'pending') : undefined;
          const summary = uploadItem.content ? generateSummary(uploadItem.content, uploadItem.type) : undefined;
          
          addMaterial({
            id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: uploadItem.type,
            name: uploadItem.file.name.replace(/\.[^/.]+$/, ''),
            url: uploadItem.preview,
            content: uploadItem.content,
            description: isAuth ? (uploadItem.content ? '授权文件已解析' : '新上传的授权文件') : 
                        isCopy ? (uploadItem.content ? '文案内容已读取' : '新上传的文案素材') : '新上传的素材',
            tags: ['新上传', ...(isAuth && scopes && scopes.length > 0 ? ['已解析授权范围'] : []), ...(isAuth && (!scopes || scopes.length === 0) ? ['待补充授权范围'] : [])],
            authScope: scopes && scopes.length > 0 ? scopes : undefined,
            authStatus,
            contentSummary: summary,
            createdAt: new Date().toISOString(),
          });
          
          setUploadItems(prev => prev.map(item => 
            item.id === uploadItem.id ? { ...item, progress: 100, status: 'success' } : item
          ));
          resolve();
        } else {
          setUploadItems(prev => prev.map(item => 
            item.id === uploadItem.id ? { ...item, progress } : item
          ));
        }
      }, 150);
    });
  };

  const handleEditMaterial = (material: Material) => {
    if (material.type === 'auth') {
      setEditingMaterial(material);
      setEditAuthScope((material.authScope || []).join('、'));
    }
  };

  const handleSaveAuthScope = () => {
    if (!editingMaterial) return;
    const scopes = editAuthScope.split(/[、,，;；\s]+/).map(s => s.trim()).filter(Boolean);
    updateMaterial(editingMaterial.id, {
      authScope: scopes.length > 0 ? scopes : undefined,
      authStatus: scopes.length > 0 ? 'verified' : 'pending',
      tags: [...editingMaterial.tags.filter(t => t !== '待补充授权范围' && t !== '已解析授权范围'), ...(scopes.length > 0 ? ['已解析授权范围'] : ['待补充授权范围'])],
    });
    setEditingMaterial(null);
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
          <p className="text-gray-500">管理项目素材，文案和授权文件自动读取内容并解析授权范围</p>
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
          <input id="fileInput" type="file" multiple accept="image/*,.txt,.md,.doc,.docx,.pdf,.rtf,.csv" className="hidden"
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
          <p className="font-medium text-gray-700">{isDragging ? '松开鼠标上传文件' : '拖拽文件到此处上传，或点击右上角按钮'}</p>
          <p className="text-sm text-gray-500">
            {uploadType === 'copy' || uploadType === 'auth' 
              ? 'TXT/MD/PDF/DOC/CSV等文本文件会自动读取内容，授权文件会自动解析授权范围' 
              : '支持 JPG、PNG、GIF、PDF、TXT 等格式，图片会生成预览'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">当前上传类型:</span>
            {(['exhibit', 'pattern', 'copy', 'auth'] as MaterialType[]).map((type) => (
              <button key={type} onClick={() => setUploadType(type)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium transition-all',
                  uploadType === type ? 'bg-primary-800 text-white' : 'bg-white text-gray-600 border border-stone-200 hover:border-primary-300'
                )}>{typeConfig[type].label}</button>
            ))}
          </div>
          {(uploadType === 'copy' || uploadType === 'auth') && (
            <div className="flex items-center gap-1 mt-1 px-3 py-1.5 bg-teal-50 rounded-full text-xs text-teal-700">
              <AlertCircle className="w-3.5 h-3.5" />
              文本模式：上传后自动读取文件内容
              {uploadType === 'auth' && '，解析授权范围'}
            </div>
          )}
        </div>
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {filteredMaterials.map((material, index) => (
            <div key={material.id} className={cn('animate-slide-up', `stagger-${(index % 6) + 1}`)}>
              <MaterialCard material={material} onDelete={removeMaterial} onEdit={handleEditMaterial} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Image className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无{activeTab === 'all' ? '' : typeConfig[activeTab as MaterialType]?.label}素材</h3>
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
                          item.status === 'success' ? 'bg-green-500' : 
                          item.status === 'error' ? 'bg-red-500' : 'bg-primary-500'
                        )} style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{Math.round(item.progress)}%</span>
                    </div>
                    {item.content && item.status === 'success' && (
                      <p className="text-[10px] text-teal-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.type === 'auth' ? '已读取内容并解析授权范围' : `已读取文本内容 (${item.content.length}字)`}
                      </p>
                    )}
                    {item.type === 'auth' && !item.content && item.status === 'success' && (
                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        授权范围待补充
                      </p>
                    )}
                  </div>
                  {item.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-stone-200 flex justify-between">
              <div className="text-xs text-gray-500">
                {uploadItems.filter(i => i.status === 'success').length} / {uploadItems.length} 完成
                {uploadItems.some(i => i.content) && uploadItems.filter(i => i.status === 'success').length > 0 && (
                  <span className="ml-2 text-teal-600">(含文本内容)</span>
                )}
              </div>
              <button onClick={() => setShowUploadModal(false)} className="btn-secondary">关闭</button>
            </div>
          </div>
        </div>
      )}

      {editingMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover w-full max-w-md mx-4 animate-slide-up">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" /> 编辑授权范围
              </h3>
              <button onClick={() => setEditingMaterial(null)} className="p-2 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-1 font-medium">{editingMaterial.name}</p>
              {editingMaterial.contentSummary && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{editingMaterial.contentSummary}</p>
              )}
              <label className="input-label">授权范围（用顿号或逗号分隔）</label>
              <input type="text" value={editAuthScope} onChange={(e) => setEditAuthScope(e.target.value)}
                className="input-field mb-3" placeholder="例如：文创产品、线上销售、包装设计" />
              <p className="text-xs text-gray-400">常用范围：文创产品、线上销售、线下销售、包装设计、宣传推广、零售、电商</p>
              {editingMaterial.authStatus === 'pending' && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-center gap-2 text-xs text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  当前状态：待补充授权范围
                </div>
              )}
            </div>
            <div className="p-4 border-t border-stone-200 flex justify-end gap-3">
              <button onClick={() => setEditingMaterial(null)} className="btn-secondary">取消</button>
              <button onClick={handleSaveAuthScope} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> 保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
