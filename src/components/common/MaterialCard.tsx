import { Image, FileText, Shield, Trash2, Edit, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { Material, AuthStatus } from '@/types';
import { formatDate } from '@/utils/exportUtils';

interface MaterialCardProps {
  material: Material;
  onDelete?: (id: string) => void;
  onEdit?: (material: Material) => void;
  onSelect?: (material: Material) => void;
  selected?: boolean;
}

const typeConfig = {
  exhibit: { icon: Image, label: '展品图', color: 'bg-blue-100 text-blue-700' },
  pattern: { icon: Image, label: '纹样', color: 'bg-purple-100 text-purple-700' },
  copy: { icon: FileText, label: '文案', color: 'bg-green-100 text-green-700' },
  auth: { icon: Shield, label: '授权', color: 'bg-orange-100 text-orange-700' },
};

const authStatusConfig: Record<AuthStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  verified: { label: '已验证', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending: { label: '待补充', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  missing: { label: '缺失', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export const MaterialCard = ({ material, onDelete, onEdit, onSelect, selected }: MaterialCardProps) => {
  const config = typeConfig[material.type];
  const Icon = config.icon;
  const authConfig = material.authStatus ? authStatusConfig[material.authStatus] : null;
  const AuthIcon = authConfig?.icon;

  return (
    <div 
      className={`card p-4 cursor-pointer transition-all duration-300 group
        ${selected ? 'ring-2 ring-primary-800 shadow-hover' : 'card-hover'}
        ${material.authStatus === 'pending' ? 'border-amber-200' : ''}
        ${material.authStatus === 'missing' ? 'border-red-200' : ''}
      `}
      onClick={() => onSelect?.(material)}
    >
      <div className="relative">
        {(material.type === 'exhibit' || material.type === 'pattern') && material.url ? (
          <div className="aspect-square rounded-lg overflow-hidden bg-stone-100 mb-3">
            <img 
              src={material.url} 
              alt={material.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : material.type === 'copy' || material.type === 'auth' ? (
          <div className="aspect-square rounded-lg flex flex-col items-center justify-center mb-3 relative overflow-hidden"
            style={{ background: material.type === 'auth' 
              ? 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' 
              : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' }}>
            <Icon className="w-10 h-10 mb-2" style={{ color: material.type === 'auth' ? '#EA580C' : '#16A34A', opacity: 0.6 }} />
            {material.contentSummary && (
              <p className="text-[10px] text-gray-500 px-3 text-center line-clamp-3">{material.contentSummary}</p>
            )}
            {material.type === 'auth' && authConfig && (
              <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${authConfig.color}`}>
                <AuthIcon className="w-3 h-3" />
                {authConfig.label}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square rounded-lg bg-gradient-elegant flex items-center justify-center mb-3">
            <Icon className="w-12 h-12 text-primary-800/40" />
          </div>
        )}

        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
          {config.label}
        </span>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {material.type === 'auth' && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(material);
              }}
              className="p-1.5 bg-white rounded-lg shadow-card hover:bg-orange-50 transition-colors"
            >
              <Edit className="w-4 h-4 text-orange-500" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(material.id);
            }}
            className="p-1.5 bg-white rounded-lg shadow-card hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{material.name}</h4>
      
      {material.contentSummary && (material.type === 'copy' || material.type === 'auth') ? (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{material.contentSummary}</p>
      ) : (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{material.description}</p>
      )}
      
      <div className="flex flex-wrap gap-1 mb-2">
        {material.tags.slice(0, 3).map((tag) => (
          <span key={tag} className={`tag text-[10px] ${tag === '待补充授权范围' ? 'bg-amber-100 text-amber-700' : tag === '已解析授权范围' ? 'bg-teal-100 text-teal-700' : 'tag-stone'}`}>
            {tag}
          </span>
        ))}
      </div>

      <p className="text-[10px] text-gray-400">
        {formatDate(material.createdAt, 'YYYY-MM-DD')}
      </p>

      {material.authScope && material.authScope.length > 0 && (
        <div className="mt-2 pt-2 border-t border-stone-100">
          <p className="text-[10px] text-gray-500 mb-1">授权范围:</p>
          <div className="flex flex-wrap gap-1">
            {material.authScope.map((scope) => (
              <span key={scope} className="tag tag-teal text-[10px]">
                {scope}
              </span>
            ))}
          </div>
        </div>
      )}

      {material.type === 'auth' && (!material.authScope || material.authScope.length === 0) && (
        <div className="mt-2 pt-2 border-t border-amber-100">
          <div className="flex items-center gap-1 text-[10px] text-amber-600">
            <AlertCircle className="w-3 h-3" />
            <span>授权范围待补充，点击编辑按钮添加</span>
          </div>
        </div>
      )}

      {material.content && material.type === 'copy' && !material.contentSummary && (
        <div className="mt-2 pt-2 border-t border-stone-100">
          <p className="text-xs text-gray-600 line-clamp-3">{material.content}</p>
        </div>
      )}
    </div>
  );
};
