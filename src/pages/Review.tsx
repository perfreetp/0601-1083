import { useState } from 'react';
import {
  MessageSquare, Star, CheckCircle, XCircle, Clock, Send, ChevronLeft, ChevronRight,
  Check, X, GitCompare, ThumbsUp, AlertCircle
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/exportUtils';
import type { ReviewComment, ReviewStatus } from '@/types';

const statusConfig: Record<ReviewStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: '待评审', color: 'text-amber-600 bg-amber-100', icon: Clock },
  approved: { label: '已通过', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  rejected: { label: '已拒绝', color: 'text-red-600 bg-red-100', icon: XCircle },
};

export default function Review() {
  const { currentProject, addReviewComment, setReviewScore, setReviewStatus, rollbackVersion } = useProjectStore();
  const [leftVersion, setLeftVersion] = useState(0);
  const [rightVersion, setRightVersion] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const versions = currentProject?.versions || [];
  const reviews = currentProject?.reviews || [];
  const leftVer = versions[leftVersion];
  const rightVer = versions[rightVersion];
  const currentReview = selectedVersion ? reviews.find(r => r.versionId === selectedVersion) : null;

  const handleAddComment = () => {
    if (!selectedVersion || !newComment.trim()) return;
    addReviewComment(selectedVersion, { author: '当前用户', content: newComment });
    setNewComment('');
  };

  const unresolvedComments = currentReview?.comments.filter(c => !c.resolved).length || 0;
  const resolvedComments = currentReview?.comments.filter(c => c.resolved).length || 0;

  const renderStars = (score: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? (hoveredRating || score) >= star * 20 : score >= star * 20;
        return (
          <button key={star}
            onClick={() => interactive && setReviewScore(selectedVersion!, star * 20)}
            onMouseEnter={() => interactive && setHoveredRating(star * 20)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={cn('transition-all duration-200', interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default')}
            disabled={!interactive}>
            <Star className={cn('w-5 h-5', filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">评审协作</h1>
          <p className="text-gray-500">版本对比、评论标注、星级评分，高效完成设计评审</p>
        </div>
        <div className="flex items-center gap-2"><GitCompare className="w-5 h-5 text-primary-800" /><span className="font-medium">版本对比模式</span></div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '总版本数', value: versions.length, icon: GitCompare, color: 'text-primary-800', bg: 'bg-primary-50' },
          { label: '待评审', value: reviews.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '已通过', value: reviews.filter(r => r.status === 'approved').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '待解决', value: reviews.reduce((sum, r) => sum + r.comments.filter(c => !c.resolved).length, 0), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
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

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 flex items-center gap-2">
              <button onClick={() => setLeftVersion(Math.max(0, leftVersion - 1))} disabled={leftVersion === 0}
                className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <select value={leftVersion} onChange={(e) => setLeftVersion(Number(e.target.value))} className="input-field flex-1">
                {versions.map((v, idx) => <option key={v.id} value={idx}>版本 {v.version} - {v.description}</option>)}
              </select>
            </div>
            <div className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-sm font-medium">VS</div>
            <div className="flex-1 flex items-center gap-2">
              <select value={rightVersion} onChange={(e) => setRightVersion(Number(e.target.value))} className="input-field flex-1">
                {versions.map((v, idx) => <option key={v.id} value={idx}>版本 {v.version} - {v.description}</option>)}
              </select>
              <button onClick={() => setRightVersion(Math.min(versions.length - 1, rightVersion + 1))} disabled={rightVersion === versions.length - 1}
                className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[leftVer, rightVer].map((ver, idx) => (
              <div key={ver?.id || idx}
                className={cn('card p-4 cursor-pointer transition-all duration-300', selectedVersion === ver?.id && 'ring-2 ring-primary-800')}
                onClick={() => ver && setSelectedVersion(ver.id)}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">版本 {ver?.version}</h4>
                    <p className="text-xs text-gray-500">{formatDate(ver?.createdAt || '', 'YYYY-MM-DD HH:mm')}</p>
                  </div>
                  {ver && reviews.find(r => r.versionId === ver.id) && (
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusConfig[reviews.find(r => r.versionId === ver.id)!.status].color)}>
                      {statusConfig[reviews.find(r => r.versionId === ver.id)!.status].label}
                    </span>
                  )}
                </div>
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 mb-3">
                  {ver?.layouts[0]?.previewUrl ? (
                    <img src={ver.layouts[0].previewUrl} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-400">暂无预览</div>}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{ver?.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {currentReview && (
            <div className="card p-5 animate-slide-in">
              <h3 className="font-serif font-bold text-lg mb-4">版本评分</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-primary-800 mb-2">{currentReview.score}</div>
                {renderStars(currentReview.score, true)}
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setReviewStatus(selectedVersion!, 'approved')}
                  className={cn('flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all',
                    currentReview.status === 'approved' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100')}>
                  <Check className="w-4 h-4" /> 通过
                </button>
                <button onClick={() => setReviewStatus(selectedVersion!, 'rejected')}
                  className={cn('flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all',
                    currentReview.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100')}>
                  <X className="w-4 h-4" /> 拒绝
                </button>
              </div>
              {currentReview.status === 'rejected' && (
                <button onClick={() => rollbackVersion(selectedVersion!)}
                  className="w-full py-2 rounded-lg font-medium bg-stone-100 text-gray-700 hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" /> 回滚到此版本
                </button>
              )}
            </div>
          )}

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg">评论</h3>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">{unresolvedComments} 待解决</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">{resolvedComments} 已解决</span>
              </div>
            </div>
            {selectedVersion ? (
              <>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="添加评论..." className="input-field flex-1 text-sm" />
                  <button onClick={handleAddComment} disabled={!newComment.trim()}
                    className="px-3 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {currentReview?.comments.map((comment, idx) => (
                    <CommentItem key={comment.id} comment={comment} index={idx} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>选择版本查看评论</p>
              </div>
            )}
          </div>

          {currentReview && currentReview.comments.length > 0 && (
            <div className="card p-5">
              <h3 className="font-serif font-bold text-lg mb-4">意见汇总</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-green-600" /><span className="text-sm">正面反馈</span></div>
                  <span className="font-medium text-green-600">{currentReview.comments.filter(c => c.content.includes('好')).length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-600" /><span className="text-sm">需要修改</span></div>
                  <span className="font-medium text-amber-600">{unresolvedComments}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /><span className="text-sm">已解决</span></div>
                  <span className="font-medium text-blue-600">{resolvedComments}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, index }: { comment: ReviewComment; index: number }) {
  const [resolved, setResolved] = useState(comment.resolved);
  return (
    <div className={cn('p-3 rounded-xl transition-all animate-slide-in', `stagger-${(index % 6) + 1}`,
      resolved ? 'bg-green-50 border border-green-200' : 'bg-stone-50')}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs flex-shrink-0">
          {comment.author.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-gray-900">{comment.author}</span>
            <button onClick={() => setResolved(!resolved)}
              className={cn('p-1 rounded-lg transition-all', resolved ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-green-50')}>
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
          <p className={cn('text-sm text-gray-700', resolved && 'line-through opacity-60')}>{comment.content}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(comment.createdAt, 'MM-DD HH:mm')}</p>
        </div>
      </div>
    </div>
  );
}
