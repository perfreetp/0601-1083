import { useState } from 'react';
import {
  Download, Package, Settings, Clock, FileText, Image, CheckCircle, Loader2, Eye, Copy, Check, History, FileSpreadsheet, Tag
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/exportUtils';
import { layoutOptions } from '@/utils/mockData';
import type { ExportFile } from '@/types';

const availableFormats = ['PNG', 'JPG', 'PDF', 'AI', 'PSD', 'SVG'];
const namingVariables = [
  { key: 'museum', label: '博物馆名' },
  { key: 'style', label: '设计风格' },
  { key: 'layout', label: '版式类型' },
  { key: 'date', label: '日期' },
  { key: 'project', label: '项目名' },
];

export default function Export() {
  const { currentProject, updateExportConfig } = useProjectStore();
  const [selectedItems, setSelectedItems] = useState<string[]>(['box', 'tag', 'sticker', 'bag', 'card']);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportFile[]>([]);
  const [copied, setCopied] = useState(false);

  const config = currentProject?.exportConfig;
  const latestVersion = currentProject?.versions[currentProject.versions.length - 1];

  const toggleItem = (id: string) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleFormat = (format: string) => {
    if (!config) return;
    const newFormats = config.formats.includes(format) ? config.formats.filter(f => f !== format) : [...config.formats, format];
    updateExportConfig({ formats: newFormats });
  };

  const handleExport = () => {
    setIsExporting(true); setExportProgress(0);
    const interval = setInterval(() => setExportProgress(prev => prev >= 95 ? (clearInterval(interval), prev) : prev + Math.random() * 15 + 5), 200);
    setTimeout(() => {
      clearInterval(interval); setExportProgress(100);
      const newFiles: ExportFile[] = selectedItems.map((item, idx) => ({
        id: `f_${Date.now()}_${idx}`, name: generateFileName(item),
        type: config?.formats[0] || 'PNG', size: Math.floor(Math.random() * 5000 + 1000), url: '#',
      }));
      setExportHistory(prev => [...newFiles, ...prev]);
      setTimeout(() => { setIsExporting(false); setExportProgress(0); }, 1000);
    }, 2000);
  };

  const generateFileName = (layout: string) => {
    if (!config) return '';
    const layoutConfig = layoutOptions.find(l => l.id === layout);
    return config.namingRule
      .replace('{museum}', currentProject?.museumName || '')
      .replace('{style}', currentProject?.currentStyle || '')
      .replace('{layout}', layoutConfig?.name || layout)
      .replace('{date}', formatDate(new Date().toISOString(), 'YYYYMMDD'))
      .replace('{project}', currentProject?.name || '')
      .replace(/\s+/g, '_');
  };

  const copyNamingRule = () => { if (!config) return; navigator.clipboard.writeText(config.namingRule); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const formatFileSize = (bytes: number) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB';

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">导出中心</h1>
          <p className="text-gray-500">批量预览、配置参数、打包下载，一站式导出设计成果</p>
        </div>
        <button onClick={handleExport} disabled={isExporting || selectedItems.length === 0} className="btn-primary flex items-center gap-2">
          {isExporting ? <><Loader2 className="w-4 h-4 animate-spin" /> 导出中...</> : <><Download className="w-4 h-4" /> 批量导出</>}
        </button>
      </div>

      {isExporting && (
        <div className="card p-5 mb-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">正在打包文件...</span>
                <span className="text-primary-800 font-medium">{Math.round(exportProgress)}%</span>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-800" /> 批量预览
              </h3>
              <span className="text-sm text-gray-500">已选择 {selectedItems.length} 项</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {layoutOptions.map((layout, idx) => {
                const isSelected = selectedItems.includes(layout.id);
                const layoutData = latestVersion?.layouts.find(l => l.type === layout.id);
                return (
                  <div key={layout.id} onClick={() => toggleItem(layout.id)}
                    className={cn('relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group animate-slide-up', `stagger-${idx + 1}`,
                      isSelected ? 'ring-2 ring-primary-800 scale-105' : 'hover:scale-105')}>
                    {layoutData?.previewUrl ? (
                      <img src={layoutData.previewUrl} alt={layout.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-gradient-elegant flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-medium">{layout.name}</p>
                      <p className="text-white/60 text-[10px]">{layout.size}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary-800 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" /> 规格参数表
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-stone-200">
                  {['版式', '尺寸', '分辨率', '格式', '预计大小', '状态'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-medium text-gray-500">{h}</th>
                  ))}</tr></thead>
                <tbody>
                  {layoutOptions.filter(l => selectedItems.includes(l.id)).map((layout, idx) => (
                    <tr key={layout.id} className={cn('border-b border-stone-100 last:border-0', idx % 2 === 0 && 'bg-stone-50/50')}>
                      <td className="py-3 px-4 font-medium text-gray-900">{layout.name}</td>
                      <td className="py-3 px-4 text-gray-600">{layout.size}</td>
                      <td className="py-3 px-4 text-gray-600">{config?.dpi || 300} DPI</td>
                      <td className="py-3 px-4 text-gray-600">{config?.formats.join(', ') || 'PNG'}</td>
                      <td className="py-3 px-4 text-gray-600">~{Math.floor(Math.random() * 3 + 1)} MB</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">就绪</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" /> 导出历史
            </h3>
            {exportHistory.length > 0 ? (
              <div className="space-y-3">
                {exportHistory.map((file, idx) => (
                  <div key={file.id} className={cn('flex items-center gap-4 p-3 bg-stone-50 rounded-xl animate-slide-in', `stagger-${(idx % 6) + 1}`)}>
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.type} · {formatFileSize(file.size)}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <button className="p-2 hover:bg-white rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>暂无导出记录</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-800" /> 导出设置
            </h3>
            <div className="space-y-4">
              <div>
                <label className="input-label">分辨率 (DPI)</label>
                <select value={config?.dpi || 300} onChange={(e) => updateExportConfig({ dpi: Number(e.target.value) })} className="input-field">
                  <option value={72}>72 DPI - 屏幕显示</option>
                  <option value={150}>150 DPI - 普通印刷</option>
                  <option value={300}>300 DPI - 高清印刷</option>
                  <option value={600}>600 DPI - 专业印刷</option>
                </select>
              </div>
              <div>
                <label className="input-label">导出格式</label>
                <div className="flex flex-wrap gap-2">
                  {availableFormats.map((format) => {
                    const isSelected = config?.formats.includes(format);
                    return (
                      <button key={format} onClick={() => toggleFormat(format)}
                        className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                          isSelected ? 'bg-primary-800 text-white' : 'bg-stone-100 text-gray-600 hover:bg-stone-200')}>
                        {format}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="includeSpec" checked={config?.includeSpec}
                  onChange={(e) => updateExportConfig({ includeSpec: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-primary-800 focus:ring-primary-800" />
                <label htmlFor="includeSpec" className="text-sm text-gray-700">包含规格说明书</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="includePreview" checked={config?.includePreview}
                  onChange={(e) => updateExportConfig({ includePreview: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-primary-800 focus:ring-primary-800" />
                <label htmlFor="includePreview" className="text-sm text-gray-700">包含预览图</label>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600" /> 命名规则
              </h3>
              <button onClick={copyNamingRule} className="text-sm text-gray-500 hover:text-primary-800">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl font-mono text-sm text-gray-700 mb-4">
              {config?.namingRule || '{museum}_{style}_{layout}_{date}'}
            </div>
            <input type="text" value={config?.namingRule || ''}
              onChange={(e) => updateExportConfig({ namingRule: e.target.value })}
              className="input-field text-sm font-mono mb-4" />
            <p className="text-xs text-gray-500 mb-3">可用变量：</p>
            <div className="space-y-2">
              {namingVariables.map((v) => (
                <div key={v.key} className="flex items-center justify-between text-xs">
                  <code className="px-2 py-0.5 bg-primary-50 text-primary-800 rounded">{'{' + v.key + '}'}</code>
                  <span className="text-gray-500">{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" /> 导出摘要
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">已选版式</span>
                <span className="font-medium text-gray-900">{selectedItems.length} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">导出格式</span>
                <span className="font-medium text-gray-900">{config?.formats.length || 0} 种</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">总文件数</span>
                <span className="font-medium text-gray-900">{selectedItems.length * (config?.formats.length || 0)} 个</span>
              </div>
              <div className="pt-3 border-t border-stone-200">
                <p className="text-xs text-gray-400">
                  示例：<code className="text-primary-800">{generateFileName('box')}.png</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
