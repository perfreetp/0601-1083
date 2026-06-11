import { Clock, RotateCcw, CheckCircle2, XCircle, Circle } from 'lucide-react';
import type { DesignVersion } from '@/types';
import { formatDate, getTimeAgo } from '@/utils/exportUtils';

interface VersionTimelineProps {
  versions: DesignVersion[];
  currentVersionId?: string;
  onRollback?: (versionId: string) => void;
  onSelect?: (versionId: string) => void;
}

const styleLabels: Record<string, string> = {
  elegant: '典雅',
  playful: '童趣',
  festive: '节庆',
  minimal: '极简',
};

export const VersionTimeline = ({ versions, currentVersionId, onRollback, onSelect }: VersionTimelineProps) => {
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200" />
      
      <div className="space-y-4">
        {sortedVersions.map((version, index) => {
          const isCurrent = version.id === currentVersionId;
          const isLatest = index === 0;
          
          return (
            <div 
              key={version.id}
              className={`relative pl-10 pr-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                ${isCurrent ? 'bg-primary-50 ring-1 ring-primary-800/20' : 'bg-white hover:bg-stone-50'}
                border border-stone-200
              `}
              onClick={() => onSelect?.(version.id)}
            >
              <div className={`absolute left-2 top-4 w-5 h-5 rounded-full flex items-center justify-center
                ${isCurrent ? 'bg-primary-800' : isLatest ? 'bg-teal-600' : 'bg-stone-300'}
              `}>
                {isCurrent ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : isLatest ? (
                  <Clock className="w-3 h-3 text-white" />
                ) : (
                  <Circle className="w-3 h-3 text-white" />
                )}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">版本 {version.version}</span>
                    {isLatest && (
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] rounded-full font-medium">
                        最新
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-[10px] rounded-full font-medium">
                        当前
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      {styleLabels[version.style] || version.style}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {version.layouts.length} 个版式
                    </span>
                  </div>

                  {version.description && (
                    <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(version.createdAt, 'YYYY-MM-DD HH:mm')}
                    </span>
                    <span>({getTimeAgo(version.createdAt)})</span>
                    <span className="text-gray-300">|</span>
                    <span>{version.creator}</span>
                  </div>
                </div>

                {!isCurrent && onRollback && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRollback(version.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary-800 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    回滚
                  </button>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: version.colorScheme.primary }}
                  title="主色调"
                />
                {version.colorScheme.secondary.slice(0, 3).map((color, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
