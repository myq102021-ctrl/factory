
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Upload, 
  Folder, 
  Link as LinkIcon, 
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  RefreshCcw,
  Grid,
  List,
  FileImage,
  FileArchive,
  FileText,
  Eye,
  Trash2,
  X,
  CloudUpload,
  ArchiveRestore,
  Globe,
  Map,
  Copy,
  Layers,
  Users,
  Edit2,
  EyeOff,
  ArrowLeft,
  Download,
  FileJson,
  FileCode,
  Plus
} from 'lucide-react';
import { ResourceItem, PublishedService } from '../types';

const INITIAL_MOCK_PRODUCT_FILES: ResourceItem[] = [
  { id: 'task1', name: '任务1输出_土地利用分类', parentId: 'root', type: 'folder', folderSubType: 'normal', date: '2025-05-15 14:30:00' },
  { id: 't1_f1', name: 'LUCC_Classification_2025.tif', parentId: 'task1', type: 'file', fileType: 'tif', size: '256MB', date: '2025-05-15 14:35:00', publishedServices: [] },
  { id: 't1_f2', name: 'Statistics_Report.json', parentId: 'task1', type: 'file', fileType: 'json', size: '12KB', date: '2025-05-15 14:35:05' },
];

export const DataProduct: React.FC = () => {
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem('app_data_products');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_PRODUCT_FILES;
  });

  useEffect(() => {
    localStorage.setItem('app_data_products', JSON.stringify(resources));
  }, [resources]);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pathStack, setPathStack] = useState<{id: string, name: string}[]>([
    { id: 'root', name: '我的输出数据' }
  ]);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [previewFile, setPreviewFile] = useState<ResourceItem | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const currentFolder = pathStack[pathStack.length - 1];

  const visibleItems = useMemo(() => {
    let items = resources.filter(item => item.parentId === currentFolder.id);
    if (searchQuery) items = resources.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  }, [currentFolder.id, searchQuery, resources]);

  const handleEnterPreview = (item: ResourceItem) => {
    const services = [...(item.publishedServices || [])];
    if (services.length === 0) {
      services.push({
        id: 'product_direct_view',
        name: '产品直连预览',
        type: 'DIRECT',
        url: 'Data Product Link',
        visible: true,
        createTime: '系统即时生成'
      });
    }
    const augmentedItem = { ...item, publishedServices: services };
    setPreviewFile(augmentedItem);
    setSelectedServiceId(services[0].id);
  };

  const handleExitPreview = () => {
    setPreviewFile(null);
    setSelectedServiceId(null);
  };

  const getFileIcon = (item: ResourceItem, size: number = 24) => {
    if (item.type === 'folder') return <Folder size={size} fill="currentColor" strokeWidth={0} className="text-emerald-400 opacity-80" />;
    switch (item.fileType) {
      case 'tif': return <FileImage size={size} className="text-blue-500" />;
      default: return <FileText size={size} className="text-slate-400" />;
    }
  };

  if (previewFile) {
    const selectedService = previewFile.publishedServices?.find(s => s.id === selectedServiceId);
    return (
        <div className="flex-1 flex flex-col bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative h-full animate-in fade-in duration-300">
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/114.3,30.5,10,0/1280x1280?access_token=pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2tyY3R5aGZ4MDBwZTJ2b2M0eXJ5bnh4ayJ9.J6-gqgKq_8-y_8-y_8-y')`, filter: 'brightness(0.8)' }}></div>
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-20 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                    <button onClick={handleExitPreview} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"><ArrowLeft size={18} /></button>
                    <div className="text-white">
                        <h2 className="text-[16px] font-bold drop-shadow-md">{previewFile.name}</h2>
                        <p className="text-[11px] opacity-70">数据产品预览模式</p>
                    </div>
                </div>
                <button className="px-4 h-9 bg-blue-600/90 backdrop-blur-sm hover:bg-blue-600 text-white rounded-lg text-[13px] font-bold shadow-lg flex items-center gap-2 transition-all"><CloudUpload size={16} /> 发布新服务</button>
            </div>
            <div className="absolute top-20 left-6 w-[320px] bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden z-20 max-h-[calc(100%-180px)]">
                <div className="px-5 py-4 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
                    <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2"><Layers size={16} className="text-blue-600" /> 服务列表</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {previewFile.publishedServices?.map(service => (
                        <div key={service.id} onClick={() => setSelectedServiceId(service.id)} className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all border ${selectedServiceId === service.id ? 'bg-blue-50/80 border-blue-200 shadow-sm' : 'hover:bg-slate-50/80 border-transparent'}`}>
                            <div className={service.visible ? 'text-blue-600' : 'text-slate-300'}><Eye size={16} /></div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-bold truncate">{service.name}</div>
                                <div className="text-[10px] text-slate-400 uppercase">{service.type} • {service.createTime}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><Globe size={20} /></div>
                    <div className="flex-1 bg-slate-50/80 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between group">
                        <span className="text-[13px] font-mono text-slate-600 truncate">{selectedService?.url || '产品直通加载中...'}</span>
                        <button className="text-slate-400 hover:text-blue-600 text-[12px] font-bold bg-white px-2 py-1 rounded border shadow-sm transition-all"><Copy size={12} /> 复制</button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative h-full">
      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="h-[64px] px-6 flex items-center justify-between shrink-0 border-b border-slate-50 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full shadow-md shadow-blue-500/20"></div>
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">数据产品</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group mr-2">
              <input type="text" placeholder="搜索产品名称..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none" />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" />
            </div>
            <button className="h-9 px-4 flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50"><ArrowLeftRight size={14} /> 传输队列</button>
            <button className="h-9 px-4 flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[13px] font-bold hover:bg-blue-600 hover:text-white shadow-sm transition-all"><Upload size={14} /> 上传产品</button>
            <button className="h-9 px-6 bg-slate-800 text-white rounded-lg text-[13px] font-bold hover:bg-slate-900 shadow-lg active:scale-95 transition-all">添加目录</button>
          </div>
        </div>

        {/* 升级版面包屑导航 - 匹配截图 */}
        <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div onClick={() => setPathStack([{id: 'root', name: '我的输出数据'}])} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 cursor-pointer transition-all shadow-sm shrink-0">
              <Home size={16} />
            </div>
            <ChevronRight size={14} className="text-slate-300 shrink-0" />
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {pathStack.map((item, index) => {
                const isLast = index === pathStack.length - 1;
                return (
                  <React.Fragment key={item.id}>
                    {index > 0 && <ChevronRight size={14} className="text-slate-300 mx-0.5 shrink-0" />}
                    <div 
                      onClick={() => setPathStack(pathStack.slice(0, index + 1))}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-bold cursor-pointer transition-all whitespace-nowrap
                        ${isLast 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 rounded-md' 
                          : 'text-slate-500 hover:text-blue-600'}
                      `}
                    >
                      {!isLast && <Folder size={14} className="text-slate-300" />}
                      {item.name}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
             <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all"><RefreshCcw size={16} /></button>
             <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200/50">
               <button onClick={() => setViewMode('grid')} className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><Grid size={14} /></button>
               <button onClick={() => setViewMode('list')} className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><List size={14} /></button>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/20">
          <table className="w-full text-left text-[14px] border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3.5 w-14"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></th>
                <th className="px-6 py-3.5">名称</th>
                <th className="px-6 py-3.5">大小</th>
                <th className="px-6 py-3.5">文件夹类型</th>
                <th className="px-6 py-3.5">修改日期</th>
                <th className="px-6 py-3.5 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleItems.map((item) => (
                <tr key={item.id} onClick={() => item.type === 'folder' && setPathStack([...pathStack, {id: item.id, name: item.name}])} className="hover:bg-blue-50/40 transition-all group cursor-pointer">
                  <td className="px-6 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" onClick={(e) => e.stopPropagation()} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(item)}
                      <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[13px]">{item.size || '-'}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{item.type === 'folder' ? '成果目录' : '成果数据'}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[13px]">{item.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      {item.fileType === 'tif' && (
                        <button onClick={(e) => { e.stopPropagation(); handleEnterPreview(item); }} className="text-blue-600 hover:text-blue-800" title="预览"><Eye size={16} /></button>
                      )}
                      <button onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-blue-600" title="发布"><CloudUpload size={16} /></button>
                      <button className="text-slate-400 hover:text-rose-500" title="删除"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-50 bg-white flex items-center justify-between shrink-0">
          <div className="text-[13px] text-slate-500 font-bold">共 {visibleItems.length} 条</div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:text-blue-600"><ChevronLeft size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded text-[12px] font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:text-blue-600"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};
