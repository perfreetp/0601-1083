import { useState } from 'react';
import {
  Crown,
  Sparkles,
  PartyPopper,
  Minus,
  Package,
  Tag,
  Sticker,
  ShoppingBag,
  FileText,
  Check,
  Eye,
  Save,
  RotateCcw
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { styleOptions, layoutOptions } from '@/utils/mockData';
import { cn } from '@/lib/utils';
import type { DesignStyle, LayoutType } from '@/types';

const styleIcons: Record<string, React.ElementType> = {
  Crown, Sparkles, PartyPopper, Minus
};

const layoutIcons: Record<string, React.ElementType> = {
  Package, Tag, Sticker, ShoppingBag, FileText
};

export default function StyleDesign() {
  const { currentProject, setStyle, generateLayouts, saveVersion } = useProjectStore();
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(currentProject?.currentStyle || 'elegant');
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('box');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleStyleSelect = (style: DesignStyle) => {
    setSelectedStyle(style);
    setStyle(style);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateLayouts();
      setIsGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  const handleSaveVersion = () => {
    saveVersion(`应用${styleOptions.find(s => s.id === selectedStyle)?.name}风格`);
  };

  const currentStyleConfig = styleOptions.find(s => s.id === selectedStyle);
  const currentLayoutConfig = layoutOptions.find(l => l.id === selectedLayout);

  const latestVersion = currentProject?.versions[currentProject.versions.length - 1];
  const currentLayout = latestVersion?.layouts.find(l => l.type === selectedLayout);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">风格设计</h1>
          <p className="text-gray-500">选择设计风格，实时预览不同版式的渲染效果</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => {}} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <button onClick={handleSaveVersion} className="btn-secondary flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存版本
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary flex items-center gap-2"
          >
            {isGenerating ? (
              <><RotateCcw className="w-4 h-4 animate-spin" /> 生成中...</>
            ) : (
              <><Eye className="w-4 h-4" /> 生成预览</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {styleOptions.map((style, index) => {
          const Icon = styleIcons[style.icon];
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id as DesignStyle)}
              className={cn(
                'card p-5 text-left transition-all duration-300 relative overflow-hidden',
                'animate-slide-up',
                `stagger-${index + 1}`,
                isSelected ? 'ring-2 ring-primary-800' : 'hover:-translate-y-1'
              )}
            >
              <div
                className="absolute inset-0 opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: style.color, opacity: isSelected ? 0.15 : 0.05 }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: style.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary-800 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">{style.name}</h3>
                <p className="text-sm text-gray-500">{style.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mb-6">
        {layoutOptions.map((layout) => {
          const Icon = layoutIcons[layout.icon];
          const isSelected = selectedLayout === layout.id;
          return (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id as LayoutType)}
              className={cn(
                'px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3',
                isSelected
                  ? 'bg-primary-800 text-white shadow-card'
                  : 'bg-white text-gray-600 hover:bg-stone-100 border border-stone-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">{layout.name}</div>
                <div className={cn('text-xs', isSelected ? 'text-white/70' : 'text-gray-400')}>
                  {layout.size}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg">
                {currentLayoutConfig?.name} 预览
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-1 rounded-full bg-stone-100">
                  尺寸: {currentLayoutConfig?.size}
                </span>
                <span className="px-2 py-1 rounded-full" style={{ backgroundColor: `${currentStyleConfig?.color}20`, color: currentStyleConfig?.color }}>
                  {currentStyleConfig?.name}风格
                </span>
              </div>
            </div>

            <div
              className="aspect-[4/3] rounded-xl bg-gradient-elegant flex items-center justify-center relative overflow-hidden"
              style={{
                background: currentProject?.colorScheme
                  ? `linear-gradient(135deg, ${currentProject.colorScheme.primary}10 0%, ${currentProject.colorScheme.secondary[0]}20 100%)`
                  : undefined
              }}
            >
              {isGenerating ? (
                <div className="text-center">
                  <RotateCcw className="w-12 h-12 text-primary-800 animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">正在生成渲染效果...</p>
                </div>
              ) : currentLayout?.previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={currentLayout.previewUrl}
                    alt={currentLayout.name}
                    className="w-full h-full object-cover rounded-xl animate-fade-in"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="font-serif font-bold text-lg">{currentLayout.name}</h4>
                    <p className="text-sm opacity-80">{currentProject?.museumName}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>点击"生成预览"查看渲染效果</p>
                </div>
              )}
            </div>

            {showPreview && currentLayout && (
              <div className="mt-4 p-4 bg-stone-50 rounded-xl animate-slide-up">
                <h4 className="font-medium text-gray-700 mb-2">版式元素</h4>
                <div className="grid grid-cols-4 gap-2">
                  {currentLayout.elements.map((el, idx) => (
                    <div key={el.id} className="bg-white p-3 rounded-lg text-center">
                      <div className="text-xs text-gray-400 mb-1">元素 {idx + 1}</div>
                      <div className="text-sm font-medium text-gray-700 capitalize">{el.type}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {el.width}×{el.height}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-serif font-bold text-lg mb-4">全部版式预览</h3>
            <div className="space-y-3">
              {layoutOptions.map((layout, idx) => {
                const Icon = layoutIcons[layout.icon];
                const layoutData = latestVersion?.layouts.find(l => l.type === layout.id);
                return (
                  <div
                    key={layout.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer',
                      selectedLayout === layout.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-stone-50 hover:bg-stone-100'
                    )}
                    onClick={() => setSelectedLayout(layout.id as LayoutType)}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        selectedLayout === layout.id ? 'bg-primary-800 text-white' : 'bg-white text-gray-400'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-700">{layout.name}</div>
                      <div className="text-xs text-gray-400">{layout.size}</div>
                    </div>
                    {layoutData && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-serif font-bold text-lg mb-4">当前配色</h3>
            {currentProject?.colorScheme && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-white shadow-card"
                    style={{ backgroundColor: currentProject.colorScheme.primary }}
                  />
                  <div>
                    <div className="font-medium text-gray-700">{currentProject.colorScheme.name}</div>
                    <div className="text-xs text-gray-400">主色</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentProject.colorScheme.secondary.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-8 rounded-lg border border-stone-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
