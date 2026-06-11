import { useState } from 'react';
import {
  Download, Package, Settings, Clock, FileText, Image, CheckCircle, Loader2, Eye, Copy, Check, History, FileSpreadsheet, Tag, Trash2, ChevronRight, FolderOpen, X, Filter
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { formatDate, formatFileSize, generateExportManifest, generateSpecSheet, generateNamingGuide, downloadFile, getTimeAgo } from '@/utils/exportUtils';
import { layoutOptions } from '@/utils/mockData';
import { AuthCheck } from '@/components/common/AuthCheck';
import type { ExportFile, DeliveryRecord, DeliveryLayoutItem } from '@/types';

const availableFormats = ['PNG', 'JPG', 'PDF', 'AI', 'PSD', 'SVG'];
const namingVariables = [
  { key: 'museum', label: '博物馆名' },
  { key: 'style', label: '设计风格' },
  { key: 'layout', label: '版式类型' },
  { key: 'date', label: '日期' },
  { key: 'project', label: '项目名' },
];

export default function Export() {
  const { currentProject, projects, updateExportConfig, deliveryRecords, addDeliveryRecord, clearDeliveryRecords } = useProjectStore();
  const [selectedItems, setSelectedItems] = useState<string[]>(['box', 'tag', 'sticker', 'bag', 'card']);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeliveryRecord | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const config = currentProject?.exportConfig;
  const latestVersion = currentProject?.versions[currentProject.versions.length - 1];

  const toggleItem = (id: string) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleFormat = (format: string) => {
    if (!config) return;
    const newFormats = config.formats.includes(format) ? config.formats.filter(f => f !== format) : [...config.formats, format];
    updateExportConfig({ formats: newFormats });
  };

  const generateSingleFileName = (layout: string, format: string) => {
    if (!config || !currentProject) return '';
    const layoutConfig = layoutOptions.find(l => l.id === layout);
    return config.namingRule
      .replace('{museum}', currentProject.museumName)
      .replace('{style}', currentProject.currentStyle)
      .replace('{layout}', layoutConfig?.name || layout)
      .replace('{date}', formatDate(new Date().toISOString(), 'YYYYMMDD'))
      .replace('{project}', currentProject.name)
      .replace(/\s+/g, '_') + `.${format.toLowerCase()}`;
  };

  const computeFileCount = () => {
    const designFiles = selectedItems.length * (config?.formats.length || 0);
    const previewFiles = config?.includePreview ? selectedItems.length : 0;
    const specFiles = config?.includeSpec ? 1 : 0;
    const manifestFiles = 1;
    return designFiles + previewFiles + specFiles + manifestFiles;
  };
  const totalFileCount = computeFileCount();

  const buildPreviewFiles = (): { name: string; type: string; size: string; category: string }[] => {
    const files: { name: string; type: string; size: string; category: string }[] = [];
    for (const item of selectedItems) {
      for (const fmt of (config?.formats || [])) {
        const layoutCfg = layoutOptions.find(l => l.id === item);
        const pxW = Math.round((layoutCfg?.widthMm || 200) * (config?.dpi || 300) / 25.4);
        const pxH = Math.round((layoutCfg?.heightMm || 150) * (config?.dpi || 300) / 25.4);
        files.push({
          name: generateSingleFileName(item, fmt),
          type: fmt,
          size: formatFileSize(Math.round(pxW * pxH * (fmt === 'PNG' ? 2 : fmt === 'JPG' ? 0.5 : 1) * 1024)),
          category: 'design',
        });
      }
    }
    if (config?.includePreview) {
      for (const item of selectedItems) {
        files.push({
          name: `preview/${generateSingleFileName(item, 'JPG').replace('.jpg', '_preview.jpg')}`,
          type: 'JPG',
          size: formatFileSize(Math.floor(Math.random() * 200 + 50) * 1024),
          category: 'preview',
        });
      }
    }
    if (config?.includeSpec) {
      files.push({ name: '设计规格说明.txt', type: 'TXT', size: '50 KB', category: 'spec' });
    }
    files.push({ name: '文件清单.txt', type: 'TXT', size: '10 KB', category: 'manifest' });
    return files;
  };

  const handleExport = async () => {
    if (!config || !currentProject || !latestVersion) return;
    
    setIsExporting(true);
    setExportProgress(0);

    const allFiles: ExportFile[] = [];
    const totalSteps = selectedItems.length * config.formats.length + (config.includePreview ? selectedItems.length : 0) + (config.includeSpec ? 1 : 0) + 2;
    let currentStep = 0;

    for (const item of selectedItems) {
      for (const fmt of config.formats) {
        await new Promise(r => setTimeout(r, 100));
        currentStep++;
        setExportProgress(Math.round((currentStep / totalSteps) * 100));
        allFiles.push({
          id: `f_${Date.now()}_${item}_${fmt}`,
          name: generateSingleFileName(item, fmt),
          type: fmt,
          size: Math.floor(Math.random() * 3000 + 500),
          url: '#'
        });
      }
    }

    if (config.includePreview) {
      for (const item of selectedItems) {
        await new Promise(r => setTimeout(r, 60));
        currentStep++;
        setExportProgress(Math.round((currentStep / totalSteps) * 100));
        allFiles.push({
          id: `f_preview_${Date.now()}_${item}`,
          name: `preview/${generateSingleFileName(item, 'JPG').replace('.jpg', '_preview.jpg')}`,
          type: 'JPG',
          size: Math.floor(Math.random() * 500 + 100),
          url: '#'
        });
      }
    }

    if (config.includeSpec) {
      await new Promise(r => setTimeout(r, 100));
      currentStep++;
      setExportProgress(Math.round((currentStep / totalSteps) * 100));
      allFiles.push({ id: `f_spec_${Date.now()}`, name: '设计规格说明.txt', type: 'TXT', size: 50, url: '#' });
    }

    await new Promise(r => setTimeout(r, 100));
    currentStep++;
    setExportProgress(Math.round((currentStep / totalSteps) * 100));
    allFiles.push({ id: `f_manifest_${Date.now()}`, name: '文件清单.txt', type: 'TXT', size: 10, url: '#' });

    const layoutItems: DeliveryLayoutItem[] = selectedItems.map(itemId => {
      const layoutCfg = layoutOptions.find(l => l.id === itemId);
      const layoutData = latestVersion.layouts.find(l => l.type === itemId);
      return {
        type: itemId,
        name: layoutCfg?.name || itemId,
        size: layoutCfg?.size || '',
        formats: [...config.formats],
        previewUrl: layoutData?.previewUrl,
      };
    });

    const manifest = generateExportManifest(currentProject, config);
    const specSheet = generateSpecSheet(latestVersion.layouts, currentProject.colorScheme);
    const namingGuide = generateNamingGuide(config, currentProject);
    const totalBytes = allFiles.reduce((sum, f) => sum + f.size * 1024, 0);

    const packageContent = `
================================================================================
                    ${currentProject.museumName} - ${currentProject.name}
                          文创设计交付包
================================================================================

生成时间: ${formatDate(new Date().toISOString(), 'YYYY-MM-DD HH:mm:ss')}
设计风格: ${currentProject.currentStyle === 'elegant' ? '典雅' : currentProject.currentStyle === 'playful' ? '童趣' : currentProject.currentStyle === 'festive' ? '节庆' : '极简'}
主色调: ${currentProject.colorScheme.name} (${currentProject.colorScheme.primary})
总文件数: ${allFiles.length} 个
总大小: ${formatFileSize(totalBytes)}

================================================================================
                              文件清单
================================================================================

${allFiles.map((f, i) => `  ${String(i + 1).padStart(3, '0')}.  ${f.name.padEnd(60)} ${f.type.padEnd(6)} ${formatFileSize(f.size * 1024)}`).join('\n')}

================================================================================
                              命名规范
================================================================================

${namingGuide}

================================================================================
                           设计规格参数表
================================================================================

${specSheet}

================================================================================
                              使用说明
================================================================================

1. 所有设计文件已按选定格式导出
2. 预览图位于 preview/ 文件夹，用于快速查看
3. 设计规格说明.txt 包含详细尺寸和参数
4. 如需修改，请返回设计平台编辑后重新导出
5. 如有问题请联系文创设计团队

================================================================================
                           © ${new Date().getFullYear()} ${currentProject.museumName}
================================================================================
`;

    const record: DeliveryRecord = {
      id: `dr_${Date.now()}`,
      projectId: currentProject.id,
      projectName: currentProject.name,
      museumName: currentProject.museumName,
      createdAt: new Date().toISOString(),
      layouts: layoutItems,
      formats: [...config.formats],
      fileCount: allFiles.length,
      includeSpec: config.includeSpec,
      includePreview: config.includePreview,
      dpi: config.dpi,
      namingRule: config.namingRule,
      packageContent,
      files: allFiles,
      totalSize: totalBytes,
    };

    addDeliveryRecord(record);

    downloadFile(
      packageContent,
      `${currentProject.museumName}_${currentProject.name}_交付包_${formatDate(new Date().toISOString(), 'YYYYMMDD')}.txt`,
      'text/plain;charset=utf-8;'
    );

    await new Promise(r => setTimeout(r, 200));
    setExportProgress(100);

    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
    }, 800);
  };

  const handleRedownload = (record: DeliveryRecord) => {
    downloadFile(
      record.packageContent,
      `${record.museumName}_${record.projectName}_交付包_${formatDate(record.createdAt, 'YYYYMMDD')}.txt`,
      'text/plain;charset=utf-8;'
    );
  };

  const copyNamingRule = () => { if (!config) return; navigator.clipboard.writeText(config.namingRule); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const filteredRecords = historyFilter === 'all'
    ? deliveryRecords
    : deliveryRecords.filter(r => r.projectId === historyFilter);

  const projectOptions = [...new Map(deliveryRecords.map(r => [r.projectId, { id: r.projectId, name: r.projectName }])).values()];

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">导出中心</h1>
          <p className="text-gray-500">批量预览、配置参数、打包下载，一站式导出设计成果</p>
        </div>
        <div className="flex gap-3">
          {selectedItems.length > 0 && config && config.formats.length > 0 && (
            <button onClick={() => setShowPreviewModal(true)} className="btn-secondary flex items-center gap-2">
              <Eye className="w-4 h-4" /> 预览交付包
            </button>
          )}
          <button onClick={handleExport} disabled={isExporting || selectedItems.length === 0 || !config || config.formats.length === 0} className="btn-primary flex items-center gap-2">
            {isExporting ? <><Loader2 className="w-4 h-4 animate-spin" /> 打包中...</> : <><Package className="w-4 h-4" /> 批量导出交付包</>}
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="card p-5 mb-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">正在打包交付文件...</span>
                <span className="text-primary-800 font-medium">{Math.round(exportProgress)}%</span>
              </div>
              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">正在生成交付包，包含预览图、尺寸清单、命名说明和文件清单...</p>
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
              <span className="text-sm text-gray-500">已选择 {selectedItems.length} 项 · 将生成 {totalFileCount} 个文件</span>
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
                      <img src={layoutData.previewUrl} alt={layout.name} className="w-full aspect-square object-cover" loading="lazy" />
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
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 rounded bg-white/90 text-[10px] text-gray-700 font-medium">
                        ×{(config?.formats.length || 0)}{config?.includePreview ? '+预览' : ''}
                      </span>
                    </div>
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
                  {['版式', '尺寸', '分辨率', '导出格式', '文件数', '状态'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-medium text-gray-500">{h}</th>
                  ))}</tr></thead>
                <tbody>
                  {layoutOptions.filter(l => selectedItems.includes(l.id)).map((layout, idx) => (
                    <tr key={layout.id} className={cn('border-b border-stone-100 last:border-0', idx % 2 === 0 && 'bg-stone-50/50')}>
                      <td className="py-3 px-4 font-medium text-gray-900">{layout.name}</td>
                      <td className="py-3 px-4 text-gray-600">{layout.size}</td>
                      <td className="py-3 px-4 text-gray-600">{config?.dpi || 300} DPI</td>
                      <td className="py-3 px-4 text-gray-600">{config?.formats.join(', ') || 'PNG'}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="font-medium text-primary-800">{(config?.formats.length || 0)}{config?.includePreview ? '+1预览' : ''}</span> 个
                      </td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">就绪</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" /> 交付历史
              </h3>
              <div className="flex items-center gap-3">
                {projectOptions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}
                      className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white text-gray-600">
                      <option value="all">全部项目</option>
                      {projectOptions.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {deliveryRecords.length > 0 && (
                  <button onClick={clearDeliveryRecords} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> 清空
                  </button>
                )}
              </div>
            </div>
            {filteredRecords.length > 0 ? (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div key={record.id}
                    className="p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer group"
                    onClick={() => setSelectedRecord(record)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-primary-800" />
                          <span className="font-medium text-gray-900">{record.projectName}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{record.museumName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{record.formats.join(', ')}</span>
                          <span>·</span>
                          <span>{record.layouts.length} 种版式</span>
                          <span>·</span>
                          <span>{record.fileCount} 个文件</span>
                          <span>·</span>
                          <span>{formatFileSize(record.totalSize)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {record.layouts.slice(0, 5).map(l => (
                            <span key={l.type} className="px-1.5 py-0.5 rounded bg-white text-[10px] text-gray-600 border border-stone-200">
                              {l.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{getTimeAgo(record.createdAt)}</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-800 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>暂无交付记录，点击上方按钮开始导出</p>
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
                <label className="input-label">导出格式 <span className="text-primary-800">({config?.formats.length || 0}种已选)</span></label>
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
                {(!config || config.formats.length === 0) && (
                  <p className="text-xs text-red-500 mt-2">请至少选择一种导出格式</p>
                )}
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
            <div className="p-3 bg-stone-50 rounded-xl font-mono text-sm text-gray-700 mb-4 break-all">
              {config?.namingRule || '{museum}_{style}_{layout}_{date}'}
            </div>
            <input type="text" value={config?.namingRule || ''}
              onChange={(e) => updateExportConfig({ namingRule: e.target.value })}
              className="input-field text-sm font-mono mb-4" />
            <p className="text-xs text-gray-500 mb-3">可用变量（点击插入）：</p>
            <div className="space-y-2">
              {namingVariables.map((v) => (
                <button key={v.key} onClick={() => config && updateExportConfig({ namingRule: config.namingRule + '{' + v.key + '}' })}
                  className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-stone-50 transition-colors">
                  <code className="px-2 py-0.5 bg-primary-50 text-primary-800 rounded">{'{' + v.key + '}'}</code>
                  <span className="text-gray-500">{v.label}</span>
                </button>
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
                <span className="font-medium text-gray-900">{config?.formats.length || 0} 种 ({config?.formats.join(', ') || '-'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">设计文件</span>
                <span className="font-medium text-gray-900">{selectedItems.length * (config?.formats.length || 0)} 个</span>
              </div>
              {config?.includePreview && (
                <div className="flex justify-between">
                  <span className="text-gray-500">预览图</span>
                  <span className="font-medium text-gray-900">{selectedItems.length} 张</span>
                </div>
              )}
              {config?.includeSpec && (
                <div className="flex justify-between">
                  <span className="text-gray-500">规格说明</span>
                  <span className="font-medium text-green-600">包含</span>
                </div>
              )}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">总文件数</span>
                  <span className="font-bold text-primary-800 text-lg">{totalFileCount} 个</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-stone-100">
                  示例：<code className="text-primary-800">{generateSingleFileName('box', config?.formats[0] || 'PNG')}</code>
                </p>
              </div>
            </div>
          </div>

          <AuthCheck materials={currentProject?.materials || []} />
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col animate-slide-up">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary-800" /> 交付包预览
              </h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="mb-5">
                <h4 className="font-medium text-gray-700 mb-3">包内目录结构</h4>
                <div className="bg-stone-50 rounded-xl p-4 font-mono text-sm space-y-1">
                  <div className="text-primary-800 font-medium">📦 {currentProject?.museumName}_{currentProject?.name}_交付包/</div>
                  {buildPreviewFiles().map((f, i) => (
                    <div key={i} className={cn('pl-6', f.category === 'preview' && 'pl-10')}>
                      <span className="text-gray-400 mr-2">{f.category === 'preview' ? '🖼' : f.category === 'spec' ? '📄' : f.category === 'manifest' ? '📋' : '🖼'}</span>
                      <span className="text-gray-700">{f.name}</span>
                      <span className="text-gray-400 ml-2 text-xs">({f.size})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <h4 className="font-medium text-gray-700 mb-3">文件命名示例</h4>
                <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                  {selectedItems.slice(0, 3).map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-16">{layoutOptions.find(l => l.id === item)?.name}:</span>
                      <code className="text-primary-800 bg-primary-50 px-2 py-0.5 rounded text-xs">{generateSingleFileName(item, config?.formats[0] || 'PNG')}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">尺寸表</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-stone-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">版式</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">物理尺寸</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">像素 @{config?.dpi || 300}DPI</th>
                    </tr></thead>
                    <tbody>
                      {layoutOptions.filter(l => selectedItems.includes(l.id)).map(layout => (
                        <tr key={layout.id} className="border-b border-stone-100">
                          <td className="py-2 px-3 font-medium">{layout.name}</td>
                          <td className="py-2 px-3 text-gray-600">{layout.size}</td>
                          <td className="py-2 px-3 text-gray-600 font-mono text-xs">
                            {Math.round((layout.widthMm || 200) * (config?.dpi || 300) / 25.4)} × {Math.round((layout.heightMm || 150) * (config?.dpi || 300) / 25.4)} px
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-gray-500">
                共 <span className="font-medium text-primary-800">{totalFileCount}</span> 个文件
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPreviewModal(false)} className="btn-secondary">取消</button>
                <button onClick={() => { setShowPreviewModal(false); handleExport(); }} className="btn-primary flex items-center gap-2">
                  <Package className="w-4 h-4" /> 确认导出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col animate-slide-up">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-800" /> 交付记录详情
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-stone-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">项目名称</p>
                  <p className="font-medium text-gray-900">{selectedRecord.projectName}</p>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">博物馆</p>
                  <p className="font-medium text-gray-900">{selectedRecord.museumName}</p>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">导出时间</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedRecord.createdAt, 'YYYY-MM-DD HH:mm:ss')}</p>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">总文件 / 大小</p>
                  <p className="font-medium text-gray-900">{selectedRecord.fileCount} 个 / {formatFileSize(selectedRecord.totalSize)}</p>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-medium text-gray-700 mb-3">包含版式</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRecord.layouts.map(layout => (
                    <div key={layout.type} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      {layout.previewUrl ? (
                        <img src={layout.previewUrl} alt={layout.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-gray-900">{layout.name}</p>
                        <p className="text-xs text-gray-500">{layout.size} · {layout.formats.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-medium text-gray-700 mb-3">导出配置</h4>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>格式: <strong>{selectedRecord.formats.join(', ')}</strong></span>
                  <span>DPI: <strong>{selectedRecord.dpi}</strong></span>
                  {selectedRecord.includePreview && <span className="text-green-600">✓ 含预览图</span>}
                  {selectedRecord.includeSpec && <span className="text-green-600">✓ 含规格说明</span>}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">文件清单 ({selectedRecord.files.length} 个)</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {selectedRecord.files.map((file, idx) => (
                    <div key={file.id} className="flex items-center gap-3 py-2 px-3 hover:bg-stone-50 rounded-lg text-sm">
                      <span className="text-gray-400 w-6 text-right">{idx + 1}</span>
                      {file.type === 'TXT' ? <FileText className="w-4 h-4 text-teal-600" /> : <Image className="w-4 h-4 text-primary-800" />}
                      <span className="flex-1 text-gray-700 truncate">{file.name}</span>
                      <span className="text-gray-400 text-xs">{file.type}</span>
                      <span className="text-gray-400 text-xs">{formatFileSize(file.size * 1024)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-stone-200 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setSelectedRecord(null)} className="btn-secondary">关闭</button>
              <button onClick={() => handleRedownload(selectedRecord)} className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" /> 重新下载交付包
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
