import { Shield, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import type { Material } from '@/types';
import { cn } from '@/lib/utils';

interface AuthCheckProps {
  materials: Material[];
  compact?: boolean;
}

const requiredCategories = [
  { key: 'exhibit', label: '展品图片授权', desc: '展品形象使用许可' },
  { key: 'pattern', label: '纹样素材授权', desc: '传统纹样版权许可' },
  { key: 'brand', label: '品牌商标授权', desc: '博物馆品牌/商标使用' },
  { key: 'production', label: '生产制作授权', desc: '文创产品生产许可' },
];

const onlineKeywords = ['线上', '电商', '网络', '数字化', '数字产品', '零售'];
const offlineKeywords = ['线下', '实体', '门店', '实体店', '批发', '印刷品'];
const categoryKeywords: Record<string, string[]> = {
  '包装': ['包装', '包装设计', '纪念品包装', '食品包装'],
  '文具': ['文具', '用品'],
  '饰品': ['饰品', '配饰'],
  '服装': ['服装', '服饰'],
  '家居': ['家居', '家居用品', '茶具', '陶瓷'],
  '印刷': ['印刷', '印刷品', '宣传', '推广', '宣传推广'],
};

export const AuthCheck = ({ materials, compact = false }: AuthCheckProps) => {
  const authMaterials = materials.filter(m => m.type === 'auth');
  
  const allScopes = authMaterials.flatMap(m => m.authScope || []);
  
  const missingCategories = requiredCategories.filter(cat => {
    if (cat.key === 'exhibit') return !authMaterials.some(m => m.authScope?.some(s => s.includes('展品') || s.includes('文物') || s.includes('形象')));
    if (cat.key === 'pattern') return !authMaterials.some(m => m.authScope?.some(s => s.includes('纹样') || s.includes('图案')));
    if (cat.key === 'brand') return !authMaterials.some(m => m.authScope?.some(s => s.includes('品牌') || s.includes('商标') || s.includes('博物馆')));
    if (cat.key === 'production') return !authMaterials.some(m => m.authScope?.some(s => s.includes('生产') || s.includes('制作') || s.includes('文创') || s.includes('包装')));
    return false;
  });

  const hasOnline = allScopes.some(s => onlineKeywords.some(k => s.includes(k)));
  const hasOffline = allScopes.some(s => offlineKeywords.some(k => s.includes(k)));
  
  const scopeRestrictions: { label: string; type: 'allowed' | 'restricted' }[] = [];
  if (hasOnline && !hasOffline) {
    scopeRestrictions.push({ label: '仅限线上渠道', type: 'restricted' });
  } else if (hasOffline && !hasOnline) {
    scopeRestrictions.push({ label: '仅限线下渠道', type: 'restricted' });
  } else if (hasOnline && hasOffline) {
    scopeRestrictions.push({ label: '线上线下均可', type: 'allowed' });
  }

  const allowedCategories: string[] = [];
  const restrictedCategories: string[] = [];
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (allScopes.some(s => keywords.some(k => s.includes(k)))) {
      allowedCategories.push(cat);
    } else {
      restrictedCategories.push(cat);
    }
  }

  const pendingAuth = authMaterials.filter(m => m.authStatus === 'pending');
  const missingAuth = authMaterials.filter(m => m.authStatus === 'missing');
  const hasIssues = missingCategories.length > 0 || pendingAuth.length > 0 || missingAuth.length > 0;

  if (authMaterials.length === 0) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700">
          <XCircle className="w-4 h-4" />
          <span>未上传任何授权文件</span>
        </div>
      );
    }
    return (
      <div className="card p-4 border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-red-500" />
          <h4 className="font-medium text-gray-900">授权可用性检查</h4>
        </div>
        <div className="p-3 bg-red-50 rounded-xl flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700 text-sm">未上传任何授权文件</p>
            <p className="text-xs text-red-600 mt-1">请先在素材管理中上传展品、纹样、品牌等授权文件，避免导出不可用的包装稿件。</p>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
        hasIssues ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
      )}>
        {hasIssues ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        <span>
          {hasIssues 
            ? `${missingCategories.length > 0 ? `${missingCategories.length}项授权缺失` : ''}${pendingAuth.length > 0 ? ` ${pendingAuth.length}项待补充` : ''}`.trim()
            : '授权检查通过'
          }
        </span>
      </div>
    );
  }

  return (
    <div className={cn('card p-4', hasIssues && 'border-amber-200')}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className={cn('w-5 h-5', hasIssues ? 'text-amber-500' : 'text-green-500')} />
        <h4 className="font-medium text-gray-900">授权可用性检查</h4>
        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium',
          hasIssues ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        )}>
          {hasIssues ? '存在风险' : '检查通过'}
        </span>
      </div>

      <div className="space-y-3">
        {missingCategories.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">缺失授权</p>
            <div className="space-y-1.5">
              {missingCategories.map(cat => (
                <div key={cat.key} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-700">{cat.label}</p>
                    <p className="text-[10px] text-red-500">{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingAuth.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">待补充授权范围</p>
            {pendingAuth.map(m => (
              <div key={m.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-700">{m.name}</p>
                  <p className="text-[10px] text-amber-500">授权范围尚未填写，请在素材管理中补充</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {scopeRestrictions.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">渠道限制</p>
            {scopeRestrictions.map((r, i) => (
              <div key={i} className={cn('flex items-center gap-2 p-2 rounded-lg mb-1.5',
                r.type === 'restricted' ? 'bg-amber-50' : 'bg-green-50'
              )}>
                {r.type === 'restricted' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                <span className={cn('text-xs font-medium', r.type === 'restricted' ? 'text-amber-700' : 'text-green-700')}>{r.label}</span>
              </div>
            ))}
          </div>
        )}

        {(allowedCategories.length > 0 || restrictedCategories.length > 0) && (
          <div>
            <p className="text-xs text-gray-500 mb-2">品类覆盖</p>
            <div className="flex flex-wrap gap-1.5">
              {allowedCategories.map(c => (
                <span key={c} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {c}
                </span>
              ))}
              {restrictedCategories.map(c => (
                <span key={c} className="px-2 py-0.5 bg-stone-100 text-stone-400 rounded-full text-[10px] font-medium flex items-center gap-1">
                  <Info className="w-3 h-3" /> {c}未覆盖
                </span>
              ))}
            </div>
          </div>
        )}

        {!hasIssues && (
          <div className="p-3 bg-green-50 rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-700 text-sm">授权检查通过</p>
              <p className="text-xs text-green-600 mt-1">当前项目的授权文件已覆盖主要使用场景，可以放心生成和导出设计稿。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
