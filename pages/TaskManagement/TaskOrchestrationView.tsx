import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, XCircle, Save, Send, Box, PlayCircle, 
  Square, ChevronDown, ChevronUp, Link2, Info, ChevronRight,
  Database, Zap, Layers, Layout, ScanLine, Wheat, Sprout, Activity,
  BarChart3, Grid, CloudSun, Droplets, Share2, Cloud, AlertCircle,
  Edit3, RefreshCw, PlusCircle, MinusCircle, Maximize2,
  X, List, Settings2, Copy, ClipboardCheck,
  MousePointer2, Hand, RotateCcw, Settings, Timer,
  CheckCircle2, CheckSquare
} from 'lucide-react';
import { ProductionLine, ResourceItem, Connection, ParamMapping } from '../../types';
import { ImportPipelineModal } from './ImportPipelineModal';
import { ParameterMappingPanel } from '../../components/ParameterMappingPanel';
import { DataResourceSelector } from '../../components/DataResourceSelector';
import { SatelliteConfigSelectionModal } from '../../components/SatelliteConfigSelectionModal';
import { CronGeneratorModal } from '../../components/CronGeneratorModal';
import { ALGO_CONFIG_MAP } from '../../constants';
import { MockApi } from '../../services/mockApi';

interface Props {
  initialPipeline: ProductionLine;
  onBack: () => void;
  onSubmit: (taskName: string) => void;
}

interface NodePos {
  x: number;
  y: number;
}

interface CanvasNode {
  id: string;
  name: string;
  icon: React.ReactNode;
  iconKey: string;
  type: 'start' | 'end' | 'process';
  pos: NodePos;
  description?: string;
  params?: Record<string, any>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'PlayCircle': <PlayCircle size={28} className="text-blue-600" />,
  'Square': <Square size={24} className="text-blue-600 fill-blue-600/10" />,
  'Database': <Database size={32} className="text-blue-600" />,
  'Zap': <Zap size={32} className="text-blue-600" />,
  'Layers': <Layers size={32} className="text-blue-600" />,
  'Layout': <Layout size={32} className="text-blue-600" />,
  'ScanLine': <ScanLine size={32} className="text-blue-600" />,
  'Wheat': <Wheat size={32} className="text-blue-600" />,
  'Sprout': <Sprout size={32} className="text-blue-600" />,
  'Activity': <Activity size={32} className="text-blue-600" />,
  'BarChart3': <BarChart3 size={32} className="text-blue-600" />,
  'Grid': <Grid size={32} className="text-blue-600" />,
  'CloudSun': <CloudSun size={32} className="text-blue-600" />,
  'Droplets': <Droplets size={32} className="text-blue-600" />,
  'Share2': <Share2 size={32} className="text-blue-600" />,
  'Cloud': <Cloud size={32} className="text-blue-600" />,
  'RotateCcw': <RotateCcw size={32} className="text-blue-600" />
};

export const TaskOrchestrationView: React.FC<Props> = ({ initialPipeline, onBack, onSubmit }) => {
  const [currentPipeline, setCurrentPipeline] = useState<ProductionLine>(initialPipeline);
  const [taskName, setTaskName] = useState(`[任务]_[${new Date().toISOString().slice(0,19).replace(/[-T:]/g,'')}]`);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isPropertiesVisible, setIsPropertiesVisible] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isOutputSelectorOpen, setIsOutputSelectorOpen] = useState(false);
  const [isCronModalOpen, setIsCronModalOpen] = useState(false);
  const [activeTabs, setActiveTabs] = useState<string[]>(['params']);
  
  // 另存为新产线弹窗状态
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [saveAndSubmitMode, setSaveAndSubmitMode] = useState(false); // 是否处于“另存并提交”模式
  const [saveAsFormData, setSaveAsFormData] = useState({
    name: '',
    code: '',
    type: '',
    owner: 'admin',
    desc: '',
    tag: ''
  });

  const [taskConfig, setTaskConfig] = useState({
    name: taskName,
    outputPath: '',
    taskType: 'once',
    cron: '* * * * * ?',
    errorStrategy: 'stop',
    alarmType: 'system'
  });

  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState<NodePos>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<NodePos>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePos>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<NodePos>({ x: 0, y: 0 });
  const [activeModal, setActiveModal] = useState<'none' | 'fileSelect' | 'matchConfig' | 'matchedFullscreen'>('none');
  const [activeParam, setActiveParam] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (!taskConfig.outputPath) {
        setTaskConfig(prev => ({ ...prev, outputPath: taskName + '_成果' }));
    }
  }, [taskName]);

  const handleLibraryDragStart = (e: React.DragEvent, item: { name: string, iconKey: string }) => {
    e.dataTransfer.setData('nodeName', item.name);
    e.dataTransfer.setData('iconKey', item.iconKey);
  };

  const initWorkflow = (pipeline: ProductionLine) => {
    if (pipeline.canvasData && pipeline.canvasData.nodes.length > 0) {
      setNodes(pipeline.canvasData.nodes.map(n => ({
        ...n,
        icon: ICON_MAP[n.iconKey] || <Box size={32} className="text-blue-600" />
      })));
      setConnections(pipeline.canvasData.connections || []);
    } else {
      const labels = ['开始', '云盘数据输入', '影像裁剪', '服务发布', '结束'];
      const iconKeys = ['PlayCircle', 'Cloud', 'Layout', 'Share2', 'Square'];
      const generatedNodes: CanvasNode[] = labels.map((label, i) => ({
          id: `node-${Date.now()}-${i}`,
          name: label,
          type: label === '开始' ? 'start' : label === '结束' ? 'end' : 'process',
          iconKey: iconKeys[i],
          icon: ICON_MAP[iconKeys[i]],
          pos: { x: 100 + i * 180, y: 300 },
          params: {}
      }));
      const generatedConns: Connection[] = [];
      for (let i = 0; i < generatedNodes.length - 1; i++) {
        generatedConns.push({ id: `conn-${Date.now()}-${i}`, fromId: generatedNodes[i].id, toId: generatedNodes[i+1].id });
      }
      setNodes(generatedNodes);
      setConnections(generatedConns);
    }
  };

  const categories = [
    {
      title: '输入节点',
      items: [
          { name: '数据采集', icon: <Database size={24} className="text-blue-500" />, iconKey: 'Database' },
          { name: '云盘数据输入', icon: <Cloud size={24} className="text-blue-500" />, iconKey: 'Cloud' }
      ]
    },
    {
      title: '处理节点',
      items: [
        { name: '波段合成', icon: <Zap size={24} className="text-blue-500" />, iconKey: 'Zap' },
        { name: '影像镶嵌', icon: <Layers size={24} className="text-blue-500" />, iconKey: 'Layers' },
        { name: '影像裁剪', icon: <Layout size={24} className="text-blue-500" />, iconKey: 'Layout' }
      ]
    }
  ];

  useEffect(() => {
    initWorkflow(initialPipeline);
  }, [initialPipeline]);

  const getConnectionPath = (fromNode: CanvasNode, toNode: CanvasNode) => {
    const startX = fromNode.pos.x + 96; 
    const startY = fromNode.pos.y + 48; 
    const endX = toNode.pos.x;
    const endY = toNode.pos.y + 48;
    const cpX = startX + (endX - startX) / 2;
    return `M ${startX} ${startY} C ${cpX} ${startY}, ${cpX} ${endY}, ${endX} ${endY}`;
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    setSelectedConnectionId(null);
    setIsPropertiesVisible(true);
    const node = nodes.find(n => n.id === id);
    if (!node || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingNodeId(id);
    setDragOffset({
      x: (e.clientX - rect.left - canvasOffset.x) / zoom - node.pos.x,
      y: (e.clientY - rect.top - canvasOffset.y) / zoom - node.pos.y
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    if (draggingNodeId) {
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, pos: { x: (x - canvasOffset.x) / zoom - dragOffset.x, y: (y - canvasOffset.y) / zoom - dragOffset.y } } : n));
    } else if (isPanning) {
      setCanvasOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const onMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nodeName = e.dataTransfer.getData('nodeName');
    const iconKey = e.dataTransfer.getData('iconKey');
    if (!nodeName || !iconKey) return;
    const dropX = (e.clientX - rect.left - canvasOffset.x) / zoom - 48;
    const dropY = (e.clientY - rect.top - canvasOffset.y) / zoom - 48;
    const newNode: CanvasNode = {
      id: `task-node-${Date.now()}`,
      name: `${nodeName}*`,
      icon: ICON_MAP[iconKey] || <Box size={32} className="text-blue-600" />,
      iconKey: iconKey,
      type: 'process',
      pos: { x: dropX, y: dropY },
      description: `这是${nodeName}任务实例节点。`,
      params: {}
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setIsPropertiesVisible(true);
  };

  const handleOpenBrowse = (paramLabel: string) => {
      setActiveParam(paramLabel);
      setActiveModal('fileSelect');
  };

  const handleOpenMatch = (paramLabel: string) => {
      setActiveParam(paramLabel);
      setActiveModal('matchConfig');
  };

  const handleMatchConfirm = async (ids: string[]) => {
    if (!selectedNodeId || !selectedNode) return;
    setActiveModal('none');
    const path = selectedNode.params?.inputPath;
    if (!path) {
        alert('请先指定输入路径');
        return;
    }
    try {
        const results = await MockApi.matchResourcesByConfigs(path, ids);
        handleParamChange('matchedFiles', results);
        handleParamChange('ruleIds', ids);
    } catch (e) {
        alert('匹配失败');
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedConnection = connections.find(c => c.id === selectedConnectionId);
  const sourceNodeOfConnection = selectedConnection ? nodes.find(n => n.id === selectedConnection.fromId) : null;
  const targetNodeOfConnection = selectedConnection ? nodes.find(n => n.id === selectedConnection.toId) : null;

  const handleParamChange = (key: string, value: any) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, params: { ...n.params, [key]: value } } : n));
  };

  // --- 逻辑整合：打开新增产线弹窗 ---
  const handleOpenSaveAsModal = (isSubmit: boolean = false) => {
    const YYYYMMDD = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    setSaveAsFormData({
        name: `产线_${YYYYMMDD}${randomSuffix}`,
        code: `pipline_${Math.random().toString(36).substr(2, 6)}`,
        type: currentPipeline.type || '数据处理产线',
        owner: 'admin',
        desc: currentPipeline.description || '',
        tag: ''
    });
    setSaveAndSubmitMode(isSubmit);
    setIsSaveAsModalOpen(true);
  };

  const handleConfirmSaveAs = () => {
    if (!saveAsFormData.name || !saveAsFormData.code || !saveAsFormData.type) {
        alert('请填写必填项');
        return;
    }

    const newPipeline: ProductionLine = {
      id: `pl-${Date.now()}`,
      name: saveAsFormData.name,
      code: saveAsFormData.code,
      version: 'V' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      type: saveAsFormData.type,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: '启用',
      creator: saveAsFormData.owner === 'admin' ? '系统管理员' : '操作员',
      description: saveAsFormData.desc,
      canvasData: { 
        nodes: nodes.map(n => ({ ...n, icon: undefined })), 
        connections 
      }
    };

    // 1. 保存产线
    const savedLines = localStorage.getItem('production_list');
    const list = savedLines ? JSON.parse(savedLines) : [];
    localStorage.setItem('production_list', JSON.stringify([newPipeline, ...list]));
    
    setIsSaveAsModalOpen(false);

    // 2. 如果是另存并提交，则同时创建任务
    if (saveAndSubmitMode) {
      const newTask = {
        id: `task_${Date.now()}`,
        name: taskConfig.name,
        type: taskConfig.taskType === 'timer' ? '定时任务' : '一次性任务',
        source: saveAsFormData.name, // 关联新产线名称
        status: '进行中',
        start: new Date().toISOString().slice(0, 19).replace('T', ' '),
        end: '-',
        outputPath: taskConfig.outputPath,
        errorStrategy: taskConfig.errorStrategy,
        alarmType: taskConfig.alarmType,
        cycle: taskConfig.taskType === 'timer' ? taskConfig.cron : undefined,
        nextRun: taskConfig.taskType === 'timer' ? '2026-02-05 10:00:00' : undefined
      };
      const savedTasks = localStorage.getItem('app_tasks');
      const currentTasks = savedTasks ? JSON.parse(savedTasks) : [];
      localStorage.setItem('app_tasks', JSON.stringify([newTask, ...currentTasks]));
      
      alert(`产线 "${saveAsFormData.name}" 已保存，且任务 "${taskConfig.name}" 已成功提交！`);
      onSubmit(taskConfig.name); // 跳转回任务中心
    } else {
      alert(`产线 "${saveAsFormData.name}" 已成功另存为正式产线！`);
    }
  };

  const handleSaveAndSubmit = () => {
    const saved = localStorage.getItem('production_list');
    if (saved) {
      const list = JSON.parse(saved);
      const updatedList = list.map((p: ProductionLine) => 
        p.id === currentPipeline.id ? { ...p, canvasData: { nodes: nodes.map(n => ({ ...n, icon: undefined })), connections } } : p
      );
      localStorage.setItem('production_list', JSON.stringify(updatedList));
    }
    onSubmit(taskConfig.name);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in duration-500 overflow-hidden font-['Noto_Sans_SC']">
      <div className="h-[64px] bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group border-b border-slate-100 pb-0.5 min-w-[100px] hover:border-blue-400 transition-colors">
              <div className="relative inline-grid items-center">
                <span className="invisible whitespace-pre text-[20px] font-bold px-1 col-start-1 row-start-1">{taskConfig.name || "任务名称"}</span>
                <input 
                  type="text" 
                  value={taskConfig.name} 
                  onChange={(e) => setTaskConfig({...taskConfig, name: e.target.value})}
                  placeholder="任务名称"
                  className="absolute inset-0 w-full text-[20px] font-bold text-slate-800 bg-transparent focus:outline-none col-start-1 row-start-1 px-1"
                />
              </div>
              <Edit3 size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
            </div>
            <span className="px-2.5 py-1 bg-[#eff6ff] text-[#2563eb] text-[12px] font-bold rounded border border-blue-100 shadow-sm shrink-0">任务编排模式</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-4 h-[36px] flex items-center gap-2 bg-rose-50 text-rose-600 rounded-lg text-[14px] font-semibold hover:bg-rose-100 border border-rose-100 transition-colors"><XCircle size={16} /> 关闭</button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <button onClick={() => setIsImportModalOpen(true)} className="px-4 h-[36px] flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[14px] font-semibold hover:bg-slate-50 transition-colors"><Link2 size={16} className="text-blue-500" /> 导入产线</button>
          <button onClick={() => setIsConfigModalOpen(true)} className="px-4 h-[36px] flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[14px] font-semibold hover:bg-slate-50 transition-colors"><Settings2 size={16} className="text-blue-500" /> 任务配置</button>
          
          <button onClick={() => handleOpenSaveAsModal(false)} className="px-4 h-[36px] flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[14px] font-semibold hover:bg-slate-50 transition-colors">
            <Copy size={16} className="text-indigo-500" /> 另存为新产线
          </button>
          
          <button onClick={() => handleOpenSaveAsModal(true)} className="px-4 h-[36px] flex items-center gap-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-[14px] font-bold hover:bg-blue-50 transition-colors shadow-sm">
            <ClipboardCheck size={16} className="text-blue-600" /> 另存新产线并提交任务
          </button>
          
          <button onClick={() => onSubmit(taskConfig.name)} className="px-6 h-[36px] flex items-center gap-2 bg-blue-600 text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"><Send size={16} /> 提交</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-[240px] bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800">
            <Box size={18} className="text-blue-600" /> 算法/工具库
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <h4 className="text-[13px] font-bold text-slate-400 mb-4 tracking-wide uppercase">{cat.title}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {cat.items.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex flex-col items-center group cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleLibraryDragStart(e, item as any)}
                    >
                      <div className="w-16 h-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center group-hover:border-blue-400 group-hover:shadow-md transition-all shadow-sm">
                        {item.icon}
                      </div>
                      <span className="mt-2 text-[12px] text-slate-600 font-medium group-hover:text-blue-600 transition-colors text-center leading-tight w-full px-1">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div 
          ref={canvasRef}
          className={`flex-1 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onCanvasDrop}
          onClick={() => { setSelectedNodeId(null); setSelectedConnectionId(null); setIsPropertiesVisible(false); }}
        >
          <div className="canvas-background absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1.5px, transparent 1.5px)', backgroundSize: `${24 * zoom}px ${24 * zoom}px`, backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px` }} />
          
          <div className="absolute top-4 left-6 flex items-center gap-3 z-10 select-none">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
               <Box size={16} className="text-slate-800" />
               <span className="text-[13px] font-black text-slate-800">任务执行编排画布</span>
            </div>
            
            <div className="flex items-center bg-white/80 backdrop-blur-md border border-slate-200 p-1 rounded-xl shadow-sm">
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-500 border-r border-slate-100">
                 <MousePointer2 size={12} className="text-blue-500" />
                 <span>拖拽节点构建</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-500 border-r border-slate-100">
                 <Settings size={12} className="text-indigo-500" />
                 <span>配置实例参数</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-500 border-r border-slate-100">
                 <Link2 size={12} className="text-emerald-500" />
                 <span>连线映射数据</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                 <Hand size={12} />
                 <span>按住背景平移</span>
               </div>
            </div>
          </div>

          <div className="absolute top-4 right-6 flex items-center gap-1 z-10">
             <button title="复位" onClick={() => {setZoom(1); setCanvasOffset({x:0,y:0})}} className="w-8 h-8 flex items-center justify-center rounded border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm"><RefreshCw size={16}/></button>
             <button title="放大" onClick={() => setZoom(z => Math.min(z+0.1, 2))} className="w-8 h-8 flex items-center justify-center rounded border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm"><PlusCircle size={16}/></button>
             <button title="缩小" onClick={() => setZoom(z => Math.max(z-0.1, 0.5))} className="w-8 h-8 flex items-center justify-center rounded border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm"><MinusCircle size={16}/></button>
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            <svg className="absolute inset-0 w-[5000px] h-[5000px] z-0 pointer-events-none overflow-visible">
              {connections.map(conn => {
                const from = nodes.find(n => n.id === conn.fromId);
                const to = nodes.find(n => n.id === conn.toId);
                if (!from || !to) return null;
                const isSelected = selectedConnectionId === conn.id;
                const startX = from.pos.x + 96;
                const startY = from.pos.y + 48;
                const endX = to.pos.x;
                const endY = to.pos.y + 48;
                const cpX = startX + (endX - startX) / 2;
                const midY = (startY + endY) / 2;
                return (
                  <g key={conn.id} className="pointer-events-auto cursor-pointer group/line">
                    <path 
                        d={getConnectionPath(from, to)} 
                        fill="none" 
                        stroke={isSelected ? "#3B82F6" : "#cbd5e1"} 
                        strokeWidth={2.5 / zoom} 
                        className="transition-all hover:stroke-blue-400" 
                        onClick={(e) => { e.stopPropagation(); setSelectedConnectionId(conn.id); setSelectedNodeId(null); setIsPropertiesVisible(true); }} 
                    />
                    <text 
                        x={cpX} 
                        y={midY - 12 / zoom} 
                        textAnchor="middle" 
                        className={`font-bold select-none pointer-events-none transition-all duration-300 ${
                          isSelected ? 'fill-blue-600' : 'fill-slate-400 opacity-40'
                        }`}
                        style={{ fontSize: `${12 / zoom}px` }}
                    >
                        传参设置
                    </text>
                  </g>
                );
              })}
            </svg>
            {nodes.map(node => (
              <div key={node.id} className="absolute pointer-events-auto cursor-pointer flex flex-col items-center gap-2 group z-10 select-none" style={{ left: node.pos.x, top: node.pos.y }} onMouseDown={(e) => onNodeMouseDown(e, node.id)} onClick={(e) => e.stopPropagation()}>
                <div className={`w-24 h-24 flex items-center justify-center rounded-2xl relative transition-all duration-200 border-2 ${selectedNodeId === node.id ? 'border-blue-500 bg-white ring-4 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white border-slate-100 shadow-sm hover:border-blue-300'}`}>
                  <div className={`w-14 h-14 bg-white border border-slate-50 rounded-xl flex items-center justify-center shadow-inner transition-colors ${selectedNodeId === node.id ? 'bg-blue-50/20' : 'group-hover:bg-blue-50/20'}`}>{node.icon}</div>
                </div>
                <span className={`text-[13px] font-bold transition-colors ${selectedNodeId === node.id ? 'text-blue-600' : 'text-slate-700'}`}>{node.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden transition-all duration-300 ${isPropertiesVisible ? 'w-[400px]' : 'w-0 opacity-0 pointer-events-none border-none'}`}>
          {selectedConnection && sourceNodeOfConnection && targetNodeOfConnection ? (
            <ParameterMappingPanel visible={true} connection={selectedConnection} sourceNode={{ id: sourceNodeOfConnection.id, name: sourceNodeOfConnection.name, icon: sourceNodeOfConnection.icon }} targetNode={{ id: targetNodeOfConnection.id, name: targetNodeOfConnection.name, icon: targetNodeOfConnection.icon }} onClose={() => { setSelectedConnectionId(null); setIsPropertiesVisible(false); }} onUpdate={() => {}} />
          ) : (
            <div className="flex flex-col h-full w-[400px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <span className="text-[16px] font-bold text-slate-800">节点属性配置</span>
                <button onClick={() => { setSelectedNodeId(null); setIsPropertiesVisible(false); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {selectedNode && (
                  <>
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-[13px] font-bold text-slate-400 mb-2 tracking-wide uppercase">节点名称</label>
                        <div className="text-[16px] text-slate-800 font-bold">{selectedNode.name}</div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-slate-400 mb-2 tracking-wide uppercase">节点说明</label>
                        <p className="text-[13px] text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">{selectedNode.description || `这是${selectedNode.name}任务实例节点。`}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <button onClick={() => setActiveTabs(prev => prev.includes('params') ? prev.filter(t => t !== 'params') : [...prev, 'params'])} className="w-full flex items-center justify-between text-slate-800 font-bold text-[14px] py-4 hover:text-blue-600 transition-colors">
                        <span className="flex items-center gap-2">实例运行参数设置</span>
                        {activeTabs.includes('params') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {activeTabs.includes('params') && (
                        <div className="space-y-6 mt-2 pb-6 animate-in fade-in slide-in-from-top-1 px-1">
                          {(() => {
                              const baseName = selectedNode.name.replace(/\d+$/, '').replace(/\*$/, '');
                              if (baseName.startsWith('云盘数据输入')) {
                                return (
                                  <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500 font-bold">*</span> 输入数据</label>
                                      <div className="space-y-3">
                                          <input 
                                              type="text" 
                                              placeholder="请选择或输入输入数据路径" 
                                              value={selectedNode.params?.inputPath || ''} 
                                              onChange={(e) => handleParamChange('inputPath', e.target.value)} 
                                              className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
                                          />
                                          <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => handleOpenBrowse('inputPath')} className="h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-[13px] hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95">浏览</button>
                                            <button onClick={() => handleOpenMatch('inputPath')} className="h-10 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[13px] hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"><Settings2 size={15} /> 配置数据与规则</button>
                                          </div>
                                          <div className="flex items-start gap-2 text-[12px] text-blue-500 leading-snug bg-blue-50/40 p-4 rounded-xl border border-blue-100/50"><Info size={14} className="shrink-0 mt-0.5" /><span>请选择待处理数据目录并选择卫星配置，系统将自动匹配符合条件的文件。</span></div>
                                          <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                                            <div className="bg-[#EBF2FF] px-4 py-2.5 border-b border-blue-100 flex items-center justify-between">
                                              <h4 className="text-[13px] font-bold text-[#1E40AF]">已匹配资源 ({selectedNode.params?.matchedFiles?.length || 0})</h4>
                                              <button 
                                                onClick={() => setActiveModal('matchedFullscreen')}
                                                disabled={!selectedNode.params?.matchedFiles || selectedNode.params.matchedFiles.length === 0}
                                                className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors disabled:opacity-30"
                                                title="全屏查看"
                                              >
                                                <Maximize2 size={14} />
                                              </button>
                                            </div>
                                            <div className="min-h-[220px] flex flex-col items-center justify-center p-4 bg-white">
                                              {selectedNode.params?.matchedFiles && selectedNode.params.matchedFiles.length > 0 ? (
                                                <div className="w-full max-h-[300px] overflow-y-auto custom-scrollbar space-y-1.5">
                                                  {selectedNode.params.matchedFiles.map((f: any) => (
                                                    <div key={f.id} className="text-[12px] text-slate-600 p-2 rounded-lg border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all truncate flex items-center gap-2"><Database size={13} className="text-blue-400 shrink-0" /> <span className="truncate">{f.name}</span></div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <div className="flex flex-col items-center gap-3 text-slate-300"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center"><Database size={32} className="opacity-10" /></div><span className="text-[13px] font-medium text-slate-400">暂无匹配数据</span></div>
                                              )}
                                            </div>
                                          </div>
                                      </div>
                                  </div>
                                );
                              }
                              const dynamicConfig = ALGO_CONFIG_MAP[baseName];
                              if (dynamicConfig && dynamicConfig.length > 0) {
                                  return dynamicConfig.map((param, index) => (
                                      <div key={index} className="space-y-2">
                                          <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">{param.required && <span className="text-rose-500 font-bold">*</span>}{param.label}</label>
                                          {param.type === 'select' && param.options ? (
                                            <div className="relative group">
                                              <List size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                                              <select value={selectedNode.params?.[param.label] || ''} onChange={(e) => handleParamChange(param.label, e.target.value)} className="w-full h-11 pl-11 pr-10 appearance-none bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm cursor-pointer">
                                                {!selectedNode.params?.[param.label] && <option value="" disabled>请选择</option>}
                                                {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                              </select>
                                              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                          ) : (
                                            <div className="relative group"><input type={param.type === 'date' ? 'date' : 'text'} placeholder={param.description} value={selectedNode.params?.[param.label] || ''} onChange={(e) => handleParamChange(param.label, e.target.value)} className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm" /></div>
                                          )}
                                      </div>
                                  ));
                              }
                              return (selectedNode.type === 'process' && <div className="text-center text-slate-400 text-[12px] py-4">该节点无需运行时参数设置</div>);
                          })()}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 另存为新产线弹窗实现 */}
      {isSaveAsModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[640px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">新增产线</h3>
              <button onClick={() => setIsSaveAsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                     <span className="text-rose-500">*</span> 产线名称
                   </label>
                   <input 
                     type="text" 
                     value={saveAsFormData.name}
                     onChange={e => setSaveAsFormData({...saveAsFormData, name: e.target.value})}
                     placeholder="请输入产线名称"
                     className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-[14px] font-medium"
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                     <span className="text-rose-500">*</span> 产线编码
                   </label>
                   <input 
                     type="text" 
                     value={saveAsFormData.code}
                     onChange={e => setSaveAsFormData({...saveAsFormData, code: e.target.value})}
                     placeholder="请输入产线编码"
                     className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-[14px] font-mono"
                   />
                 </div>

                 <div className="space-y-2 relative">
                   <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                     <span className="text-rose-500">*</span> 产线类型
                   </label>
                   <div className="relative group">
                      <select 
                        value={saveAsFormData.type}
                        onChange={e => setSaveAsFormData({...saveAsFormData, type: e.target.value})}
                        className="w-full h-11 px-4 appearance-none rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-[14px] text-slate-600 cursor-pointer"
                      >
                        <option value="数据采集产线">数据采集产线</option>
                        <option value="数据处理产线">数据处理产线</option>
                        <option value="数据治理产线">数据治理产线</option>
                        <option value="算法研发产线">算法研发产线</option>
                        <option value="其他">其他</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                     责任人
                   </label>
                   <div className="relative group">
                      <select 
                        value={saveAsFormData.owner}
                        onChange={e => setSaveAsFormData({...saveAsFormData, owner: e.target.value})}
                        className="w-full h-11 px-4 appearance-none rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-[14px] text-slate-600 cursor-pointer"
                      >
                        <option value="admin">系统管理员</option>
                        <option value="operator">操作员</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                     产线描述
                   </label>
                   <textarea 
                     rows={4}
                     value={saveAsFormData.desc}
                     onChange={e => setSaveAsFormData({...saveAsFormData, desc: e.target.value})}
                     placeholder="请输入描述信息"
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-[14px] resize-none"
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                     标签
                   </label>
                   <div className="relative group">
                      <select 
                        value={saveAsFormData.tag}
                        onChange={e => setSaveAsFormData({...saveAsFormData, tag: e.target.value})}
                        className="w-full h-11 px-4 appearance-none rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-[14px] text-slate-400 font-normal cursor-pointer"
                      >
                        <option value="">请选择或输入创建新标签</option>
                        <option value="核心业务">核心业务</option>
                        <option value="临时测试">临时测试</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                   </div>
                 </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 flex justify-center gap-4 shrink-0 border-t border-slate-100">
               <button onClick={() => setIsSaveAsModalOpen(false)} className="w-32 h-11 flex items-center justify-center rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-all">取消</button>
               <button onClick={handleConfirmSaveAs} className="w-32 h-11 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95">确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 全屏匹配资源列表弹窗 */}
      {activeModal === 'matchedFullscreen' && selectedNode?.params?.matchedFiles && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full h-full max-w-[1400px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-500">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><CheckSquare size={24} /></div>
                    <h3 className="text-[20px] font-black text-slate-800 tracking-tight">已匹配数据列表</h3>
                    <span className="px-3 py-1 bg-blue-600 text-white text-[12px] font-black rounded-full shadow-lg shadow-blue-500/20">
                        {selectedNode.params.matchedFiles.length} 个结果
                    </span>
                 </div>
                 <button 
                   onClick={() => setActiveModal('none')}
                   className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                 >
                   <X size={28} strokeWidth={2.5} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/20 p-8">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-[#f8faff] text-slate-500 font-black sticky top-0 z-10 border-b border-blue-100">
                              <tr className="text-[14px]">
                                  <th className="px-8 py-5 w-16 text-center">序号</th>
                                  <th className="px-8 py-5">数据名称</th>
                                  <th className="px-8 py-5">卫星类型</th>
                                  <th className="px-8 py-5">载荷类型</th>
                                  <th className="px-8 py-5">标识</th>
                                  <th className="px-8 py-5">分辨率 (m)</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {selectedNode.params.matchedFiles.map((file: any, index: number) => (
                                  <tr key={file.id} className="hover:bg-blue-50/30 transition-all group">
                                      <td className="px-8 py-4 text-center font-mono font-bold text-slate-400 group-hover:text-blue-500">
                                          {index + 1}
                                      </td>
                                      <td className="px-8 py-4">
                                          <div className="flex items-center gap-3">
                                              <Database size={18} className="text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                              <span className="font-bold text-slate-700 truncate max-w-[500px] group-hover:text-blue-600">{file.name}</span>
                                          </div>
                                      </td>
                                      <td className="px-8 py-4 text-slate-500 font-medium">
                                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[12px]">{file.satelliteType || '-'}</span>
                                      </td>
                                      <td className="px-8 py-4 text-slate-500 font-medium">{file.sensor || '-'}</td>
                                      <td className="px-8 py-4">
                                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-black text-[11px] border border-blue-100 shadow-sm">
                                              {file.code || '-'}
                                          </span>
                                      </td>
                                      <td className="px-8 py-4 text-slate-800 font-black text-[15px]">{file.resolution || '-'}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
              
              <div className="px-10 py-6 border-t border-slate-100 flex justify-between items-center shrink-0 bg-white">
                 <div className="flex items-center gap-2 text-slate-400 text-[14px] font-bold">
                    <Info size={16} />
                    以上数据基于所选卫星配置自动匹配得出，共计 {selectedNode.params.matchedFiles.length} 个资源。
                 </div>
                 <button 
                   onClick={() => setActiveModal('none')}
                   className="px-12 h-12 bg-slate-900 text-white rounded-2xl font-black text-[15px] hover:bg-black shadow-2xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2"
                 >
                   关闭预览
                 </button>
              </div>
           </div>
        </div>
      )}

      <ImportPipelineModal visible={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onConfirm={(p) => { setCurrentPipeline(p); initWorkflow(p); setSelectedNodeId(null); setSelectedConnectionId(null); setIsPropertiesVisible(false); setIsImportModalOpen(false); }} />
      
      <DataResourceSelector 
        visible={isOutputSelectorOpen} 
        title="选择输出成果目录" 
        rootName="我的输出数据" 
        storageKey="app_data_products" 
        selectionType="folder" 
        onClose={() => setIsOutputSelectorOpen(false)} 
        onConfirm={(path) => { 
            setTaskConfig({...taskConfig, outputPath: typeof path === 'string' ? path : path.name}); 
            setIsOutputSelectorOpen(false); 
        }} 
      />

      <DataResourceSelector 
        visible={activeModal === 'fileSelect'} 
        title="选择输入路径" 
        rootName="我的输入数据" 
        storageKey="app_data_resources" 
        selectionType="folder" 
        onClose={() => setActiveModal('none')} 
        onConfirm={(path) => { 
            if (activeParam) { 
                const pathStr = typeof path === 'string' ? path : path.name; 
                handleParamChange(activeParam, pathStr); 
            } 
            setActiveModal('none'); 
        }} 
      />

      <SatelliteConfigSelectionModal visible={activeModal === 'matchConfig'} onClose={() => setActiveModal('none')} onConfirm={handleMatchConfirm} initialSelectedIds={selectedNode?.params?.ruleIds || []} />
      
      <CronGeneratorModal 
        visible={isCronModalOpen} 
        onClose={() => setIsCronModalOpen(false)} 
        onSave={(cron) => {
            setTaskConfig({...taskConfig, cron});
            setIsCronModalOpen(false);
        }}
      />
    </div>
  );
};