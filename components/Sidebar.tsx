
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home as HomeIcon, 
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  ClipboardList,
  Factory,
  Folder,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView }) => {
  const [activeMenu, setActiveMenu] = useState(currentView);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['task', 'production', 'data', 'ops']);
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setActiveMenu(currentView);
  }, [currentView]);

  const toggleExpand = (key: string) => {
    if (isCollapsed) return; 
    setExpandedMenus(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleNav = (id: string) => {
    setActiveMenu(id);
    onNavigate(id);
    setHoveredMenuId(null);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMouseEnter = (id: string) => {
    if (!isCollapsed) return;
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    setHoveredMenuId(id);
  };

  const handleMouseLeave = () => {
    if (!isCollapsed) return;
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredMenuId(null);
    }, 150);
  };

  interface MenuConfig {
    id: string;
    label: string;
    icon?: React.ReactNode;
    type: 'link' | 'group';
    children?: { id: string; label: string }[];
  }

  const menuItems: MenuConfig[] = [
    { 
      id: 'home', 
      label: '首页', 
      icon: <HomeIcon size={18} />, 
      type: 'link' 
    },
    { 
      id: 'task', 
      label: '任务管理', 
      icon: <ClipboardList size={18} />, 
      type: 'group',
      children: [
        { id: 'task-center', label: '任务中心' },
        { id: 'scheduled-tasks', label: '定时任务' }
      ]
    },
    { 
      id: 'production', 
      label: '产线管理', 
      icon: <Factory size={18} />, 
      type: 'group',
      children: [
        { id: 'algo-manage', label: '算法管理' },
        { id: 'production-list', label: '产线列表' },
        { id: 'satellite-config', label: '卫星配置' }
      ]
    },
    { 
      id: 'data', 
      label: '数据管理', 
      icon: <Folder size={18} />, 
      type: 'group',
      children: [
        { id: 'data-resource', label: '数据资源' },
        { id: 'data-product', label: '数据产品' }
      ]
    },
    { 
      id: 'ops', 
      label: '运维管理', 
      icon: <BarChart3 size={18} />, 
      type: 'group',
      children: [
        { id: 'ops-dashboard', label: '运维大屏' },
        { id: 'alert-info', label: '预警信息' },
        { id: 'monitor-rules', label: '监控规则' }
      ]
    }
  ];

  const sidebarWidth = isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)';

  return (
    <div 
      className="h-full flex flex-col relative transition-all duration-300 ease-in-out bg-transparent border-r border-white/20 z-[60]" 
      style={{ width: sidebarWidth }}
    >
      {/* Boundary Toggle Button */}
      <div 
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 cursor-pointer shadow-lg z-[70] group transition-all"
      >
        {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
      </div>

      {/* Logo Area */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-6'}`} style={{ height: 'var(--header-height)' }}>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform transition-all duration-300 hover:scale-105 shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
          <Zap size={24} fill="currentColor" strokeWidth={0} />
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
            <h1 className="text-[20px] font-extrabold text-slate-800 tracking-tight leading-none whitespace-nowrap">时空数智工厂</h1>
            <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mt-0.5 opacity-80 whitespace-nowrap">Engine V2.1</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={`flex-1 pb-4 space-y-0.5 pt-2 ${isCollapsed ? 'px-2 overflow-visible' : 'px-3 overflow-y-auto custom-scrollbar'}`}>
        {menuItems.map((item) => {
          const isExpanded = expandedMenus.includes(item.id) && !isCollapsed;
          const isActive = activeMenu === item.id;
          const isHovered = hoveredMenuId === item.id;
          
          return (
            <div 
              key={item.id} 
              className="mb-1 relative"
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Main Menu Item */}
              <div 
                onClick={() => item.type === 'link' ? handleNav(item.id) : toggleExpand(item.id)}
                className={`
                  flex items-center py-2.5 cursor-pointer transition-all duration-200 rounded-md group
                  ${isCollapsed ? 'justify-center px-0' : 'px-3'}
                  ${isActive 
                    ? 'text-blue-700 font-semibold bg-blue-50/80 shadow-sm ring-1 ring-blue-100' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60 font-medium'}
                `}
              >
                <span className={`transition-colors duration-200 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-[16px] tracking-wide whitespace-nowrap animate-in fade-in duration-300">{item.label}</span>
                    {item.type === 'group' && (
                      <span className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Expanded Children (Full View) */}
              {!isCollapsed && isExpanded && item.children && (
                <div className="mt-1 space-y-0.5 mb-2 relative animate-in fade-in slide-in-from-top-1 duration-200 pl-8">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200/60" />
                  {item.children.map((child) => {
                    const isChildActive = activeMenu === child.id;
                    return (
                      <div
                        key={child.id}
                        onClick={() => handleNav(child.id)}
                        className={`
                          flex items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 relative
                          ${isChildActive 
                            ? 'text-blue-600 font-bold bg-white shadow-sm ring-1 ring-blue-50' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/40 font-medium'}
                        `}
                      >
                         <span className="text-[16px] tracking-wide whitespace-nowrap">{child.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hover Popup Menu (Collapsed View) */}
              {isCollapsed && isHovered && (
                <div 
                  className="absolute left-full top-0 ml-2 z-[1000] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl p-2 min-w-[160px] animate-in fade-in slide-in-from-left-2 duration-200"
                  onMouseEnter={() => { if(hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current); }}
                >
                  <div className="px-3 py-2 mb-1 border-b border-slate-50">
                    <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                  {item.children ? (
                    <div className="space-y-1">
                      {item.children.map((child) => (
                        <div
                          key={child.id}
                          onClick={() => handleNav(child.id)}
                          className={`
                            px-4 py-2.5 rounded-lg cursor-pointer transition-all text-[16px] font-bold
                            ${activeMenu === child.id 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}
                          `}
                        >
                          {child.label}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => handleNav(item.id)}
                      className={`
                        px-4 py-2.5 rounded-lg cursor-pointer transition-all text-[16px] font-bold
                        ${activeMenu === item.id 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}
                      `}
                    >
                      进入{item.label}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile */}
      <div className={`p-3 mt-auto mb-1 border-t border-white/20 pt-4 shrink-0`}>
        <div 
          className={`
            bg-white/40 backdrop-blur-md rounded-lg flex items-center transition-all hover:bg-white/60 hover:shadow-lg border border-white/40 hover:border-blue-100 group
            ${isCollapsed ? 'justify-center p-2' : 'p-2.5 gap-3'}
          `}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[1.5px] shadow-sm shrink-0">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User" 
              className="w-full h-full rounded-full bg-white"
            />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="text-[14px] font-bold text-slate-700 group-hover:text-blue-700 transition-colors truncate">系统管理员</p>
              <p className="text-[11px] text-slate-400 font-medium truncate tracking-wide">时空信息中心</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
