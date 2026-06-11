import { useState, useCallback } from 'react';
import {
  FileText, AlertCircle, Check, Sparkles, RotateCcw, Copy, CheckCircle2, XCircle,
  Info, Lightbulb, BookOpen, GripVertical
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { proofreadText, applySuggestion, fixAllIssues, getStatistics } from '@/utils/proofreadUtils';
import { cn } from '@/lib/utils';
import type { ProofreadReport, ProofreadResult } from '@/types';

export default function Proofread() {
  const { currentProject, setProofreadReport } = useProjectStore();
  const [text, setText] = useState('故宫博物院，是中国最大的古代文化艺术博物馆。博物院建立于1925年，位于北京故宫紫禁城内。故宫的收藏品包括但不限于绘画、书法、青铜器、陶瓷等。');
  const [report, setReport] = useState<ProofreadReport | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = useCallback(() => {
    setIsChecking(true);
    setTimeout(() => {
      const result = proofreadText(text);
      setReport(result);
      setProofreadReport(result);
      setIsChecking(false);
    }, 800);
  }, [text, setProofreadReport]);

  const handleFixAll = () => {
    if (!report) return;
    const fixed = fixAllIssues(text, report);
    setText(fixed);
    setReport(proofreadText(fixed));
  };

  const handleApplySuggestion = (resultId: string) => {
    const result = report?.results.find(r => r.id === resultId);
    if (!result) return;
    const newText = applySuggestion(text, result);
    setText(newText);
    setReport(proofreadText(newText));
    setSelectedIssue(null);
  };

  const rawStats = report ? getStatistics(report) : { errors: 0, warnings: 0, infos: 0, byType: { forbidden: 0, museum: 0, person: 0, era: 0 } };
  const stats = {
    total: rawStats.errors + rawStats.warnings + rawStats.infos,
    errors: rawStats.errors,
    warnings: rawStats.warnings,
    suggestions: rawStats.infos,
    fixed: 0,
  };
  const progress = text.length > 0 ? Math.round((1 - stats.errors / Math.max(1, stats.total)) * 100) : 100;

  const renderHighlightedText = () => {
    if (!report || report.results.length === 0) return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>;
    const segments: JSX.Element[] = [];
    let lastIndex = 0;
    report.results.sort((a, b) => a.position.start - b.position.start).forEach((issue, idx) => {
      if (issue.position.start > lastIndex) segments.push(<span key={`text-${idx}`}>{text.slice(lastIndex, issue.position.start)}</span>);
      const severityClasses = { error: 'bg-red-100 text-red-800 border-b-2 border-red-400', warning: 'bg-amber-100 text-amber-800 border-b-2 border-amber-400', info: 'bg-blue-100 text-blue-800 border-b-2 border-blue-400', suggestion: 'bg-blue-100 text-blue-800 border-b-2 border-blue-400' };
      segments.push(
        <span key={`issue-${issue.id}`} onClick={() => setSelectedIssue(issue.id === selectedIssue ? null : issue.id)}
          className={cn('cursor-pointer transition-all duration-200 hover:scale-105', severityClasses[issue.severity as keyof typeof severityClasses],
            selectedIssue === issue.id && 'ring-2 ring-offset-2 ring-primary-500 rounded px-0.5')}>
          {text.slice(issue.position.start, issue.position.end)}
        </span>
      );
      lastIndex = issue.position.end;
    });
    if (lastIndex < text.length) segments.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    return <p className="text-gray-700 leading-loose whitespace-pre-wrap">{segments}</p>;
  };

  const selectedIssueData = report?.results.find(i => i.id === selectedIssue);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">文字校对</h1>
          <p className="text-gray-500">智能检测错误、提供修改建议，确保文案准确专业</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setText('')} className="btn-secondary flex items-center gap-2"><RotateCcw className="w-4 h-4" /> 清空</button>
          <button onClick={handleCheck} disabled={isChecking} className="btn-primary flex items-center gap-2">
            {isChecking ? <><Sparkles className="w-4 h-4 animate-pulse" /> 检查中...</> : <><Check className="w-4 h-4" /> 开始检查</>}
          </button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label: '总问题', value: stats.total, icon: AlertCircle, color: 'text-primary-800', bg: 'bg-primary-50' },
            { label: '错误', value: stats.errors, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: '警告', value: stats.warnings, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: '建议', value: stats.suggestions, icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '已修复', value: stats.fixed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat, idx) => (
            <div key={stat.label} className={cn('card p-4 flex items-center gap-4 animate-slide-up', `stagger-${idx + 1}`)}>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-800" /> 文本编辑器
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{text.length} 字</span>
                <button onClick={() => navigator.clipboard.writeText(text)} className="p-2 hover:bg-stone-100 rounded-lg">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="请输入需要校对的文字内容..."
              className="w-full h-40 p-4 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" /> 校对结果
              </h3>
              {report && report.results.length > 0 && (
                <button onClick={handleFixAll} className="btn-teal text-sm py-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 一键修复
                </button>
              )}
            </div>
            <div className="min-h-[200px] p-4 bg-stone-50/50 rounded-xl">
              {report ? renderHighlightedText() : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>点击"开始检查"进行文字校对</p>
                </div>
              )}
            </div>
          </div>

          {report && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">整体质量</h4>
                <span className={cn('text-sm font-medium', progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-amber-600' : 'text-red-600')}>
                  {progress}%
                </span>
              </div>
              <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-1000 ease-out',
                  progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selectedIssueData ? (
            <div className="card p-5 animate-slide-in">
              <h3 className="font-serif font-bold text-lg mb-4">修改建议</h3>
              <div className="p-4 bg-red-50 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {selectedIssueData.severity === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                  {selectedIssueData.severity === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  {selectedIssueData.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm font-medium text-gray-900">原文：</span>
                </div>
                <p className="font-mono text-sm text-gray-800 bg-white px-3 py-2 rounded-lg">
                  {text.slice(selectedIssueData.position.start, selectedIssueData.position.end)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">建议：</span>
                </div>
                <p className="font-mono text-sm text-gray-800 bg-white px-3 py-2 rounded-lg">
                  {selectedIssueData.suggestion}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">{selectedIssueData.description}</p>
              <div className="flex gap-2">
                <button onClick={() => handleApplySuggestion(selectedIssueData.id)}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> 应用建议
                </button>
                <button onClick={() => setSelectedIssue(null)} className="px-4 py-2 bg-stone-100 text-gray-600 rounded-lg hover:bg-stone-200 transition-all">
                  忽略
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-5">
              <h3 className="font-serif font-bold text-lg mb-4">问题列表</h3>
              {report && report.results.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {report.results.map((issue, idx) => (
                    <IssueItem key={issue.id} issue={issue} index={idx} isSelected={selectedIssue === issue.id}
                      text={text} onSelect={() => setSelectedIssue(issue.id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {report ? <><CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" /><p>文案很棒，没有发现问题！</p></>
                    : <><GripVertical className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>检查后显示问题列表</p></>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IssueItem({ issue, index, isSelected, text, onSelect }: {
  issue: ProofreadResult; index: number; isSelected: boolean; text: string;
  onSelect: () => void;
}) {
  const severityConfig = {
    error: { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
    warning: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertCircle },
    info: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Info },
    suggestion: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Info },
  };
  const config = severityConfig[issue.severity as keyof typeof severityConfig];
  return (
    <div className={cn('p-3 rounded-xl border transition-all cursor-pointer animate-slide-in', `stagger-${(index % 6) + 1}`,
      isSelected ? 'ring-2 ring-primary-500' : 'hover:bg-stone-50', config.color)} onClick={onSelect}>
      <div className="flex items-start gap-2 mb-2">
        <config.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-gray-900 line-clamp-2">{issue.description}</p>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="font-mono bg-white/50 px-2 py-0.5 rounded">{text.slice(issue.position.start, issue.position.end)}</span>
        <span className="text-gray-400">→</span>
        <span className="font-mono bg-white/70 px-2 py-0.5 rounded">{issue.suggestion}</span>
      </div>
    </div>
  );
}
