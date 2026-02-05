
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
  Map as MapIcon,
  Copy,
  Layers,
  Users,
  Edit2,
  EyeOff,
  ArrowLeft,
  Download,
  FileJson,
  FileCode,
  MoreHorizontal,
  Plus,
  Check,
  Info,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { ResourceItem, PublishedService } from '../types';
import { MOCK_RESOURCES } from '../services/mockApi';

export const DataResource: React.FC = () => {
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem('app_data_resources');
    return saved ? JSON.parse(saved) : MOCK_RESOURCES;
  });

  useEffect(() => {
    localStorage.setItem('app_data_resources', JSON.stringify(resources));
  }, [resources]);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pathStack, setPathStack] = useState<{id: string, name: string}[]>([
    { id: 'root', name: '我的输入数据' }
  ]);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [previewFile, setPreviewFile] = useState<ResourceItem | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // 发布状态管理
  const [publishingStatus, setPublishingStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [publishProgress, setPublishProgress] = useState(0);

  const [publishForm, setPublishForm] = useState({
    fileId: '',
    serviceName: '',
    style: 'Default',
    serviceType: 'WMTS'
  });

  const currentFolder = pathStack[pathStack.length - 1];

  const visibleItems = useMemo(() => {
    let items = resources.filter(item => item.parentId === currentFolder.id);
    if (searchQuery) {
      items = resources.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return items;
  }, [currentFolder.id, searchQuery, resources]);

  const handleEnterPreview = (item: ResourceItem) => {
    // 遥感影像类逻辑保留原有服务逻辑
    if (item.fileType === 'tif') {
        const services = [...(item.publishedServices || [])];
        if (services.length === 0) {
        services.push({
            id: 'virtual_direct_view',
            name: '临时直调预览图层',
            type: 'DIRECT',
            url: 'Local Cache Proxy',
            visible: true,
            createTime: '系统即时生成'
        });
        }
        const augmentedItem = { ...item, publishedServices: services };
        setPreviewFile(augmentedItem);
        setSelectedServiceId(services[0].id);
    } else {
        // 普通文件预览
        setPreviewFile(item);
    }
  };

  const handleExitPreview = () => {
    setPreviewFile(null);
    setSelectedServiceId(null);
  };

  const toggleServiceVisibility = (serviceId: string) => {
    if (!previewFile) return;
    
    const updatedServices = previewFile.publishedServices?.map(s => 
      s.id === serviceId ? { ...s, visible: !s.visible } : s
    );

    const updatedPreviewFile = { ...previewFile, publishedServices: updatedServices };
    setPreviewFile(updatedPreviewFile);

    setResources(prev => prev.map(r => 
      r.id === previewFile.id ? { ...r, publishedServices: updatedServices?.filter(s => s.id !== 'virtual_direct_view') } : r
    ));
  };

  const handleDeleteService = (serviceId: string) => {
    if (!previewFile) return;
    if (serviceId === 'virtual_direct_view') {
        alert('直连预览图层不可删除');
        return;
    }
    
    if (confirm('确定要删除该服务吗？')) {
        const updatedServices = previewFile.publishedServices?.filter(s => s.id !== serviceId);
        
        if (selectedServiceId === serviceId) {
            setSelectedServiceId(updatedServices?.[0]?.id || null);
        }

        const updatedPreviewFile = { ...previewFile, publishedServices: updatedServices };
        if (updatedServices?.length === 0) {
            updatedServices.push({
                id: 'virtual_direct_view',
                name: '临时直调预览图层',
                type: 'DIRECT',
                url: 'Local Cache Proxy',
                visible: true,
                createTime: '系统即时生成'
            });
            setSelectedServiceId('virtual_direct_view');
        }
        
        setPreviewFile(updatedPreviewFile);
        
        setResources(prev => prev.map(r => 
            r.id === previewFile.id ? { ...r, publishedServices: updatedServices.filter(s => s.id !== 'virtual_direct_view') } : r
        ));
    }
  };

  const handleItemClick = (item: ResourceItem) => {
    if (renamingId) return;
    if (item.type === 'folder') {
      setPathStack([...pathStack, { id: item.id, name: item.name }]);
      setSelectedId(null);
    } else {
      setSelectedId(item.id);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setPathStack(pathStack.slice(0, index + 1));
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newFiles: ResourceItem[] = Array.from(files).map((file: File, index) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let fileType: ResourceItem['fileType'] = undefined;
      if (extension === 'tif' || extension === 'tiff') fileType = 'tif';
      else if (extension === 'zip') fileType = 'zip';
      const sizeMB = file.size / (1024 * 1024);
      return {
        id: `upload-${Date.now()}-${index}`,
        name: file.name,
        parentId: currentFolder.id,
        type: 'file',
        fileType: fileType as any,
        size: sizeMB > 1024 ? `${(sizeMB / 1024).toFixed(2)}GB` : `${sizeMB.toFixed(2)}MB`,
        date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        publishedServices: []
      };
    });
    setResources(prev => [...prev, ...newFiles]);
  };

  const handleStartRename = (item: ResourceItem) => {
    setRenamingId(item.id);
    setRenameValue(item.name);
  };

  const handleSaveRename = () => {
    if (renamingId && renameValue.trim()) {
      setResources(prev => prev.map(item => item.id === renamingId ? { ...item, name: renameValue.trim() } : item));
    }
    setRenamingId(null);
  };

  const handleDownload = (item: ResourceItem) => {
    alert(`准备下载: ${item.name}`);
  };

  const handleOpenPublish = (item: ResourceItem) => {
    setPublishForm({
      fileId: item.id,
      serviceName: item.name.split('.')[0] + `_Svc`,
      style: 'Default',
      serviceType: 'WMTS'
    });
    setPublishingStatus('idle');
    setPublishProgress(0);
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = () => {
    if (publishingStatus === 'publishing') return;

    setPublishingStatus('publishing');
    setPublishProgress(0);

    const timer = setInterval(() => {
        setPublishProgress(prev => {
            if (prev >= 100) {
                clearInterval(timer);
                // 模拟发布结果，10%概率失败
                if (Math.random() > 0.1) {
                    setPublishingStatus('success');
                    const newService: PublishedService = {
                        id: `svc-${Date.now()}`,
                        name: publishForm.serviceName,
                        type: publishForm.serviceType,
                        url: `http://factory.os.com/service/${publishForm.serviceType.toLowerCase()}/${publishForm.fileId}`,
                        visible: true,
                        createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
                    };
                    setResources(prevRes => prevRes.map(item => {
                        if (item.id === publishForm.fileId) {
                            return {
                                ...item,
                                publishedServices: [newService, ...(item.publishedServices || [])]
                            };
                        }
                        return item;
                    }));
                } else {
                    setPublishingStatus('error');
                }
                return 100;
            }
            return prev + Math.floor(Math.random() * 20) + 5;
        });
    }, 400);
  };

  const getFileIcon = (item: ResourceItem, size: number = 24) => {
    if (item.type === 'folder') return <Folder size={size} fill="currentColor" strokeWidth={0} className="text-blue-400 opacity-80" />;
    switch (item.fileType) {
      case 'tif': return <FileImage size={size} className="text-blue-500" />;
      case 'zip': return <FileArchive size={size} className="text-indigo-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png': return <FileImage size={size} className="text-emerald-500" />;
      case 'json': return <FileJson size={size} className="text-amber-500" />;
      case 'xml': return <FileCode size={size} className="text-rose-500" />;
      case 'doc':
      case 'docx': return <FileText size={size} className="text-blue-600" />;
      case 'xls':
      case 'xlsx': return <FileSpreadsheet size={size} className="text-emerald-600" />;
      default: return <FileText size={size} className="text-slate-400" />;
    }
  };

  // 预览组件逻辑
  const FilePreviewer = () => {
    if (!previewFile) return null;

    const { fileType, name, content } = previewFile;
    const isImage = ['jpg', 'jpeg', 'png'].includes(fileType || '');
    const isText = ['txt', 'json', 'xml'].includes(fileType || '');
    const isOffice = ['doc', 'docx', 'xls', 'xlsx'].includes(fileType || '');
    const isTif = fileType === 'tif';

    // 如果是 TIF 影像，保持原有地图预览逻辑
    if (isTif) {
        const selectedService = previewFile.publishedServices?.find(s => s.id === selectedServiceId);
        return (
            <div className="flex-1 flex flex-col bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative h-full animate-in fade-in duration-300">
              <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/114.3,30.5,10,0/1280x1280?access_token=pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2tyY3R5aGZ4MDBwZTJ2b2M0eXJ5bnh4ayJ9.J6-gqgKq_8-y_8-y_8-y')`, filter: 'brightness(0.8)' }}></div>
              <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-20 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                  <button onClick={handleExitPreview} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"><ArrowLeft size={18} /></button>
                  <div className="text-white">
                    <h2 className="text-[16px] font-bold drop-shadow-md">{name}</h2>
                    <p className="text-[11px] opacity-70">遥感影像预览模式</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-20 left-6 w-[340px] bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden z-20 max-h-[calc(100%-180px)]">
                <div className="px-5 py-4 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
                  <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2"><Layers size={16} className="text-blue-600" /> 服务图层列表</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {previewFile.publishedServices?.map(service => (
                    <div 
                      key={service.id} 
                      onClick={() => setSelectedServiceId(service.id)} 
                      className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all border relative ${selectedServiceId === service.id ? 'bg-blue-50/80 border-blue-200 shadow-sm' : 'hover:bg-slate-50/80 border-transparent'}`}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleServiceVisibility(service.id); }}
                        className={`shrink-0 transition-colors ${service.visible ? 'text-blue-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        {service.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-bold truncate ${service.visible ? 'text-slate-800' : 'text-slate-400 italic'}`}>{service.name}</div>
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
                    <span className="text-[13px] font-mono text-slate-600 truncate">{selectedService?.url || '数据直连预览中...'}</span>
                    <button className="text-slate-400 hover:text-blue-600 text-[12px] font-bold bg-white px-2 py-1 rounded border shadow-sm transition-all" onClick={() => { navigator.clipboard.writeText(selectedService?.url || ''); alert('链接已复制'); }}><Copy size={12} /> 复制</button>
                  </div>
                </div>
              </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#F8FAFC] rounded-2xl shadow-2xl overflow-hidden relative h-full animate-in fade-in duration-300 border border-slate-200">
            {/* 通用预览头部 */}
            <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={handleExitPreview} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"><ArrowLeft size={18} /></button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">{getFileIcon(previewFile, 20)}</div>
                        <div>
                            <h2 className="text-[16px] font-bold text-slate-800 leading-tight">{name}</h2>
                            <p className="text-[11px] text-slate-400 font-medium">修改日期: {previewFile.date} • 大小: {previewFile.size}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 h-9 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-all flex items-center gap-2"><Download size={14} /> 下载文件</button>
                </div>
            </div>

            {/* 预览内容区 */}
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-white/50 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                
                {isImage && (
                    <div className="bg-white p-2 rounded-xl shadow-2xl border border-slate-100 max-w-4xl animate-in zoom-in duration-500">
                        <img src={content} alt={name} className="rounded-lg max-h-[70vh] object-contain shadow-inner" />
                    </div>
                )}

                {isText && (
                    <div className="w-full max-w-5xl bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh] animate-in slide-in-from-bottom-4 duration-500 border border-slate-700">
                        <div className="px-5 py-3 bg-[#0F172A] border-b border-slate-700 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono uppercase font-bold">{fileType} Editor</span>
                        </div>
                        <pre className="flex-1 p-6 text-[14px] text-emerald-400 font-mono overflow-auto custom-scrollbar leading-relaxed">
                            <code>{content}</code>
                        </pre>
                    </div>
                )}

                {isOffice && (
                    <div className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-2xl p-16 flex flex-col items-center text-center animate-in zoom-in duration-500">
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl ${fileType?.startsWith('doc') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {getFileIcon(previewFile, 48)}
                        </div>
                        <h3 className="text-[20px] font-black text-slate-800 mb-3 tracking-tight">{name}</h3>
                        <p className="text-slate-400 text-[14px] max-w-sm mb-10 leading-relaxed font-medium">
                            由于浏览器安全限制及文件协议复杂性，文档类资料不支持直接渲染，您可以点击下方按钮下载并在本地查看。
                        </p>
                        <div className="flex gap-4">
                            <button className="px-8 h-12 bg-blue-600 text-white rounded-xl font-bold text-[14px] shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"><Download size={16} /> 立即下载查看</button>
                            <button className="px-8 h-12 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-[14px] hover:bg-white transition-all flex items-center gap-2 active:scale-95"><FileCheck size={16} /> 标记为已阅</button>
                        </div>
                    </div>
                )}

                {/* 未识别类型回退 */}
                {!isImage && !isText && !isOffice && !isTif && (
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                        <AlertCircle size={64} className="opacity-10" />
                        <p className="font-bold">暂不支持此类型文件的预览</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  if (previewFile) {
      return <FilePreviewer />;
  }

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative h-full font-['Noto_Sans_SC']">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="h-[64px] px-6 flex items-center justify-between shrink-0 border-b border-slate-50 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full shadow-md shadow-blue-500/20"></div>
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">数据资源</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group mr-2">
              <input type="text" placeholder="搜索资源名称..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none" />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" />
            </div>
            <button className="h-9 px-4 flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50"><ArrowLeftRight size={14} /> 传输队列</button>
            <button onClick={handleUploadClick} className="h-9 px-4 flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[13px] font-bold hover:bg-blue-600 hover:text-white shadow-sm transition-all"><Upload size={14} /> 上传数据</button>
            <button onClick={() => setIsModalOpen(true)} className="h-9 px-6 bg-slate-800 text-white rounded-lg text-[13px] font-bold hover:bg-slate-900 shadow-lg active:scale-95 transition-all">添加目录</button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div onClick={() => setPathStack([{id: 'root', name: '我的输入数据'}])} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 cursor-pointer transition-all shadow-sm shrink-0">
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
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-bold cursor-pointer transition-all whitespace-nowrap
                        ${isLast 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 rounded-md' 
                          : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}
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
                <tr key={item.id} onClick={() => handleItemClick(item)} className="hover:bg-blue-50/40 transition-all group cursor-pointer">
                  <td className="px-6 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" onClick={(e) => e.stopPropagation()} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(item)}
                      {renamingId === item.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input 
                            autoFocus
                            type="text" 
                            value={renameValue} 
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                            className="h-8 px-2 border border-blue-500 rounded outline-none text-[13px] w-48"
                          />
                          <button onClick={handleSaveRename} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"><Check size={14} /></button>
                          <button onClick={() => setRenamingId(null)} className="p-1 bg-slate-100 text-slate-400 rounded hover:bg-slate-200"><X size={14} /></button>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.name}</span>
                      )}
                      {item.publishedServices && item.publishedServices.length > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-600 font-bold border border-emerald-200">已发布 ({item.publishedServices.length})</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[13px]">{item.size || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[12px] font-medium border ${item.type === 'folder' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white text-slate-400 border-transparent uppercase'}`}>{item.type === 'folder' ? '目录' : (item.fileType || '文件')}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[13px]">{item.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      {item.type === 'folder' ? (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }} className="text-slate-400 hover:text-blue-600" title="下载"><Download size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleStartRename(item); }} className="text-slate-400 hover:text-blue-600" title="重命名"><Edit2 size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleEnterPreview(item); }} className="text-blue-600 hover:text-blue-800" title="预览"><Eye size={16} /></button>
                          {(item.fileType === 'tif' || item.fileType === 'shp') && (
                            <button onClick={(e) => { e.stopPropagation(); handleOpenPublish(item); }} className="text-slate-400 hover:text-blue-600" title="发布新服务"><CloudUpload size={16} /></button>
                          )}
                          {item.fileType === 'zip' && <button onClick={(e) => e.stopPropagation()} className="text-indigo-500 hover:text-indigo-700" title="解压"><ArchiveRestore size={16} /></button>}
                        </>
                      )}
                      <button className="text-slate-400 hover:text-rose-500" title="删除" onClick={(e) => e.stopPropagation()}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-50 bg-white flex items-center justify-between shrink-0">
          <div className="text-[13px] text-slate-500 font-bold">共 {visibleItems.length} 条数据</div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:text-blue-600"><ChevronLeft size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded text-[12px] font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:text-blue-600"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      {/* 发布服务数据对话框 */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <CloudUpload size={20} className="text-blue-600" />
                <h3 className="text-[16px] font-bold text-slate-800">发布服务数据</h3>
              </div>
              <button 
                onClick={() => {
                    if (publishingStatus === 'publishing') return;
                    setIsPublishModalOpen(false);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 min-h-[200px] flex flex-col">
              {publishingStatus === 'idle' ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                      <span className="text-rose-500">*</span> 服务名称
                    </label>
                    <input 
                      type="text" 
                      value={publishForm.serviceName}
                      onChange={(e) => setPublishForm({...publishForm, serviceName: e.target.value})}
                      className="w-full h-10 px-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[13px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">样式文件</label>
                      <div className="relative">
                        <select 
                          value={publishForm.style}
                          onChange={(e) => setPublishForm({...publishForm, style: e.target.value})}
                          className="w-full h-10 pl-3 pr-8 appearance-none bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500"
                        >
                          <option value="Default">Default (系统默认)</option>
                          <option value="Terrain">Terrain (地形渲染)</option>
                          <option value="Vegetation">Vegetation (植被增强)</option>
                          <option value="Infrared">Infrared (红外波段)</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-700">服务类型</label>
                      <div className="relative">
                        <select 
                          value={publishForm.serviceType}
                          onChange={(e) => setPublishForm({...publishForm, serviceType: e.target.value})}
                          className="w-full h-10 pl-3 pr-8 appearance-none bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500"
                        >
                          <option value="WMTS">WMTS (瓦片服务)</option>
                          <option value="TMS">TMS (标准切片)</option>
                          <option value="WMS">WMS (动态渲染)</option>
                          <option value="WFS">WFS (矢量要素)</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <Info size={18} className="text-blue-600 shrink-0" />
                    <p className="text-[12px] text-blue-700/80 leading-relaxed font-medium">
                      发布后，该数据将自动构建时空索引，支持直接在地图视图中加载浏览。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                            publishingStatus === 'publishing' ? 'bg-blue-50' : 
                            publishingStatus === 'success' ? 'bg-emerald-50' : 'bg-rose-50'
                        }`}>
                            {publishingStatus === 'publishing' && <Loader2 size={40} className="text-blue-600 animate-spin" />}
                            {publishingStatus === 'success' && <CheckCircle2 size={40} className="text-emerald-600 animate-in zoom-in duration-300" />}
                            {publishingStatus === 'error' && <XCircle size={40} className="text-rose-600 animate-in zoom-in duration-300" />}
                        </div>
                        {publishingStatus === 'publishing' && (
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600/10 border-t-blue-600 animate-spin" />
                        )}
                    </div>
                    
                    <div className="w-full space-y-4 text-center">
                        <div className="flex justify-between items-end px-1">
                            <span className={`text-[15px] font-bold ${
                                publishingStatus === 'publishing' ? 'text-blue-600' :
                                publishingStatus === 'success' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                                {publishingStatus === 'publishing' ? '正在发布服务数据...' : 
                                 publishingStatus === 'success' ? '服务发布成功' : '服务发布失败'}
                            </span>
                            <span className="text-[14px] font-mono font-bold text-slate-400">{publishProgress}%</span>
                        </div>
                        
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 rounded-full ${
                                    publishingStatus === 'error' ? 'bg-rose-500' : 
                                    publishingStatus === 'success' ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${publishProgress}%` }}
                            />
                        </div>

                        {publishingStatus === 'error' && (
                            <p className="text-[12px] text-rose-500 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center gap-2">
                                <AlertCircle size={14} /> 系统处理异常，请检查网络连接或稍后再试。
                            </p>
                        )}
                    </div>
                </div>
              )}
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
               {publishingStatus === 'idle' && (
                   <>
                    <button 
                        onClick={() => setIsPublishModalOpen(false)} 
                        className="px-6 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all text-[13px]"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleConfirmPublish} 
                        className="px-8 h-10 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-[13px]"
                    >
                        开始发布
                    </button>
                   </>
               )}
               {publishingStatus === 'success' && (
                   <>
                    <button 
                        onClick={() => {
                            setPublishingStatus('idle');
                            setPublishProgress(0);
                        }} 
                        className="px-6 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all text-[13px]"
                    >
                        发布另一个
                    </button>
                    <button 
                        onClick={() => setIsPublishModalOpen(false)} 
                        className="px-8 h-10 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-[13px]"
                    >
                        完成
                    </button>
                   </>
               )}
               {publishingStatus === 'error' && (
                   <>
                    <button 
                        onClick={() => setIsPublishModalOpen(false)} 
                        className="px-6 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all text-[13px]"
                    >
                        关闭
                    </button>
                    <button 
                        onClick={() => {
                            setPublishingStatus('idle');
                            setPublishProgress(0);
                            handleConfirmPublish();
                        }} 
                        className="px-8 h-10 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-[13px]"
                    >
                        重试
                    </button>
                   </>
               )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl p-6">
             <h3 className="text-[16px] font-bold mb-4">新建目录</h3>
             <input type="text" placeholder="输入目录名称" className="w-full h-10 px-3 border rounded-lg mb-6 outline-none focus:border-blue-500" />
             <div className="flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button>
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">确定</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
