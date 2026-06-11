import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  Palette,
  FileCheck,
  Droplets,
  MessageSquare,
  Download,
  Clock,
  TrendingUp,
  FolderKanban,
  ChevronRight,
  Sparkles,
  Activity
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { getTimeAgo } from '@/utils/exportUtils';

const quickActions = [
  { id: 'material', icon: Image, label: '素材管理', color: 'bg-blue-500', path: '/material' },
  { id: 'style', icon: Palette, label: '风格设计', color: 'bg-purple-500', path: '/style' },
  { id: 'proofread', icon: FileCheck, label: '文字校对', color: 'bg-green-500', path: '/proofread' },
  { id: 'color', icon: Droplets, label: '配色中心', color: 'bg-amber-500', path: '/color' },
  { id: 'review', icon: MessageSquare, label: '评审协作', color: 'bg-rose-500', path: '/review' },
  { id: 'export', icon: Download, label: '导出中心', color: 'bg-teal-600', path: '/export' },
];

const statusConfig = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  designing: { label: '设计中', color: 'bg-blue-100 text-blue-700' },
  reviewing: { label: '评审中', color: 'bg-amber-100 text-amber-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, currentProject, setActiveTab } = useProjectStore();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleQuickAction = (path: string, tabId: string) => {
    setActiveTab(tabId);
    navigate(path);
  };

  const stats = [
    { icon: FolderKanban, label: '总项目数', value: projects.length, color: 'text-primary-800', bg: 'bg-primary-50' },
    { icon: Activity, label: '进行中', value: projects.filter(p => p.status === 'designing' || p.status === 'reviewing').length, color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: TrendingUp, label: '已完成', value: projects.filter(p => p.status === 'completed').length, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Sparkles, label: '素材总数', value: projects.reduce((sum, p) => sum + p.materials.length, 0), color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentActivities = [
    { id: 1, user: '张设计', action: '更新了设计版本', project: '青花瓷系列', time: '5分钟前' },
    { id: 2, user: '李审核', action: '提交了评审意见', project: '青花瓷系列', time: '15分钟前' },
    { id: 3, user: '张设计', action: '上传了新素材', project: '佛像系列钥匙扣', time: '1小时前' },
    { id: 4, user: '系统', action: '自动保存版本', project: '春节限定礼盒', time: '2小时前' },
    { id: 5, user: '王管理', action: '审批通过', project: '儿童教育系列', time: '昨天' },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">工作台</h1>
        <p className="text-gray-500">欢迎回来，今天也要元气满满地创作哦～</p>
      </div>

      {currentProject && (
        <div className="card p-6 mb-6 animate-slide-up overflow-hidden relative chinese-pattern">
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-gray-900">{currentProject.name}</h2>
                <p className="text-sm text-gray-500">{currentProject.museumName}</p>
              </div>
              <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusConfig[currentProject.status].color)}>
                {statusConfig[currentProject.status].label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{currentProject.description}</p>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">项目进度</span>
                  <span className="font-medium text-primary-800">{currentProject.progress}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${currentProject.progress}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                更新于 {getTimeAgo(currentProject.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              'card p-5 animate-slide-up',
              `stagger-${index + 1}`,
              'transition-all duration-300 hover:-translate-y-1'
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title mb-4">快捷入口</h3>
      <div className="grid grid-cols-6 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.path, action.id)}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            className={cn(
              'card p-5 flex flex-col items-center gap-3 transition-all duration-300',
              'animate-slide-up',
              `stagger-${index + 1}`,
              hoveredAction === action.id ? 'scale-105 shadow-hover' : ''
            )}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-transform duration-300',
                action.color,
                hoveredAction === action.id ? 'scale-110 rotate-3' : ''
              )}
            >
              <action.icon className="w-7 h-7" />
            </div>
            <span className="font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h3 className="section-title mb-4">全部项目</h3>
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={cn(
                  'card p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 animate-slide-up',
                  `stagger-${index + 1}`,
                  'hover:shadow-hover hover:-translate-y-0.5'
                )}
                onClick={() => useProjectStore.getState().setCurrentProject(project.id)}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-elegant flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-primary-800" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs', statusConfig[project.status].color)}>
                      {statusConfig[project.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{project.museumName}</p>
                </div>
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">进度</span>
                    <span className="text-primary-800 font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-700"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {getTimeAgo(project.updatedAt)}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="section-title mb-4">最近活动</h3>
          <div className="card p-4">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex gap-3 pb-4 border-b border-stone-100 last:border-0 last:pb-0 animate-slide-in',
                    `stagger-${index + 1}`
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">{activity.user}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{activity.project}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
