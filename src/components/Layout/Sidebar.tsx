import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image, 
  Palette, 
  FileText, 
  Droplets, 
  MessageSquare, 
  Download,
  ChevronRight
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

const navItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard, path: '/' },
  { id: 'material', label: '素材导入', icon: Image, path: '/material' },
  { id: 'style', label: '风格设计', icon: Palette, path: '/style' },
  { id: 'proofread', label: '文字校对', icon: FileText, path: '/proofread' },
  { id: 'color', label: '配色中心', icon: Droplets, path: '/color' },
  { id: 'review', label: '评审协作', icon: MessageSquare, path: '/review' },
  { id: 'export', label: '导出中心', icon: Download, path: '/export' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { setActiveTab, currentProject } = useProjectStore();
  
  const activeTab = navItems.find(item => item.path === location.pathname)?.id || 'dashboard';

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-elegant flex items-center justify-center">
            <span className="text-primary-800 font-serif font-bold text-lg">文</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-gray-900">文创设计</h1>
            <p className="text-xs text-gray-500">博物馆自动化平台</p>
          </div>
        </div>
      </div>

      {currentProject && (
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
          <p className="text-xs text-gray-500 mb-1">当前项目</p>
          <p className="text-sm font-medium text-gray-900 truncate">{currentProject.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${currentProject.progress}%` }}
              />
            </div>
            <span className="text-xs text-primary-800 font-medium">{currentProject.progress}%</span>
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item, index) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                onClick={() => setActiveTab(item.id)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-800 text-white shadow-elegant' 
                    : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
                  }
                  animate-fade-in stagger-${index + 1}
                `}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-primary-800'} transition-colors`} />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-stone-200">
        <div className="card p-4 bg-gradient-elegant">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-800 text-white flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">?</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">需要帮助？</p>
              <p className="text-xs text-gray-500 mt-0.5">查看使用教程或联系客服</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
