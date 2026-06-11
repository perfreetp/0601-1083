import type { Layout, ExportConfig, Project, ColorScheme } from '@/types';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const generateFileName = (
  template: string,
  project: Project,
  layout: Layout,
  index: number
): string => {
  const date = formatDate(new Date(), 'YYYYMMDD');
  
  return template
    .replace('{museum}', project.museumName.replace(/\s+/g, ''))
    .replace('{project}', project.name.replace(/\s+/g, ''))
    .replace('{style}', project.currentStyle)
    .replace('{layout}', layout.type)
    .replace('{date}', date)
    .replace('{index}', String(index + 1))
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-]/g, '_');
};

export const generateSpecSheet = (layouts: Layout[], colorScheme: ColorScheme): string => {
  const header = `博物馆文创产品设计规格参数表
生成时间: ${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')}
主色调: ${colorScheme.primary} (${colorScheme.name})
辅助色: ${colorScheme.secondary.join(', ')}
对比色: ${colorScheme.contrast.join(', ')}

================================================================================

`;

  const layoutSpecs = layouts.map((layout, index) => {
    return `【${index + 1}】${layout.name}
类型: ${layout.type}
尺寸: ${layout.size.width} × ${layout.size.height} ${layout.size.unit}
像素 (300DPI): ${Math.round(layout.size.width * 300 / 25.4)} × ${Math.round(layout.size.height * 300 / 25.4)} px
像素 (72DPI): ${Math.round(layout.size.width * 72 / 25.4)} × ${Math.round(layout.size.height * 72 / 25.4)} px
元素数量: ${layout.elements.length}

`;
  }).join('');

  const footer = `
================================================================================
注意事项:
1. 所有尺寸单位为毫米(mm)
2. 印刷分辨率建议使用300DPI
3. 色彩模式请使用CMYK进行印刷
4. 请保留3mm出血位
`;

  return header + layoutSpecs + footer;
};

export const generateNamingGuide = (config: ExportConfig, project: Project): string => {
  return `文件命名规范说明
================================================================================

命名规则: ${config.namingRule}

变量说明:
- {museum}: 博物馆名称 (${project.museumName})
- {project}: 项目名称 (${project.name})
- {style}: 设计风格 (${project.currentStyle})
- {layout}: 版式类型 (box/tag/sticker/bag/card)
- {date}: 生成日期 (${formatDate(new Date(), 'YYYYMMDD')})
- {index}: 序号 (1, 2, 3...)

示例文件名:
${project.versions[0]?.layouts.map((layout, i) => 
  `  ${generateFileName(config.namingRule, project, layout, i)}.png`
).join('\n')}

导出格式: ${config.formats.join(', ')}
分辨率: ${config.dpi} DPI
包含规格表: ${config.includeSpec ? '是' : '否'}
包含预览图: ${config.includePreview ? '是' : '否'}
`;
};

export const downloadFile = (content: string | Blob, filename: string, type: string = 'text/plain') => {
  let blob: Blob;
  
  if (typeof content === 'string') {
    blob = new Blob([content], { type });
  } else {
    blob = content;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsJSON = (data: unknown, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

export const exportAsCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

export const calculateFileSize = (widthMm: number, heightMm: number, dpi: number, format: string): number => {
  const widthPx = Math.round(widthMm * dpi / 25.4);
  const heightPx = Math.round(heightMm * dpi / 25.4);
  
  const bytesPerPixel = format === 'PNG' ? 4 : format === 'JPG' ? 3 : 1;
  const compressionRatio = format === 'PNG' ? 0.5 : format === 'JPG' ? 0.1 : 1;
  
  return Math.round(widthPx * heightPx * bytesPerPixel * compressionRatio);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const generateExportManifest = (
  project: Project,
  config: ExportConfig
): { files: { name: string; size: string; type: string }[]; totalSize: string } => {
  const files: { name: string; size: string; type: string }[] = [];
  let totalBytes = 0;

  const currentVersion = project.versions[project.versions.length - 1];
  if (!currentVersion) return { files: [], totalSize: '0 B' };

  config.formats.forEach(format => {
    currentVersion.layouts.forEach((layout, index) => {
      const fileName = generateFileName(config.namingRule, project, layout, index);
      const size = calculateFileSize(layout.size.width, layout.size.height, config.dpi, format);
      totalBytes += size;
      
      files.push({
        name: `${fileName}.${format.toLowerCase()}`,
        size: formatFileSize(size),
        type: format
      });
    });
  });

  if (config.includeSpec) {
    const specSize = 1024 * 50;
    totalBytes += specSize;
    files.push({
      name: '设计规格说明.txt',
      size: formatFileSize(specSize),
      type: 'TXT'
    });
  }

  if (config.includePreview) {
    currentVersion.layouts.forEach((layout, index) => {
      const fileName = generateFileName(config.namingRule, project, layout, index);
      const size = calculateFileSize(layout.size.width * 0.5, layout.size.height * 0.5, 72, 'JPG');
      totalBytes += size;
      
      files.push({
        name: `preview/${fileName}_preview.jpg`,
        size: formatFileSize(size),
        type: 'JPG'
      });
    });
  }

  const manifestSize = 1024 * 10;
  totalBytes += manifestSize;
  files.push({
    name: '文件清单.txt',
    size: formatFileSize(manifestSize),
    type: 'TXT'
  });

  return {
    files,
    totalSize: formatFileSize(totalBytes)
  };
};

export const createExportPackage = async (
  project: Project,
  config: ExportConfig
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const manifest = generateExportManifest(project, config);
      const specSheet = generateSpecSheet(
        project.versions[project.versions.length - 1]?.layouts || [],
        project.colorScheme
      );
      const namingGuide = generateNamingGuide(config, project);
      
      const packageContent = `
导出包内容清单
================================================================================
项目名称: ${project.name}
博物馆: ${project.museumName}
导出时间: ${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')}
设计风格: ${project.currentStyle}
总文件数: ${manifest.files.length}
总大小: ${manifest.totalSize}

文件列表:
${manifest.files.map((f, i) => `  ${String(i + 1).padStart(2, '0')}. ${f.name.padEnd(50)} ${f.size.padStart(10)}`).join('\n')}

================================================================================

${namingGuide}

================================================================================

${specSheet}
`;

      downloadFile(packageContent, `${project.museumName}_${project.name}_导出包_${formatDate(new Date(), 'YYYYMMDD')}.txt`, 'text/plain;charset=utf-8;');
      resolve();
    }, 1500);
  });
};

export const rollbackToVersion = (
  versions: { id: string; version: number }[],
  targetVersionId: string
): number => {
  const targetVersion = versions.find(v => v.id === targetVersionId);
  return targetVersion?.version || 1;
};

export const getVersionHistory = (versions: { id: string; version: number; createdAt: string; creator: string; description?: string }[]) => {
  return versions
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(v => ({
      ...v,
      formattedDate: formatDate(v.createdAt, 'YYYY-MM-DD HH:mm'),
      timeAgo: getTimeAgo(v.createdAt)
    }));
};

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(then, 'YYYY-MM-DD');
};
