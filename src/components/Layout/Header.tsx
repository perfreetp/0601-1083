import { useState } from 'react';
import { Bell, Search, User, ChevronDown, Plus } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { formatDate } from '@/utils/exportUtils';

export const Header = () => {
  const [showProjectSelect, setShowProjectSelect] = useState(false);
  const { projects, currentProject, setCurrentProject, createNewProject } = useProjectStore();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newMuseumName, setNewMuseumName] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim() && newMuseumName.trim()) {
      createNewProject(newProjectName.trim(), newMuseumName.trim());
      setNewProjectName('');
      setNewMuseumName('');
      setShowNewProjectModal(false);
      setShowProjectSelect(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowProjectSelect(!showProjectSelect)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <span className="text-sm text-gray-500">项目:</span>
              <span className="text-sm font-medium text-gray-900">
                {currentProject?.name || '未选择项目'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProjectSelect ? 'rotate-180' : ''}`} />
            </button>

            {showProjectSelect && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-hover border border-stone-200 overflow-hidden animate-slide-up">
                <div className="p-3 border-b border-stone-100">
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">新建项目</span>
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setCurrentProject(project.id);
                        setShowProjectSelect(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0
                        ${currentProject?.id === project.id ? 'bg-primary-50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{project.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${project.status === 'completed' ? 'bg-green-100 text-green-700' :
                            project.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                            project.status === 'designing' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'}
                        `}>
                          {project.status === 'completed' ? '已完成' :
                           project.status === 'reviewing' ? '评审中' :
                           project.status === 'designing' ? '设计中' : '草稿'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{project.museumName}</span>
                        <span className="text-xs text-gray-400">{formatDate(project.updatedAt, 'MM-DD HH:mm')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索素材、项目..."
              className="pl-10 pr-4 py-2 w-64 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 transition-all"
            />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-800 rounded-full" />
          </button>

          <div className="h-8 w-px bg-stone-200" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">张设计</p>
              <p className="text-xs text-gray-500">设计师</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">创建新项目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="input-label">项目名称</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="例如：青花瓷系列文创包装"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="input-label">博物馆名称</label>
                <input
                  type="text"
                  value={newMuseumName}
                  onChange={(e) => setNewMuseumName(e.target.value)}
                  placeholder="例如：故宫博物院"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg text-gray-700 hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || !newMuseumName.trim()}
                className="flex-1 btn-primary"
              >
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectSelect && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => setShowProjectSelect(false)}
        />
      )}
    </>
  );
};
