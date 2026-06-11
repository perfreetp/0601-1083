import { useState, useRef } from 'react';
import {
  Droplets, Pipette, Upload, Save, Check, Eye, Copy, Trash2, Plus, RefreshCw, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { mockColorSchemes } from '@/utils/mockData';
import { generateColorScheme, extractDominantColor, getContrastRatio } from '@/utils/colorUtils';
import { cn } from '@/lib/utils';
import type { ColorScheme } from '@/types';

export default function ColorSchemePage() {
  const { currentProject, setColorScheme } = useProjectStore();
  const [savedSchemes, setSavedSchemes] = useState<ColorScheme[]>(mockColorSchemes);
  const [extractedColor, setExtractedColor] = useState<string | null>(null);
  const [contrastCheck, setContrastCheck] = useState<{ ratio: number; rating: string } | null>(null);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#8B2323');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    const dominantColor = await extractDominantColor(imageUrl);
    setExtractedColor(dominantColor);
    const newScheme = generateColorScheme(dominantColor, '提取配色');
    if (newScheme) setSavedSchemes(prev => [newScheme, ...prev]);
  };

  const checkContrast = () => {
    const ratio = getContrastRatio(bgColor, fgColor);
    const rating = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail';
    setContrastCheck({ ratio, rating });
  };

  const handleGenerateFromExtracted = () => {
    if (!extractedColor) return;
    const newScheme = generateColorScheme(extractedColor, '自定义配色');
    if (newScheme) setColorScheme(newScheme);
  };

  const currentScheme = currentProject?.colorScheme;

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">配色中心</h1>
          <p className="text-gray-500">提取主色、管理色板、检测对比度，打造专业配色方案</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> 从图片提取
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <Pipette className="w-5 h-5 text-primary-800" /> 主色提取
          </h3>
          <div onClick={() => fileInputRef.current?.click()}
            className="aspect-video border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all">
            {extractedColor ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-hover border-4 border-white" style={{ backgroundColor: extractedColor }} />
                <p className="font-mono text-lg font-medium">{extractedColor.toUpperCase()}</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">点击上传图片提取主色</p>
              </div>
            )}
          </div>
          {extractedColor && (
            <button onClick={handleGenerateFromExtracted} className="w-full btn-primary flex items-center justify-center gap-2 mt-4">
              <RefreshCw className="w-4 h-4" /> 生成配色方案
            </button>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-teal-600" /> 对比度检测
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">背景色</label>
                <div className="flex gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-stone-200" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                    className="input-field flex-1 font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="input-label">前景色</label>
                <div className="flex gap-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-stone-200" />
                  <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                    className="input-field flex-1 font-mono text-sm" />
                </div>
              </div>
            </div>
            <button onClick={checkContrast} className="w-full btn-teal">检测对比度</button>
            {contrastCheck && (
              <div className="p-4 rounded-xl animate-slide-up" style={{ backgroundColor: bgColor }}>
                <p className="text-center py-4 font-medium" style={{ color: fgColor }}>示例文字</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-200">
                  <div>
                    <p className="font-mono font-bold">{contrastCheck.ratio.toFixed(2)}:1</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {contrastCheck.rating === 'Fail' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : <CheckCircle className="w-5 h-5 text-green-500" />}
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium',
                      contrastCheck.rating === 'Fail' ? 'bg-red-100 text-red-700' :
                      contrastCheck.rating === 'AA' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    )}>{contrastCheck.rating}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-amber-600" /> 当前配色
          </h3>
          {currentScheme ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border-2 border-white shadow-card" style={{ backgroundColor: currentScheme.primary }} />
                <div>
                  <p className="font-medium text-gray-900">{currentScheme.name}</p>
                  <p className="font-mono text-sm text-gray-500">{currentScheme.primary}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">辅助色</p>
                <div className="grid grid-cols-3 gap-2">
                  {currentScheme.secondary.map((color, idx) => (
                    <div key={idx} onClick={() => copyColor(color)}
                      className="w-full h-10 rounded-lg mb-1 border border-stone-200 transition-transform hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: color }} title="点击复制颜色代码" />
                  ))}
                </div>
              </div>
              <div
                className="h-12 rounded-xl overflow-hidden"
                style={{ background: `linear-gradient(to right, ${currentScheme.primary}, ${currentScheme.secondary.join(', ')})` }} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Droplets className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>暂无配色方案</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif font-bold text-lg">保存的配色方案</h3>
          <div className="flex gap-2">{savedSchemes.length} 个方案 {copied && <span className="text-xs text-green-600">已复制!</span>}</div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {savedSchemes.map((scheme, idx) => {
            const isActive = currentScheme?.id === scheme.id;
            return (
              <div key={scheme.id} onClick={() => setColorScheme(scheme)}
                className={cn('card p-4 cursor-pointer transition-all duration-300 animate-slide-up relative group', `stagger-${(idx % 6) + 1}`,
                  isActive ? 'ring-2 ring-primary-800' : 'hover:-translate-y-1')}>
                {isActive && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-800 flex items-center justify-center z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg border-2 border-white shadow-card" style={{ backgroundColor: scheme.primary }} />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{scheme.name}</p>
                    <p className="font-mono text-xs text-gray-400">{scheme.primary}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {scheme.secondary.map((color, cIdx) => (
                    <div key={cIdx} className="flex-1 h-6 rounded" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="h-8 rounded-lg overflow-hidden" style={{ background: `linear-gradient(to right, ${scheme.primary}, ${scheme.secondary.join(', ')})` }} />
                <button onClick={(e) => { e.stopPropagation(); setSavedSchemes(prev => prev.filter(s => s.id !== scheme.id)); }}
                  className="absolute top-3 right-10 p-1.5 bg-white rounded-lg shadow-card opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            );
          })}
          <div className="card p-4 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all min-h-[160px]">
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">创建新方案</p>
          </div>
        </div>
      </div>
    </div>
  );
}
