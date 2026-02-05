
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Folder, 
  X, 
  Home, 
  ChevronRight, 
  FileText, 
  FileImage, 
  FileArchive, 
  FileJson, 
  FileCode,
  Link as LinkIcon,
  Users,
  Settings2,
  CheckSquare,
  Filter,
  Loader2
} from 'lucide-react';
import { ResourceItem, SatelliteConfig } from '../types';
import { MOCK_RESOURCES, MockApi } from '../services/mockApi';

interface StandardResourceMatcherProps {
  title?: string;
  visible: boolean;
  rootName?: string;
  storageKey?: string;
  onClose: () => void;
  onConfirm: (results: ResourceItem[], path: string, configName: string) => void;
  initialPathStr?: string; // Optional: to restore previous path state
}

export const StandardResourceMatcher: React.FC<StandardResourceMatcherProps> = ({
  title = "选择数据与匹配规则",
  visible,
  rootName = "我的输入数据",
  storageKey = 'app_data_resources',
  onClose,
  onConfirm,
  initialPathStr
}) => {
  // --- Data & Config Loading ---
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [satConfigs, setSatConfigs] = useState<SatelliteConfig[]>([]);
  
  useEffect(() => {
    if (visible) {
      const savedRes = localStorage.getItem(storageKey);
      setResources(savedRes ? JSON.parse(savedRes) : MOCK_RESOURCES);

      const savedConfigs = localStorage.getItem('app_satellite_configs');
      if (savedConfigs) {
        setSatConfigs(JSON.parse(savedConfigs));
      } else {
        // Fallback or empty
        setSatConfigs([]);
      }
    }
  }, [visible, storageKey]);

  // --- State ---
  const [pathStack, setPathStack] = useState<{id: string, name: string}[]>([
    { id: 'root', name: rootName }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  
  // Selection State
  const [matchedFiles, setMatchedFiles] = useState<ResourceItem[]>([]); // The subset that matches rule
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // User checked items
  const [isLoading, setIsLoading] = useState(false);

  // Restore path if provided (basic implementation)
  useEffect(() => {
    if (visible && initialPathStr && initialPathStr !== rootName) {
       // Ideally we would parse the path string to IDs, here we just keep root for simplicity 
       // unless we have a map of PathString -> ID stack.
    }
  }, [visible, initialPathStr]);

  const currentFolder = pathStack[pathStack.length - 1];

  // --- Core Logic: Fetch & Filter ---
  // Whenever Path changes OR Config changes, we re-evaluate the file list.
  useEffect(() => {
    const fetchAndFilter = async () => {
      setIsLoading(true);
      
      // 1. Get raw items in current folder
      const allItemsInFolder = resources.filter(item => item.parentId === currentFolder.id);
      const folders = allItemsInFolder.filter(i => i.type === 'folder');
      
      let filesToShow: ResourceItem[] = [];

      if (selectedConfigId) {
        // 2a. If Config Selected: Call API to filter files
        filesToShow = await MockApi.matchResourcesByConfig(currentFolder.id, selectedConfigId);
      } else {
        // 2b. If No Config: Show all files (Browse Mode)
        filesToShow = allItemsInFolder.filter(i => i.type === 'file');
      }

      // 3. Update State
      // Combine folders (always visible for navigation) + filtered files
      setMatchedFiles([...folders, ...filesToShow]);
      
      // 4. Auto-Select Logic: If config is active, select all matched *files*
      if (selectedConfigId) {
        setSelectedIds(new Set(filesToShow.map(f => f.id)));
      } else {
        setSelectedIds(new Set()); // Reset selection in browse mode
      }

      setIsLoading(false);
    };

    if (visible) {
        fetchAndFilter();
    }
  }, [currentFolder.id, selectedConfigId, resources, visible]);


  // --- Filtering for Search Bar ---
  const displayedItems = useMemo(() => {
    if (!searchQuery) return matchedFiles;
    return matchedFiles.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [matchedFiles, searchQuery]);


  // --- Handlers ---
  const handleItemClick = (item: ResourceItem) => {
    if (item.type === 'folder') {
        // Navigate
        // Note: We don't select folders in this matcher, we enter them.
        // We *could* allow selecting a folder as a whole, but the requirement implies file-level matching.
        // Let's assume click = enter for folder, checkbox = select for file.
    } else {
        // Toggle selection
        const newSet = new Set(selectedIds);
        if (newSet.has(item.id)) newSet.delete(item.id);
        else newSet.add(item.id);
        setSelectedIds(newSet);
    }
  };

  const handleFolderEnter = (item: ResourceItem) => {
    if (item.type === 'folder') {
      setPathStack([...pathStack, { id: item.id, name: item.name }]);
      setSearchQuery('');
      // Config stays selected! This allows "Browsing with filter applied".
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setPathStack(pathStack.slice(0, index + 1));
  };

  const handleConfirmAction = () => {
    // Collect all selected file objects
    const selectedFiles = matchedFiles.filter(f => selectedIds.has(f.id) && f.type === 'file');
    
    if (selectedFiles.length === 0) {
        alert('请至少选择一个文件');
        return;
    }

    const currentPathStr = pathStack.map(p => p.name).join('/');
    const configName = satConfigs.find(c => c.id === selectedConfigId)?.name || '未指定规则';

    onConfirm(selectedFiles, currentPathStr, configName);
  };

  // --- UI Helpers ---
  const getFileIcon = (item: ResourceItem, size: number = 24) => {
    if (item.type === 'folder') {
      switch (item.folderSubType) {
        case 'linked': return <Folder size={size} fill="currentColor" strokeWidth={0} className="text-cyan-400" />;
        case 'public': return <Folder size={size} fill="currentColor" strokeWidth={0} className="text-indigo-400" />;
        default: return <Folder size={size} fill="currentColor" strokeWidth={0} className="text-amber-400" />;
      }
    }
    switch (item.fileType) {
      case 'tif': return <FileImage size={size} className="text-blue-500" />;
      case 'zip': return <FileArchive size={size} className="text-indigo-500" />;
      case 'json': return <FileJson size={size} className="text-amber-500" />;
      case 'xml': return <FileCode size={size} className="text-rose-400" />;
      default: return <FileText size={size} className="text-slate-400" />;
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[1000px] h-[750px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <h3 className="text-[16px] font-bold text-slate-800">{title}</h3>
             <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded border border-blue-100">配置驱动模式</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Combined Toolbar: Config Selection + Navigation */}
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex flex-col gap-4 shrink-0">
            
            {/* Top Row: Config Selection */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-[13px] whitespace-nowrap">
                    <Settings2 size={16} className="text-blue-600" />
                    匹配规则配置：
                </div>
                <div className="relative flex-1">
                    <select 
                        value={selectedConfigId}
                        onChange={(e) => setSelectedConfigId(e.target.value)}
                        className="w-full h-9 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer font-medium text-slate-700"
                    >
                        <option value="">请选择卫星型号 (浏览模式)</option>
                        {satConfigs.map(config => (
                            <option key={config.id} value={config.id}>
                                {config.name} ({config.code}) - {config.resolution}m
                            </option>
                        ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
                {selectedConfigId && (
                    <div className="text-[11px] text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold flex items-center gap-1 animate-in fade-in">
                        <CheckSquare size={12} /> 已启用静默过滤
                    </div>
                )}
            </div>

            {/* Bottom Row: Navigation & Search */}
            <div className="flex items-center justify-between">
                <div className="relative group w-[320px]">
                    <input 
                    type="text" 
                    placeholder="在当前结果中搜索..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 overflow-hidden ml-4 flex-1 justify-end">
                    <div 
                    onClick={() => setPathStack([{id: 'root', name: rootName}])}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 cursor-pointer transition-all shadow-sm shrink-0"
                    >
                    <Home size={16} />
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar justify-end">
                    {pathStack.map((item, index) => (
                        <React.Fragment key={item.id}>
                        {index > 0 && <ChevronRight size={14} className="text-slate-300 mx-0.5 shrink-0" />}
                        <div 
                            onClick={() => handleBreadcrumbClick(index)}
                            className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-bold cursor-pointer transition-all whitespace-nowrap
                            ${index === pathStack.length - 1 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}
                            `}
                        >
                            {item.name}
                        </div>
                        </React.Fragment>
                    ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-auto custom-scrollbar px-6 bg-white relative">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-[#EBF2FF] text-slate-600 text-[13px] font-bold border-b border-blue-100">
                    <th className="px-2 py-3 w-14 text-center whitespace-nowrap">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={matchedFiles.filter(i => i.type === 'file').length > 0 && selectedIds.size === matchedFiles.filter(i => i.type === 'file').length}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedIds(new Set(matchedFiles.filter(i => i.type === 'file').map(f => f.id)));
                                } else {
                                    setSelectedIds(new Set());
                                }
                            }}
                        />
                    </th>
                    <th className="px-4 py-3">名称</th>
                    <th className="px-4 py-3 w-32">大小</th>
                    <th className="px-4 py-3 w-32">类型</th>
                    <th className="px-4 py-3 w-48">修改日期</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                    <tr>
                        <td colSpan={5} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Loader2 size={32} className="animate-spin text-blue-500" />
                                <p className="text-[13px]">正在根据规则匹配数据...</p>
                            </div>
                        </td>
                    </tr>
                ) : displayedItems.length === 0 ? (
                    <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-300">
                        <div className="flex flex-col items-center gap-2">
                        <Folder size={40} className="opacity-20" />
                        <p className="text-[13px]">{selectedConfigId ? '当前目录下没有符合该卫星配置的文件' : '暂无数据'}</p>
                        </div>
                    </td>
                    </tr>
                ) : (
                    displayedItems.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                            <tr 
                            key={item.id} 
                            onClick={() => handleItemClick(item)}
                            onDoubleClick={() => handleFolderEnter(item)}
                            className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                            >
                            <td className="px-2 py-3 text-center">
                                {item.type === 'file' ? (
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mx-auto"
                                        checked={isSelected}
                                        readOnly
                                    />
                                ) : (
                                    <div className="w-4 h-4 mx-auto" /> 
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                <div className={item.type === 'folder' ? 'text-amber-400' : 'text-slate-400'}>
                                    {getFileIcon(item, 20)}
                                </div>
                                <span className={`text-[13px] font-medium text-slate-700 truncate max-w-[400px] ${item.type === 'folder' ? 'hover:text-blue-600 underline-offset-2 hover:underline' : ''}`}>
                                    {item.name}
                                </span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-[13px] font-mono tracking-tighter">{item.size || '-'}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                item.type === 'folder' 
                                    ? 'bg-slate-50 text-slate-500 border-slate-200' 
                                    : 'bg-white text-slate-400 border-transparent'
                                }`}>
                                {item.type === 'folder' ? (item.folderSubType || '目录') : (item.fileType?.toUpperCase() || '文件')}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-[13px] font-mono tracking-tighter">{item.date}</td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>
        </div>

        {/* Footer */}
        <div className="p-5 flex justify-between items-center bg-white border-t border-slate-50 shrink-0">
          <div className="text-[12px] text-slate-500">
             <span>已自动匹配并选中 <strong className="text-blue-600">{selectedIds.size}</strong> 个文件</span>
          </div>
          <div className="flex gap-4">
            <button 
                onClick={onClose} 
                className="w-32 h-10 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-all text-[14px]"
            >
                取消
            </button>
            <button 
                onClick={handleConfirmAction} 
                className="w-32 h-10 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-[14px]"
            >
                确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
