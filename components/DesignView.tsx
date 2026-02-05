import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  XCircle, 
  Save, 
  Send, 
  Box, 
  Zap, 
  Trash2, 
  Maximize, 
  Maximize2,
  Layout, 
  PlayCircle, 
  PlusCircle, 
  MinusCircle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Database, 
  Share2, 
  Undo2, 
  Redo2, 
  X, 
  Settings, 
  Activity, 
  BarChart3, 
  Sprout, 
  Wheat, 
  ScanLine, 
  CloudSun, 
  Droplets, 
  RotateCcw, 
  Grid, 
  Calendar, 
  Edit3, 
  Info, 
  Square, 
  RefreshCw, 
  Cloud, 
  List,
  AlertCircle,
  Settings2,
  CheckSquare,
  Loader2,
  Search,
  MousePointer2,
  Link2,
  Hand,
  LayoutGrid,
  FileCheck
} from 'lucide-react';
import { ProductionLine, ResourceItem, AlgoConfigParam, Connection, ParamMapping } from '../types';
import { MOCK_RESOURCES, MockApi } from '../services/mockApi';
import { DataResourceSelector } from './DataResourceSelector'; 
import { SatelliteConfigSelectionModal } from './SatelliteConfigSelectionModal';
import { ParameterMappingPanel } from './ParameterMappingPanel';
import { ALGO_CONFIG_MAP } from '../constants'; 

interface Props {
  lineName: string;
  initialData?: ProductionLine | null;
  onBack: () => void;
  onSaveDraft?: (data: ProductionLine) => void;
  onSubmit?: (data: ProductionLine) => void;
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
  'RotateCcw': <RotateCcw size={32} className="text-blue-600" />,
  'CloudSun': <CloudSun size={32} className="text-blue-600" />,
  'Droplets': <Droplets size={32} className="text-blue-600" />,
  'Share2': <Share2 size={32} className="text-blue-600" />,
  'Cloud': <Cloud size={32} className="text-blue-600" />
};

export const DesignView: React.FC<Props> = ({ lineName, initialData, onBack, onSaveDraft, onSubmit }) => {
  const [activeTabs, setActiveTabs] = useState<string[]>(['params']);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isPropertiesVisible, setIsPropertiesVisible] = useState(false);
  const [localLineName, setLocalLineName] = useState(lineName || '产线名称');
  
  const [algoConfigs, setAlgoConfigs] = useState<Record<string, AlgoConfigParam[]>>({});
  const [canvasOffset, setCanvasOffset] = useState<NodePos>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  // // Fix: Initializing panStart state with a default value as 'e' is not available during component initialization
  const [panStart, setPanStart] = useState<NodePos>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeModal, setActiveModal] = useState<'none' | 'fileSelect' | 'matchConfig' | 'matchedFullscreen'>('none');
  const [activeParam, setActiveParam] = useState<string | null>(null);

  // --- History Management ---
  const [history, setHistory] = useState<{ nodes: CanvasNode[], conns: Connection[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: CanvasNode[], conns: Connection[] }[]>([]);

  const pushHistory = (nodes: CanvasNode[], conns: Connection[]) => {
    setHistory(prev => [...prev, { nodes: JSON.parse(JSON.stringify(canvasNodes)), conns: JSON.parse(JSON.stringify(connections)) }]);
    setRedoStack([]); 
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(prevStack => [{ nodes: JSON.parse(JSON.stringify(canvasNodes)), conns: JSON.parse(JSON.stringify(connections)) }, ...prevStack]);
    setCanvasNodes(prev.nodes);
    setConnections(prev.conns);
    setHistory(prevHist => prevHist.slice(0, -1));
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory(prevHist => [...prevHist, { nodes: JSON.parse(JSON.stringify(canvasNodes)), conns: JSON.parse(JSON.stringify(connections)) }]);
    setCanvasNodes(next.nodes);
    setConnections(next.conns);
    setRedoStack(prevStack => prevStack.slice(1));
  };

  const handleClear = () => {
    if (confirm('确认清空所有自定义节点和连线吗？')) {
      pushHistory(canvasNodes, connections);
      setCanvasNodes([
        { 
          id: 'start', 
          name: '开始', 
          icon: <PlayCircle size={28} className="text-blue-600" />, 
          iconKey: 'PlayCircle',
          type: 'start', 
          pos: { x: 320, y: 300 }, 
          params: {}
        },
        { 
          id: 'end', 
          name: '结束', 
          icon: <Square size={24} className="text-blue-600 fill-blue-600/10" />, 
          iconKey: 'Square',
          type: 'end', 
          pos: { x: 750, y: 300 }, 
          params: {}
        },
      ]);
      setConnections([]);
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
    }
  };

  const handleAutoLayout = () => {
    pushHistory(canvasNodes, connections);
    const startX = 100;
    const startY = 300;
    const stepX = 220;
    const processNodes = canvasNodes.filter(n => n.type === 'process');
    const newNodes = canvasNodes.map(node => {
      if (node.type === 'start') return { ...node, pos: { x: startX, y: startY } };
      if (node.type === 'end') return { ...node, pos: { x: startX + (processNodes.length + 1) * stepX, y: startY } };
      const idx = processNodes.findIndex(p => p.id === node.id);
      return { ...node, pos: { x: startX + (idx + 1) * stepX, y: startY } };
    });
    setCanvasNodes(newNodes);
  };

  const toggleTab = (tab: string) => {
    setActiveTabs(prev => prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab]);
  };
  
  useEffect(() => {
    if (initialData && initialData.canvasData) {
      setLocalLineName(initialData.name);
      setCanvasNodes(initialData.canvasData.nodes.map(n => ({
        ...n,
        icon: ICON_MAP[n.iconKey] || <Box size={32} className="text-blue-600" /> 
      })));
      setConnections(initialData.canvasData.connections);
    } else {
      setCanvasNodes([
        { 
          id: 'start', 
          name: '开始', 
          icon: <PlayCircle size={28} className="text-blue-600" />, 
          iconKey: 'PlayCircle',
          type: 'start', 
          pos: { x: 320, y: 300 }, 
          description: '这是产线执行的起点。',
          params: {}
        },
        { 
          id: 'end', 
          name: '结束', 
          icon: <Square size={24} className="text-blue-600 fill-blue-600/10" />, 
          iconKey: 'Square',
          type: 'end', 
          pos: { x: 750, y: 300 }, 
          description: '这是产线执行的终点。',
          params: {}
        },
      ]);
    }
  }, [initialData]);

  useEffect(() => {
    setAlgoConfigs(ALGO_CONFIG_MAP);
  }, []);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePos>({ x: 0, y: 0 });
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<NodePos>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

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
    const node = canvasNodes.find(n => n.id === id);
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
      setCanvasNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, pos: { x: (x - canvasOffset.x) / zoom - dragOffset.x, y: (y - canvasOffset.y) / zoom - dragOffset.y } } : n));
    } else if (isPanning) {
      setCanvasOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const onMouseUp = () => {
    if (draggingNodeId) {
      setHistory(prev => [...prev, { nodes: JSON.parse(JSON.stringify(canvasNodes)), conns: JSON.parse(JSON.stringify(connections)) }]);
    }
    setDraggingNodeId(null);
    setConnectingFromId(null);
    setIsPanning(false);
  };

  const startConnecting = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnectingFromId(id);
  };

  const completeConnection = (e: React.MouseEvent, toId: string) => {
    e.stopPropagation();
    if (connectingFromId && connectingFromId !== toId) {
      const exists = connections.find(c => c.fromId === connectingFromId && c.toId === toId);
      if (!exists) {
        pushHistory(canvasNodes, connections);
        setConnections(prev => [...prev, { id: `conn-${Date.now()}`, fromId: connectingFromId, toId }]);
      }
    }
    setConnectingFromId(null);
  };

  const handleLibraryDragStart = (e: React.DragEvent, item: { name: string, iconKey: string }) => {
    e.dataTransfer.setData('nodeName', item.name);
    e.dataTransfer.setData('iconKey', item.iconKey);
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nodeName = e.dataTransfer.getData('nodeName');
    const iconKey = e.dataTransfer.getData('iconKey');
    
    let originalItem: any = null;
    for (const cat of categories) {
      const found = cat.items.find(i => i.name === nodeName);
      if (found) { originalItem = found; break; }
    }
    if (!originalItem) return;

    let finalName = originalItem.name;
    const existingNames = new Set(canvasNodes.map(node => node.name));
    if (existingNames.has(finalName)) {
      let counter = 1;
      while (existingNames.has(`${finalName}${counter}`)) counter++;
      finalName = `${finalName}${counter}`;
    }

    const dropX = (e.clientX - rect.left - canvasOffset.x) / zoom - 48;
    const dropY = (e.clientY - rect.top - canvasOffset.y) / zoom - 48;

    const initialParams: Record<string, any> = {};
    if (originalItem.name === '云盘数据输入') {
        initialParams.inputPath = '';
        initialParams.matchedFiles = [];
        initialParams.ruleIds = []; 
    } else {
        const configParams = algoConfigs[originalItem.name] || [];
        configParams.forEach(p => {
            if (p.defaultValue !== undefined && p.defaultValue !== '') initialParams[p.label] = p.defaultValue;
            else if (p.type === 'select' && p.options && p.options.length > 0) initialParams[p.label] = p.options[0];
            else initialParams[p.label] = '';
        });
    }

    pushHistory(canvasNodes, connections);

    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      name: finalName,
      icon: React.cloneElement(originalItem.icon as React.ReactElement<any>, { size: 32, className: 'text-blue-600' }),
      iconKey: iconKey,
      type: 'process',
      pos: { x: dropX, y: dropY },
      description: `这是${originalItem.name}算子，用于处理相关空间数智任务。`,
      params: initialParams 
    };
    setCanvasNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedConnectionId(null);
    setIsPropertiesVisible(true);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => { setZoom(1); setCanvasOffset({ x: 0, y: 0 }); };

  const selectedNode = canvasNodes.find(n => n.id === selectedNodeId);
  const selectedConnection = connections.find(c => c.id === selectedConnectionId);
  const sourceNodeOfConnection = selectedConnection ? canvasNodes.find(n => n.id === selectedConnection.fromId) : null;
  const targetNodeOfConnection = selectedConnection ? canvasNodes.find(n => n.id === selectedConnection.toId) : null;

  const handleUpdateConnectionMappings = (mappings: ParamMapping[]) => {
    if (!selectedConnectionId) return;
    setConnections(prev => prev.map(c => 
      c.id === selectedConnectionId 
        ? { ...c, data: { ...c.data, mappings } } 
        : c
    ));
  };

  const handleParamChange = (key: string, value: any) => {
    if (!selectedNodeId) return;
    setCanvasNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, params: { ...n.params, [key]: value } } : n));
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
    },
    {
      title: '智能解译节点',
      items: [
        { name: '农业撂荒监测', icon: <ScanLine size={24} className="text-blue-500" />, iconKey: 'ScanLine' },
        { name: '水稻种植分布', icon: <Wheat size={24} className="text-blue-500" />, iconKey: 'Wheat' },
        { name: '油菜种植分布', icon: <Sprout size={24} className="text-blue-500" />, iconKey: 'Sprout' },
        { name: '水稻作物长势监测', icon: <Activity size={24} className="text-blue-500" />, iconKey: 'Activity' },
        { name: '油菜作物长势监测', icon: <Activity size={24} className="text-blue-500" />, iconKey: 'Activity' },
        { name: '水稻作物估产', icon: <BarChart3 size={24} className="text-blue-500" />, iconKey: 'BarChart3' },
        { name: '油菜作物估产', icon: <BarChart3 size={24} className="text-blue-500" />, iconKey: 'BarChart3' },
        { name: '农业大棚监测', icon: <Grid size={24} className="text-blue-500" />, iconKey: 'Grid' },
        { name: '生产基地变化监测', icon: <RotateCcw size={24} className="text-blue-500" />, iconKey: 'RotateCcw' },
        { name: '旱情监测', icon: <CloudSun size={24} className="text-blue-500" />, iconKey: 'CloudSun' },
        { name: '耕地熵情反演', icon: <Droplets size={24} className="text-blue-500" />, iconKey: 'Droplets' },
      ]
    },
    {
      title: '输出节点',
      items: [{ name: '服务发布', icon: <Share2 size={24} className="text-blue-500" />, iconKey: 'Share2' }]
    }
  ];

  const getConnectionPath = (fromNode: CanvasNode, toNode: CanvasNode) => {
    const startX = fromNode.pos.x + 96; 
    const startY = fromNode.pos.y + 48; 
    const endX = toNode.pos.x;
    const endY = toNode.pos.y + 48;
    const cpX = startX + (endX - startX) / 2;
    return `M ${startX} ${startY} C ${cpX} ${startY}, ${cpX} ${endY}, ${endX} ${endY}`;
  };

  const handleOpenBrowse = (paramLabel: string) => {
      setActiveParam(paramLabel);
      setActiveModal('fileSelect');
  };

  const handleOpenMatch = (paramLabel: string) => {
      setActiveParam(paramLabel);
      setActiveModal('matchConfig');
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
                <span className="invisible whitespace-pre text-[20px] font-bold px-1 col-start-1 row-start-1">
                  {localLineName || "产线名称"}
                </span>
                <input 
                  type="text" 
                  value={localLineName} 
                  onChange={(e) => setLocalLineName(e.target.value)}
                  placeholder="产线名称"
                  className="absolute inset-0 w-full text-[20px] font-bold text-slate-800 bg-transparent focus:outline-none col-start-1 row-start-1 px-1 placeholder:text-slate-300"
                />
              </div>
              <Edit3 size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
            </div>
            <span className="px-2.5 py-1 bg-[#eff6ff] text-[#2563eb] text-[12px] font-bold rounded border border-blue-100 shadow-sm shrink-0">
              设计中
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-4 h-[36px] flex items-center gap-2 bg-rose-50 text-rose-600 rounded-lg text-[14px] font-semibold hover:bg-rose-100 border border-rose-100 transition-colors">
            <XCircle size={16} /> 关闭
          </button>
          <button className="px-4 h-[36px] flex items-center gap-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[14px] font-semibold hover:bg-slate-50 transition-colors">
            <Save size={16} className="text-blue-500" /> 保存至草稿
          </button>
          <button className="px-6 h-[36px] flex items-center gap-2 bg-blue-600 text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95">
            <Send size={16} /> 提交
          </button>
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
          onClick={() => {
            setSelectedNodeId(null);
            setSelectedConnectionId(null);
            setIsPropertiesVisible(false);
          }}
        >
          <div className="canvas-background absolute inset-0 z-0 pointer-events-none opacity-20" 
            style={{ 
              backgroundImage: 'radial-gradient(#475569 1.5px, transparent 1.5px)', 
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
            }} 
          />
          
          <div className="absolute top-4 left-6 flex items-center gap-3 z-10 select-none">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
               <Box size={16} className="text-slate-800" />
               <span className="text-[13px] font-black text-slate-800">产线设计画布</span>
            </div>
            
            <div className="flex items-center bg-white/80 backdrop-blur-md border border-slate-200 p-1 rounded-xl shadow-sm">
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-500 border-r border-slate-100">
                 <MousePointer2 size={12} className="text-blue-500" />
                 <span>拖拽节点构建</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-500 border-r border-slate-100">
                 <Settings size={12} className="text-indigo-500" />
                 <span>选中节点设参数</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-500 border-r border-slate-100">
                 <Link2 size={12} className="text-emerald-500" />
                 <span>选中连线绑数据</span>
               </div>
               <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                 <Hand size={12} />
                 <span>按住背景平移</span>
               </div>
            </div>
          </div>
          
          <div className="absolute top-4 right-6 flex items-center gap-1 z-10">
             <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shadow-sm mr-2">
                <button title="撤销" onClick={handleUndo} disabled={history.length === 0} className={`w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 transition-all ${history.length === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:text-blue-600'}`}>
                    <Undo2 size={16}/>
                </button>
                <button title="恢复" onClick={handleRedo} disabled={redoStack.length === 0} className={`w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 transition-all ${redoStack.length === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:text-blue-600'}`}>
                    <Redo2 size={16}/>
                </button>
                <div className="w-px h-4 bg-slate-100 mx-0.5" />
                <button title="自动排列" onClick={handleAutoLayout} className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all">
                    <LayoutGrid size={16}/>
                </button>
                <button title="清空画布" onClick={handleClear} className="w-8 h-8 flex items-center justify-center rounded text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all">
                    <Trash2 size={16}/>
                </button>
             </div>

             <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                <button title="复位" onClick={handleResetZoom} className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><RefreshCw size={16}/></button>
                <button title="放大" onClick={handleZoomIn} className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><PlusCircle size={16}/></button>
                <button title="缩小" onClick={handleZoomOut} className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><MinusCircle size={16}/></button>
             </div>
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            <svg className="absolute inset-0 w-[5000px] h-[5000px] z-0 pointer-events-none overflow-visible">
              {connections.map(conn => {
                const from = canvasNodes.find(n => n.id === conn.fromId);
                const to = canvasNodes.find(n => n.id === conn.toId);
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
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedConnectionId(conn.id); 
                        setSelectedNodeId(null); 
                        setIsPropertiesVisible(true);
                      }}
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
              {connectingFromId && (() => {
                const fromNode = canvasNodes.find(n => n.id === connectingFromId);
                if (!fromNode) return null;
                const startX = fromNode.pos.x + 96;
                const startY = fromNode.pos.y + 48;
                const targetX = (mousePos.x - canvasOffset.x) / zoom;
                const targetY = (mousePos.y - canvasOffset.y) / zoom;
                return <path d={`M ${startX} ${startY} L ${targetX} ${targetY}`} fill="none" stroke="#3B82F6" strokeWidth={2.5 / zoom} strokeDasharray={`${5/zoom},${5/zoom}`} />;
              })()}
            </svg>

            {canvasNodes.map(node => {
              const isCloudInput = node.name.startsWith('云盘数据输入');
              const hasData = node.params?.matchedFiles && node.params.matchedFiles.length > 0;
              return (
              <div 
                key={node.id}
                className="absolute pointer-events-auto cursor-pointer flex flex-col items-center gap-2 group z-10 select-none"
                style={{ left: node.pos.x, top: node.pos.y }}
                onMouseDown={(e) => onNodeMouseDown(e, node.id)}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`
                  w-24 h-24 flex items-center justify-center rounded-2xl relative transition-all duration-200 border-2
                  ${selectedNodeId === node.id 
                    ? 'border-blue-500 bg-white ring-4 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'bg-white border-slate-100 shadow-sm hover:border-blue-300'}
                `}>
                  <div className={`w-14 h-14 bg-white border border-slate-50 rounded-xl flex items-center justify-center shadow-inner transition-colors ${selectedNodeId === node.id ? 'bg-blue-50/20' : 'group-hover:bg-blue-50/20'}`}>
                    {node.icon}
                  </div>
                  {isCloudInput && !hasData && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm">
                        <AlertCircle size={20} className="text-red-500 fill-white" />
                    </div>
                  )}
                  {(node.type !== 'end') && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-200 rounded-full hover:bg-blue-500 hover:border-blue-500 transition-all cursor-crosshair shadow-sm z-20 flex items-center justify-center group/port" style={{ transform: `translateY(-50%) scale(${Math.max(1, 1/zoom)})` }} onMouseDown={(e) => startConnecting(e, node.id)}>
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full group-hover/port:bg-white transition-colors" />
                    </div>
                  )}
                  {(node.type !== 'start') && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-200 rounded-full hover:bg-blue-500 hover:border-blue-500 transition-all cursor-crosshair shadow-sm z-20 flex items-center justify-center group/port" style={{ transform: `translateY(-50%) scale(${Math.max(1, 1/zoom)})` }} onMouseUp={(e) => completeConnection(e, node.id)} onMouseDown={(e) => e.stopPropagation()}>
                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full group-hover/port:bg-white transition-colors" />
                    </div>
                  )}
                </div>
                <span className={`text-[13px] font-bold transition-colors ${selectedNodeId === node.id ? 'text-blue-600' : 'text-slate-700'}`}>
                  {node.name}
                </span>
              </div>
            )})}
          </div>
        </div>

        <div className={`bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden transition-all duration-300 ${isPropertiesVisible ? 'w-[400px]' : 'w-0 opacity-0 pointer-events-none border-none'}`}>
          {selectedConnection && sourceNodeOfConnection && targetNodeOfConnection ? (
            <ParameterMappingPanel 
              visible={true}
              connection={selectedConnection}
              sourceNode={{ id: sourceNodeOfConnection.id, name: sourceNodeOfConnection.name, icon: sourceNodeOfConnection.icon }}
              targetNode={{ id: targetNodeOfConnection.id, name: targetNodeOfConnection.name, icon: targetNodeOfConnection.icon }}
              onClose={() => { setSelectedConnectionId(null); setIsPropertiesVisible(false); }}
              onUpdate={handleUpdateConnectionMappings}
            />
          ) : (
          <div className="flex flex-col h-full w-[400px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <span className="text-[16px] font-bold text-slate-800">节点属性配置</span>
              <button onClick={() => { setSelectedNodeId(null); setIsPropertiesVisible(false); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors">
                <X size={18} />
              </button>
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
                      <p className="text-[13px] text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {selectedNode.description || `这是${selectedNode.name}节点，用于处理相关业务逻辑。`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button onClick={() => toggleTab('params')} className="w-full flex items-center justify-between text-slate-800 font-bold text-[14px] py-4 hover:text-blue-600 transition-colors">
                      <span className="flex items-center gap-2">参数设置</span>
                      {activeTabs.includes('params') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {activeTabs.includes('params') && (
                      <div className="space-y-6 mt-2 pb-6 animate-in fade-in slide-in-from-top-1 px-1">
                        {selectedNode.name.startsWith('云盘数据输入') ? (
                            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                                    <span className="text-rose-500 font-bold">*</span> 输入数据
                                </label>
                                
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="请选择或输入输入数据路径" 
                                        value={selectedNode.params?.inputPath || ''} 
                                        onChange={(e) => handleParamChange('inputPath', e.target.value)}
                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                      <button 
                                          onClick={() => handleOpenBrowse('inputPath')}
                                          className="h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-[13px] hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                      >
                                          浏览
                                      </button>
                                      <button 
                                          onClick={() => handleOpenMatch('inputPath')}
                                          className="h-10 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[13px] hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                      >
                                          <Settings2 size={15} /> 配置数据与规则
                                      </button>
                                    </div>

                                    <div className="flex items-start gap-2 text-[12px] text-blue-500 leading-snug bg-blue-50/40 p-4 rounded-xl border border-slate-100/50">
                                      <Info size={14} className="shrink-0 mt-0.5" />
                                      <span>请选择待处理数据目录并选择卫星配置，系统将自动匹配符合条件的文件。</span>
                                    </div>

                                    <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                                      <div className="bg-[#EBF2FF] px-4 py-2.5 border-b border-blue-100 flex items-center justify-between">
                                        <h4 className="text-[13px] font-bold text-[#1E40AF]">
                                          已匹配资源 ({selectedNode.params?.matchedFiles?.length || 0})
                                        </h4>
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
                                              <div key={f.id} className="text-[12px] text-slate-600 p-2 rounded-lg border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all truncate flex items-center gap-2">
                                                 <Database size={13} className="text-blue-400 shrink-0" /> 
                                                 <span className="truncate">{f.name}</span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center gap-3 text-slate-300">
                                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                <Database size={32} className="opacity-10" />
                                             </div>
                                             <span className="text-[13px] font-medium text-slate-400">暂无匹配数据</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            (() => {
                                const baseName = canvasNodes.find(n => n.id === selectedNodeId)?.name.replace(/\d+$/, ''); 
                                const dynamicConfig = algoConfigs[baseName || ''];
                                if (dynamicConfig && dynamicConfig.length > 0) {
                                    return dynamicConfig.map((param, index) => (
                                        <div key={index} className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                                                {param.required && <span className="text-rose-500 font-bold">*</span>}
                                                {param.label}
                                            </label>
                                            {param.type === 'file' ? (
                                                <div className="flex gap-2">
                                                    <div className="relative group flex-1">
                                                        <input 
                                                            type="text" 
                                                            placeholder={param.description || "请选择文件"} 
                                                            value={selectedNode.params?.[param.label] || ''} 
                                                            onChange={(e) => handleParamChange(param.label, e.target.value)}
                                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => handleOpenBrowse(param.label)}
                                                        className="h-10 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-[13px] hover:bg-blue-600 hover:text-white transition-all shadow-sm whitespace-nowrap"
                                                    >
                                                        浏览
                                                    </button>
                                                </div>
                                            ) : param.type === 'select' && param.options ? (
                                              <div className="relative group">
                                                <List size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <select 
                                                  value={selectedNode.params?.[param.label] || ''}
                                                  onChange={(e) => handleParamChange(param.label, e.target.value)}
                                                  className="w-full h-11 pl-11 pr-10 appearance-none bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm cursor-pointer"
                                                >
                                                  {!selectedNode.params?.[param.label] && <option value="" disabled>请选择</option>}
                                                  {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                              </div>
                                            ) : (
                                              <div className="relative group">
                                                <input 
                                                  type={param.type === 'date' ? 'date' : 'text'} 
                                                  placeholder={param.description}
                                                  value={selectedNode.params?.[param.label] || ''}
                                                  onChange={(e) => handleParamChange(param.label, e.target.value)}
                                                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm"
                                                />
                                              </div>
                                            )}
                                        </div>
                                    ));
                                }
                                return (
                                    selectedNode.type === 'process' && (
                                      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 animate-in fade-in duration-500">
                                          <Settings2 size={40} className="text-slate-200 mb-3 opacity-50" />
                                          <p className="text-slate-400 text-[13px] font-bold">该算法无通配参数可以设置</p>
                                      </div>
                                    )
                                );
                            })()
                        )}
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

      {/* MODALS */}
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

      <SatelliteConfigSelectionModal 
        visible={activeModal === 'matchConfig'}
        onClose={() => setActiveModal('none')}
        onConfirm={handleMatchConfirm}
        initialSelectedIds={selectedNode?.params?.ruleIds || []}
      />

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
    </div>
  );
};
