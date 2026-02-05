
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ArrowLeftRight, 
  Upload, 
  Folder, 
  X, 
  Home, 
  ChevronRight, 
  FileText, 
  FileImage, 
  FileArchive, 
  FileJson, 
  FileCode,
  Plus,
  RefreshCcw,
  Loader2,
  FolderPlus
} from 'lucide-react';
import { ResourceItem } from '../types';
import { MOCK_RESOURCES } from '../services/mockApi';

interface DataResourceSelectorProps {
  title?: string;
  visible: boolean;
  rootName?: string;
  storageKey?: string;
  selectionType?: 'file' | 'folder' | 'all'; 
  onClose: () => void;
  onConfirm: (result: string | ResourceItem) => void; 
}

export const DataResourceSelector: React.FC<DataResourceSelectorProps> = ({
  title = "选择文件",
  visible,
  rootName = "我的输入数据",
  storageKey = 'app_data_resources',
  selectionType = 'all',
  onClose,
  onConfirm
}) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pathStack, setPathStack] = useState<{id: string, name: string}[]>([
    { id: 'root', name: rootName }
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (visible) {
      const saved = localStorage.getItem(storageKey);
      setResources(saved ? JSON.parse(saved) : MOCK_RESOURCES);
      setSelectedId(null);
    }
  }, [visible, storageKey]);

  const currentFolder = pathStack[pathStack.length - 1];

  const filteredItems = useMemo(() => {
    let items = resources.filter(item => item.parentId === currentFolder.id);
    
    // 如果是目录选择模式，优先显示目录
    if (selectionType === 'folder') {
        // items = items.filter(item => item.type === 'folder'); // 如果需要只显示目录则开启
    }

    if (searchQuery) {
      items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return items;
  }, [currentFolder.id, searchQuery, resources, selectionType]);

  const handleItemClick = (item: ResourceItem) => {
    if (selectionType === 'folder') {
        if (item.type === 'folder') {
            setSelectedId(item.id === selectedId ? null : item.id);
        }
    } else {
        setSelectedId(item.id === selectedId ? null : item.id);
    }
  };

  const handleFolderEnter = (item: ResourceItem) => {
    if (item.type === 'folder') {
      setPathStack([...pathStack, { id: item.id, name: item.name }]);
      setSelectedId(null);
      setSearchQuery('');
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: ResourceItem = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        parentId: currentFolder.id,
        type: 'folder',
        date: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    const updated = [...resources, newFolder];
    setResources(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleConfirmAction = () => {
    const selected = resources.find(r => r.id === selectedId);
    const currentPathStr = pathStack.map(p => p.name).join('/');

    if (selectionType === 'folder') {
        if (selected && selected.type === 'folder') {
            onConfirm(`${currentPathStr}/${selected.name}`);
        } else {
            // 默认当前目录
            onConfirm(currentPathStr);
        }
    } else {
        if (selected) {
            onConfirm(`${currentPathStr}/${selected.name}`);
        } else {
            alert('请先选择一个项');
        }
    }
  };

  const getFileIcon = (item: ResourceItem, size: number = 20) => {
    if (item.type === 'folder') return <Folder size={size} fill="#fbbf24" strokeWidth={0} className="text-amber-400 opacity-90" />;
    switch (item.fileType) {
      case 'tif': return <FileImage size={size} className="text-blue-500" />;
      case 'zip': return <FileArchive size={size} className="text-indigo-500" />;
      case 'json': return <FileJson size={size} className="text-amber-500" />;
      default: return <FileText size={size} className="text-slate-400" />;
    }
  };

  if (!visible) return null;

  const selectedItem = resources.find(r => r.id === selectedId);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 font-['Noto_Sans_SC']">
      <div className="bg-white w-full max-w-[960px] h-[720px] rounded-[12px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4">
        
        {/* Header - 还原图1 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <h3 className="text-[16px] font-black text-slate-800 tracking-tight">{title}</h3>
             {selectionType === 'folder' && (
                <span className="px-2 py-0.5 bg-[#FFF7ED] text-[#EA580C] text-[11px] font-bold rounded border border-orange-100">
                  目录选择模式
                </span>
             )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Toolbar - 还原图2及其功能按钮组 */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 bg-[#F8FAFC]/50 shrink-0">
            <div className="relative group w-[320px]">
                <input 
                type="text" 
                placeholder="输入搜索内容..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>

            <div className="flex items-center gap-2">
                <button className="h-9 px-4 flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm">
                    <ArrowLeftRight size={14} className="text-slate-400" /> 传输队列
                </button>
                <button className="h-9 px-4 flex items-center gap-2 bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] rounded-lg text-[13px] font-bold hover:bg-blue-100 transition-all shadow-sm">
                    <Upload size={14} /> 上传数据
                </button>
                <button 
                    onClick={() => setIsCreatingFolder(true)}
                    className="h-9 px-6 flex items-center gap-2 bg-[#1E293B] text-white rounded-lg text-[13px] font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    添加目录
                </button>
            </div>
        </div>

        {/* Breadcrumbs - 还原图1样式 */}
        <div className="px-6 py-3 border-b border-slate-50 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
                <div 
                    onClick={() => setPathStack([{id: 'root', name: rootName}])}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 cursor-pointer transition-all shadow-sm shrink-0"
                >
                    <Home size={16} />
                </div>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                <div className="flex items-center gap-1.5 bg-[#2563EB] text-white px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-[13px] font-bold whitespace-nowrap">{currentFolder.name}</span>
                </div>
                {pathStack.length > 1 && pathStack.slice(1).map((item, index) => (
                    <React.Fragment key={item.id}>
                         <ChevronRight size={14} className="text-slate-300 shrink-0" />
                         <div className="text-slate-500 text-[13px] font-bold px-2">{item.name}</div>
                    </React.Fragment>
                ))}
            </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar px-6 bg-white relative">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-[#F8FAFC] text-slate-500 text-[13px] font-bold border-b border-slate-100">
                    <th className="px-4 py-3 w-16 text-center">选择</th>
                    <th className="px-4 py-3">名称</th>
                    <th className="px-4 py-3 w-32">大小</th>
                    <th className="px-4 py-3 w-32">类型</th>
                    <th className="px-4 py-3 w-48">修改日期</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {isCreatingFolder && (
                    <tr className="bg-blue-50/30">
                        <td className="px-4 py-3 text-center"><div className="w-4 h-4 rounded-full border-2 border-slate-200 mx-auto" /></td>
                        <td className="px-4 py-3" colSpan={4}>
                            <div className="flex items-center gap-2">
                                <Folder size={20} className="text-amber-400" />
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                    placeholder="新建文件夹名称"
                                    className="h-8 px-2 border border-blue-400 rounded outline-none text-[13px] w-64 bg-white"
                                />
                                <button onClick={handleCreateFolder} className="px-3 h-8 bg-blue-600 text-white rounded text-[12px] font-bold">确定</button>
                                <button onClick={() => setIsCreatingFolder(false)} className="px-3 h-8 bg-white border border-slate-200 text-slate-500 rounded text-[12px] font-bold">取消</button>
                            </div>
                        </td>
                    </tr>
                )}
                {filteredItems.map((item) => {
                    const isSelected = selectedId === item.id;
                    const isDir = item.type === 'folder';
                    
                    return (
                        <tr 
                            key={item.id} 
                            onClick={() => handleItemClick(item)}
                            onDoubleClick={() => handleFolderEnter(item)}
                            className={`hover:bg-slate-50 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                        >
                            <td className="px-4 py-3 text-center">
                                {isDir ? (
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all mx-auto ${isSelected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-300'}`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                    </div>
                                ) : (
                                    <div className="w-4 h-4 opacity-10 mx-auto" />
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0">
                                        {getFileIcon(item)}
                                    </div>
                                    <span className={`text-[13px] font-bold truncate max-w-[400px] ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                                        {item.name}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-[13px] font-mono tracking-tighter">{item.size || '-'}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border border-transparent ${
                                    isDir ? 'bg-[#F1F5F9] text-slate-500' : 'bg-white text-slate-400'
                                } uppercase`}>
                                    {isDir ? '普通目录' : (item.fileType || '文件')}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-[13px] font-mono tracking-tighter">{item.date}</td>
                        </tr>
                    );
                })}
                {filteredItems.length === 0 && !isCreatingFolder && (
                    <tr>
                    <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Folder size={48} className="opacity-10" />
                        <p className="text-[13px] font-medium">暂无数据</p>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>

        {/* Footer - 还原图1状态展示 */}
        <div className="px-8 py-6 flex justify-between items-center bg-white border-t border-slate-50 shrink-0">
          <div className="text-[13px] text-slate-400 font-medium">
             {selectedId ? (
                <span>已选择：<strong className="text-blue-600 font-black">{selectedItem?.name}</strong></span>
             ) : (
                <span>未选择 (默认当前目录)</span>
             )}
          </div>
          <div className="flex gap-4">
            <button 
                onClick={onClose} 
                className="w-32 h-10 rounded-lg border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all text-[14px]"
            >
                取消
            </button>
            <button 
                onClick={handleConfirmAction} 
                className="w-32 h-10 rounded-lg bg-[#2563EB] text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-[14px]"
            >
                确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
