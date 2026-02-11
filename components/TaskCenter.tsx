import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Eye, 
  Play, 
  Edit3, 
  FileText, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  Zap, 
  Layers, 
  Layout, 
  CloudUpload, 
  Square, 
  Bug, 
  Crop, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  PlayCircle,
  X,
  Factory,
  LayoutGrid,
  Share2,
  Settings,
  Ban,
  AlertCircle,
  Settings2,
  Activity,
  Timer,
  Download,
  Terminal,
  Check,
  FileSearch,
  ShieldCheck,
  ZapOff,
  FileIcon,
  Info,
  ExternalLink,
  MapPin,
  Clock,
  Box,
  Calendar,
  FileCode,
  FileJson,
  FileSpreadsheet,
  CheckSquare,
  List,
  User,
  FolderOpen,
  HelpCircle,
  RefreshCcw
} from 'lucide-react';
import { ProductionLine } from '../types';
import { ImportPipelineModal } from '../pages/TaskManagement/ImportPipelineModal';
import { DataResourceSelector } from './DataResourceSelector';
import { ALGO_CONFIG_MAP } from '../constants';

const INITIAL_MOCK_TASKS = [
  { id: '1', name: '[任务]_[20260116142424]_生产测试', type: '一次性任务', source: '测试最新-xx-0106', status: '进行中', start: '2026-01-16 14:24:24', end: '-', errorStrategy: 'stop', alarmType: 'system' },
  { id: 'sch-1', name: '[定时]湖北省哨兵数据日更采集_实例0117', type: '定时任务', source: '哨兵数据采集产线', status: '运行中', start: '2026-01-17 02:00:15', end: '-', errorStrategy: 'stop', alarmType: 'system' },
  { id: '6', name: '[任务]影像自动纠偏预处理_手工中止测试', type: '一次性任务', source: '算法任务', status: '已终止', start: '2026-01-14 10:00:00', end: '2026-01-14 10:05:20', errorStrategy: 'stop', alarmType: 'system' },
  { id: '2', name: '波段合成选择压缩包测试', type: '一次性任务', source: '算法任务', status: '成功', start: '2026-01-16 10:58:57', end: '2026-01-16 11:00:08', errorStrategy: 'ignore', alarmType: 'email' },
  { id: 'sch-2', name: '[定时]大冶市农作物分类周报_实例0112', type: '定时任务', source: '农作物提取与分类产线', status: '成功', start: '2026-01-12 08:30:44', end: '2026-01-12 09:15:22', errorStrategy: 'stop', alarmType: 'sms' },
  { id: '3', name: '数据服务发布测试', type: '一次性任务', source: '算法任务', status: '成功', start: '2026-01-15 17:54:01', end: '2026-01-15 17:55:02', errorStrategy: 'stop', alarmType: 'system' },
  { id: 'sch-3', name: '[定时]全量影像索引自动化重建_实例0101', type: '定时任务', source: '影像索引维护与管理产线', status: '失败', start: '2026-01-01 01:00:02', end: '2026-01-01 03:45:10', errorStrategy: 'ignore', alarmType: 'system' },
  { id: '4', name: '影像镶嵌算法验证', type: '一次性任务', source: '算法任务', status: '失败', start: '2026-01-14 18:03:06', end: '2026-01-14 18:04:06', outputPath: '/data/output/verification_0114', errorStrategy: 'stop', alarmType: 'email' },
  { id: 'sch-4', name: '[定时]异常数据冷备归档_实例0114', type: '定时任务', source: '数据治理产线', status: '失败', start: '2026-01-14 01:00:00', end: '2026-01-14 01:12:45', outputPath: '/data/archive/cold_backup_v1', errorStrategy: 'stop', alarmType: 'system' },
  { id: '5', name: '波段合成任务_文件夹模式', type: '一次性任务', source: '算法任务', status: '成功', start: '2026-01-14 17:16:21', end: '2026-01-14 17:17:22', errorStrategy: 'ignore', alarmType: 'system' },
];

const MOCK_LOGS: Record<string, any[]> = {
  'default': [
    { title: '波段合成', time: '2026-02-02 01:01:32', status: 'success', statusText: '执行成功', detail: '合成 4-3-2 (RGB) 真彩色影像。', result: '生成 TIF 成果文件：/data/output/v2/merged_B432.tif，大小 3.5GB。', extra: '元数据校验通过：波段完整性 100%，坐标参考系 EPSG:4326。' },
    { title: '数据采集', time: '2026-02-02 01:00:09', status: 'success', statusText: '执行成功', detail: '从欧空局 Sentinel-2 归档库获取数据。', result: '成功拉取 12 个切片，总大小 15.6GB，已存入临时缓存区。' },
    { title: '影像镶嵌', time: '2026-02-02 01:02:34', status: 'success', statusText: '执行成功', detail: '执行多幅影像重叠度分析及缝合线生成。', result: '镶嵌精度符合要求（RMS < 0.5px）。', extra: '输出路径：/data/output/temp_mosaic.tif' },
    { title: '影像裁剪', time: '2026-02-02 01:03:14', status: 'success', statusText: '执行成功', detail: '根据 ROI 矢量范围（武汉市行政边界）进行硬裁剪。', result: '产出目标子场景影像 1 幅，已剔除无值区域（NoData）。' },
    { title: '服务发布', time: '2026-02-02 09:03:32', status: 'pending', statusText: '等待执行', detail: '等待前序 [影像裁剪] 节点释放文件锁...' }
  ],
  'failed': [
    { title: '波段合成', time: '2026-01-14 18:03:06', status: 'success', statusText: '执行成功', detail: '完成原始波段配准。' },
    { title: '数据采集', time: '2026-01-14 18:02:10', status: 'success', statusText: '执行成功', detail: '云盘链路建立成功。' },
    { title: '影像镶嵌', time: '2026-01-14 18:04:00', status: 'error', statusText: '执行异常', errorType: '资源限制 (OOM)', errorCode: 'ERR_WORKER_OUT_OF_MEMORY', detail: '算法在处理 10GB 以上超大规模 TIF 镶嵌时，物理内存 (64GB) 耗尽。', reason: '镶嵌缓存分块大小 (TileSize) 设置过大（10240px），导致算子溢出。', suggestion: '请尝试在任务配置中将 “单片分块大小” 调小至 2048px，或增加算子节点内存配额。' },
    { title: '影像裁剪', time: '-', status: 'skipped', statusText: '跳过执行', detail: '由于前置环节 [影像镶嵌] 失败，根据“失败策略：停止”，本环节及后续环节已自动跳过。' }
  ]
};

const NODE_INPUT_DATA_MOCK: Record<string, any[]> = {
  '数据采集': [
    { name: 'Sentinel-2 数据获取规则配置.json', size: '1.2KB', type: 'JSON', time: '2026-01-16 14:24:24', path: '/系统/配置/rules', source: '手动输入' },
    { name: '湖北省行政区划边界.shp', size: '450KB', type: 'SHP', time: '2026-01-16 14:24:25', path: '/时空资源/矢量/湖北', source: '手动输入' }
  ],
  '波段合成': [
    { name: 'Sentinel2_B02_Blue_10m.tif', size: '120MB', type: 'TIF', time: '2026-01-16 14:30:00', path: '/前置节点/输出', source: '产线流转' },
    { name: 'Sentinel2_B03_Green_10m.tif', size: '120MB', type: 'TIF', time: '2026-01-16 14:30:00', path: '/前置节点/输出', source: '产线流转' },
    { name: 'Sentinel2_B04_Red_10m.tif', size: '120MB', type: 'TIF', time: '2026-01-16 14:30:00', path: '/前置节点/输出', source: '产线流转' }
  ],
  '影像镶嵌': [
    { name: 'Wuhan_East_Subset.tif', size: '1.4GB', type: 'TIF', time: '2026-01-16 14:45:10', path: '/临时/缓存', source: '算子产出' },
    { name: 'Wuhan_West_Subset.tif', size: '1.2GB', type: 'TIF', time: '2026-01-16 14:45:10', path: '/临时/缓存', source: '算子产出' }
  ],
  '影像裁剪': [
    { name: 'Mosaicked_Wuhan_Full.tif', size: '2.6GB', type: 'TIF', time: '2026-01-16 15:00:00', path: '/中间/结果', source: '算子产出' },
    { name: 'Wuhan_City_Mask.shp', size: '2.1MB', type: 'SHP', time: '2026-01-16 15:00:05', path: '/本地/存储', source: '手动输入' }
  ],
  '服务发布': [
    // 模拟尚未流转过来的状态
  ]
};

type NodeStatus = 'success' | 'failed' | 'running' | 'pending';

const NodeComponent = ({ icon, label, status, progress, onClick }: { icon: React.ReactNode; label: string; status: NodeStatus; progress?: number; onClick?: () => void }) => {
  return (
    <div className="flex flex-col items-center z-10 group cursor-pointer" onClick={onClick}>
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all duration-500 relative shrink-0 overflow-visible ${
          status === 'success' ? 'bg-[#ECFDF5] border-[#10B981]/40 text-[#059669]' : 
          status === 'running' ? 'bg-blue-50 border-transparent text-blue-600 running-node-container' :
          status === 'failed' ? 'bg-rose-50 border-rose-400 text-rose-600' : 'bg-white border-slate-100 text-slate-200'
      }`}>
        {status === 'running' && (
          <div className="absolute inset-[-2.5px] rounded-[18px] z-0 overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0,rgba(59,130,246,0.8)_30deg,transparent_60deg)] animate-[spin_3s_linear_infinite]"></div>
          </div>
        )}
        <div className={`w-full h-full rounded-[16px] flex items-center justify-center relative z-10 ${
            status === 'running' ? 'bg-blue-50' : 
            status === 'success' ? 'bg-[#ECFDF5]' : 'bg-white'
        }`}>
          <div className={`transition-transform duration-300 ${status !== 'pending' ? 'group-hover:scale-110' : ''}`}>
            {icon}
          </div>
        </div>
        {status === 'running' && progress !== undefined && (
          <div className="absolute -top-1.5 -right-1.5 bg-[#2563EB] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg z-20 animate-in fade-in zoom-in duration-300 tracking-tighter">
            {progress}%
          </div>
        )}
        {status === 'success' && (
          <div className="absolute -top-1.5 -right-1.5 bg-[#10B981] text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md z-20 animate-in zoom-in duration-300">
            <Check size={12} strokeWidth={4} />
          </div>
        )}
        {status === 'failed' && (
          <div className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md z-20 animate-in zoom-in duration-300">
            <X size={12} strokeWidth={4} />
          </div>
        )}
      </div>
      <span className={`mt-3 text-[12px] font-bold tracking-tight transition-colors ${
          status === 'pending' ? 'text-slate-300' : 
          status === 'success' ? 'text-[#059669]' : 'text-slate-600'
      }`}>{label}</span>
    </div>
  );
};

const FlowArrow = ({ status }: { status: 'success' | 'active' | 'pending' }) => {
  return (
    <div className="w-16 h-20 flex items-center justify-center px-1 shrink-0 mb-6">
      <div className={`w-full h-[2px] rounded-full relative overflow-hidden ${status === 'success' ? 'bg-[#10B981]/20' : 'bg-slate-100'}`}>
        {status === 'success' && (<div className="absolute inset-0 w-full h-full bg-[#10B981]/30" />)}
        {status === 'active' && (<div className="absolute inset-0 w-full h-full animate-[flow-particles_2s_infinite] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />)}
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 border-l-[6px] border-y-[4px] border-y-transparent ${status === 'success' ? 'border-l-[#10B981]/50' : 'border-l-slate-200'}`}></div>
      </div>
    </div>
  );
};

interface TaskCenterProps {
  onViewDetail?: (taskId: string) => void;
  onOrchestrateTask?: (pipeline: ProductionLine) => void;
  autoOpenImport?: boolean; 
  onImportModalClose?: () => void;
}

export const getPipelineStepsForTask = (type: string, status: string) => {
    const isSuccess = status === '成功';
    const isRunning = status === '进行中' || status === '运行中';
    const isFailed = status === '失败';
    const isTerminated = status === '已终止';

    const baseSteps = [
        { id: 'start', label: '开始', icon: <PlayCircle size={22} />, status: 'success' as const },
        { id: 'access', label: '数据采集', icon: <Database size={20} />, status: 'success' as const },
        { id: 'wave', label: '波段合成', icon: <Zap size={20} />, status: 'success' as const },
        { id: 'mosaic', label: '影像镶嵌', icon: <Layers size={20} />, status: 'success' as const },
        { id: 'crop', label: '影像裁剪', icon: <Layout size={20} />, status: 'success' as const },
        { id: 'publish', label: '服务发布', icon: <Share2 size={20} />, status: 'success' as const },
        { id: 'end', label: '结束', icon: <Square size={16} />, status: 'success' as const },
    ];

    return baseSteps.map((step, idx) => {
        if (isSuccess) return { ...step, status: 'success' as const };
        if (isRunning) {
            if (idx < 4) return { ...step, status: 'success' as const };
            if (idx === 4) return { ...step, status: 'running' as const };
            if (idx === 5) return { ...step, status: 'pending' as const };
            return { ...step, status: 'pending' as const };
        }
        if (isFailed || isTerminated) {
            if (idx < 3) return { ...step, status: 'success' as const };
            if (idx === 3) return { ...step, status: 'failed' as const };
            return { ...step, status: 'pending' as const };
        }
        return { ...step, status: 'pending' as const };
    });
};

export const TaskCenter: React.FC<TaskCenterProps> = ({ 
  onViewDetail, 
  onOrchestrateTask, 
  autoOpenImport, 
  onImportModalClose 
}) => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('app_tasks');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_TASKS;
  });

  const [availablePipelines, setAvailablePipelines] = useState<ProductionLine[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks[0]?.id || null);
  const [simulatedProgress, setSimulatedProgress] = useState(58);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isOutputSelectorOpen, setIsOutputSelectorOpen] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [taskToTerminate, setTaskToTerminate] = useState<any>(null);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [taskToRestartId, setTaskToRestartId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [taskForLog, setTaskForLog] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isNodeInputModalOpen, setIsNodeInputModalOpen] = useState(false);
  const [currentNodeInfo, setCurrentNodeInfo] = useState<{ label: string, icon: React.ReactNode, status: NodeStatus } | null>(null);

  const [taskConfig, setTaskConfig] = useState({
    name: `[任务]_[${new Date().toISOString().slice(0,19).replace(/[-T:]/g,'')}]`,
    outputPath: '',
    taskType: 'once',
    errorStrategy: 'stop',
    alarmType: 'system'
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (autoOpenImport) {
        setIsImportModalOpen(true);
    }
  }, [autoOpenImport]);

  useEffect(() => {
    const savedLines = localStorage.getItem('production_list');
    if(savedLines) {
        setAvailablePipelines(JSON.parse(savedLines));
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedProgress(prev => {
        if (prev >= 99) return 58;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const selectedTask = useMemo(() => tasks.find((t: any) => t.id === selectedTaskId), [tasks, selectedTaskId]);

  const nodes = useMemo(() => {
    if (!selectedTask) return [];
    const pipeline = availablePipelines.find(p => p.name === selectedTask.source);
    return getPipelineStepsForTask(pipeline?.type || '其他', selectedTask.status);
  }, [selectedTask, availablePipelines]);

  const [activeTab, setActiveTab] = useState<'list' | 'draft'>('list');
  const [viewMode, setViewMode] = useState<'flow' | 'output'>('flow');

  const handleDeleteTask = (id: string) => {
    if(confirm('确认删除该任务吗？')) {
        setTasks((prev: any[]) => prev.filter((t: any) => t.id !== id));
        if (selectedTaskId === id) setSelectedTaskId(null);
    }
  };

  const handleOpenRestartModal = (id: string) => {
    setTaskToRestartId(id);
    setIsRestartModalOpen(true);
  };

  const confirmRestart = () => {
    if (taskToRestartId) {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      setTasks((prev: any[]) => prev.map((t: any) => 
        t.id === taskToRestartId ? { ...t, status: '进行中', start: now, end: '-' } : t
      ));
      setSelectedTaskId(taskToRestartId);
      setIsRestartModalOpen(false);
      setTaskToRestartId(null);
    }
  };

  const handleOpenTerminateModal = (task: any) => {
    setTaskToTerminate(task);
    setIsTerminateModalOpen(true);
  };

  const handleOpenLogModal = (task: any) => {
    setTaskForLog(task);
    setIsLogModalOpen(true);
  };

  const confirmTerminate = () => {
    if (taskToTerminate) {
        setTasks((prev: any[]) => prev.map((t: any) => 
            t.id === taskToTerminate.id ? { ...t, status: '已终止', end: new Date().toISOString().slice(0, 19).replace('T', ' ') } : t
        ));
        setIsTerminateModalOpen(false);
        setTaskToTerminate(null);
    }
  };

  const handleOpenEditModal = (task: any) => {
    setEditingTask({
        ...task,
        outputPath: task.outputPath || `[任务]_${task.id}_成果`,
        errorStrategy: task.errorStrategy || 'stop',
        alarmType: task.alarmType || 'system'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveTaskEdit = () => {
    if (editingTask) {
        setTasks((prev: any[]) => prev.map((t: any) => 
            t.id === editingTask.id ? { ...editingTask } : t
        ));
        setIsEditModalOpen(false);
        setEditingTask(null);
        alert('任务属性已保存');
    }
  };

  const handleEditTaskWorkflow = (task: any) => {
    const pipeline = availablePipelines.find(p => p.name === task.source);
    if (pipeline) onOrchestrateTask?.(pipeline);
    else if (availablePipelines.length > 0) onOrchestrateTask?.(availablePipelines[0]);
    else alert('未找到可编辑的产线模板，请先在产线管理中创建。');
  };

  const handleSaveConfigAndOrchestrate = () => {
    const dummyPipeline: ProductionLine = {
      id: `new-task-pl-${Date.now()}`,
      name: taskConfig.name,
      code: `task_${Date.now()}`,
      version: 'V1.0',
      type: '自定义任务产线',
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: '草稿',
      canvasData: {
        nodes: [
          { id: 'start', name: '开始', type: 'start', iconKey: 'PlayCircle', pos: { x: 300, y: 300 }, params: {} },
          { id: 'end', name: '结束', type: 'end', iconKey: 'Square', pos: { x: 800, y: 300 }, params: {} }
        ],
        connections: []
      }
    };
    setIsConfigModalOpen(false);
    onOrchestrateTask?.(dummyPipeline);
  };

  const handleNodeClick = (node: any) => {
    if (node.label === '开始' || node.label === '结束') return;
    setCurrentNodeInfo(node);
    setIsNodeInputModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative h-full font-['Noto_Sans_SC']">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes border-scroll {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes flow-particles {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .running-node-container {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }
      `}} />

      <div className="flex-[1.5] flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm min-h-0">
        <div className="px-6 py-4 flex items-center shrink-0 border-b border-slate-50">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full mr-3 shadow-md shadow-blue-500/20"></div>
          <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">任务列表</h2>
        </div>

        <div className="px-6 py-3 flex items-center justify-between shrink-0 bg-slate-50/20">
          <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200/50 backdrop-blur-sm">
            <button onClick={() => setActiveTab('list')} className={`px-6 h-8 rounded-md text-[13px] flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}>
              任务列表 <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-600 ring-1 ring-blue-100">{tasks.length}</span>
            </button>
            <button onClick={() => setActiveTab('draft')} className={`px-6 h-8 rounded-md text-[13px] flex items-center gap-2 transition-all ${activeTab === 'draft' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 font-medium'}`}>
              草稿箱 <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">3</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-72">
              <input type="text" placeholder="输入任务名称搜索..." className="w-full h-9 pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <button className="h-9 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"><RotateCcw size={14} className="text-blue-500" /> 刷新</button>
            <button className="h-9 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-600 font-bold hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"><Trash2 size={14} className="text-rose-400" /> 批量删除</button>
            
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center">
                <button onClick={() => setIsConfigModalOpen(true)} className="h-9 px-4 flex items-center gap-2 bg-blue-600 text-white rounded-l-lg text-[13px] font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 border-r border-blue-500/50"><Plus size={16} /> 创建任务</button>
                <button onClick={() => setShowCreateDropdown(!showCreateDropdown)} className="h-9 px-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"><ChevronDown size={16} className={`transition-transform duration-300 ${showCreateDropdown ? 'rotate-180' : ''}`} /></button>
              </div>
              {showCreateDropdown && (
                <div className="absolute right-0 top-full mt-2 w-[180px] bg-white rounded-xl shadow-2xl border border-slate-100 z-[110] py-2 animate-in fade-in slide-in-from-top-1">
                  <button onClick={() => { setIsImportModalOpen(true); setShowCreateDropdown(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 text-blue-600 hover:bg-blue-50 font-bold text-[14px] transition-colors"><LayoutGrid size={16} /> 从模板创建任务</button>
                  <button onClick={() => { setIsConfigModalOpen(true); setShowCreateDropdown(false); }} className="w-full px-4 py-2.5 flex items-center gap-3 text-slate-600 hover:bg-slate-50 font-bold text-[14px] transition-colors"><Plus size={16} /> 新建任务</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-[#f8fafc] text-slate-500 sticky top-0 z-10 border-b border-slate-100/50">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></th>
                <th className="px-4 py-4 font-bold text-slate-600">任务名称</th>
                <th className="px-4 py-4 font-bold text-slate-600">任务类型</th>
                <th className="px-4 py-4 font-bold text-slate-600">产线/算法</th>
                <th className="px-4 py-4 font-bold text-slate-600 text-center">任务状态</th>
                <th className="px-4 py-4 font-bold text-slate-600">最近开始时间</th>
                <th className="px-4 py-4 font-bold text-slate-600">最近结束时间</th>
                <th className="px-4 py-4 font-bold text-slate-600 text-left pl-6">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {tasks.map((task: any) => (
                <tr key={task.id} onClick={() => setSelectedTaskId(task.id)} className={`hover:bg-blue-50/40 transition-all group cursor-pointer ${selectedTaskId === task.id ? 'bg-blue-50/40' : ''}`}>
                  <td className="px-6 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" onClick={(e) => e.stopPropagation()} /></td>
                  <td className="px-4 py-4"><div className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{task.name}</div></td>
                  <td className="px-4 py-4">
                    <span className={`font-medium ${task.type === '定时任务' ? 'text-indigo-600' : 'text-slate-500'}`}>{task.type}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-medium">{task.source}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ring-1 ring-inset ${
                        task.status === '成功' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 
                        task.status === '进行中' || task.status === '运行中' ? 'bg-blue-50 text-blue-600 ring-blue-100' : 
                        task.status === '已终止' ? 'bg-slate-50 text-slate-500 ring-slate-100' :
                        'bg-rose-50 text-rose-500 ring-rose-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        task.status === '成功' ? 'bg-emerald-500' : 
                        task.status === '进行中' || task.status === '运行中' ? 'bg-blue-500 animate-pulse' : 
                        task.status === '已终止' ? 'bg-slate-400' :
                        'bg-rose-500'
                      }`} />
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-mono">{task.start}</td>
                  <td className="px-4 py-4 text-slate-400 font-mono">{task.end}</td>
                  <td className="px-4 py-4 text-left pl-6">
                    <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-all text-blue-600">
                      <button onClick={(e) => { e.stopPropagation(); onViewDetail?.(task.id); }} title="详情"><Eye size={16}/></button>
                      {(task.status === '失败' || task.status === '已终止') && (
                        <button onClick={(e) => { e.stopPropagation(); handleEditTaskWorkflow(task); }} title="任务流程编辑">
                          <Edit3 size={16}/>
                        </button>
                      )}
                      {(task.status === '失败' || task.status === '已终止') && (
                        <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(task); }} className="text-slate-500 hover:text-blue-600" title="任务属性编辑">
                          <Settings2 size={16}/>
                        </button>
                      )}
                      {(task.status === '进行中' || task.status === '运行中') && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenTerminateModal(task); }} 
                            className="text-orange-500 hover:text-orange-600" 
                            title="终止任务"
                        >
                            <Ban size={16} />
                        </button>
                      )}
                      {(task.status !== '进行中' && task.status !== '运行中') && (
                        <button onClick={(e) => { e.stopPropagation(); handleOpenRestartModal(task.id); }} title="重启"><Play size={16}/></button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleOpenLogModal(task); }} title="日志"><FileText size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="text-rose-400 hover:text-rose-600" title="删除"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="text-[12px] text-slate-500 font-bold">共 {tasks.length} 条数据</div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><ChevronLeft size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-[12px] font-black shadow-md shadow-blue-500/20">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm min-h-0 relative">
        <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-50">
          <div className="flex items-center">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full mr-3 shadow-md shadow-blue-500/20"></div>
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">任务进度视图</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
               <button onClick={() => setViewMode('flow')} className={`px-5 h-8 rounded-lg text-[13px] font-bold transition-all ${viewMode === 'flow' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>运行流程</button>
               <button onClick={() => setViewMode('output')} className={`px-5 h-8 rounded-lg text-[13px] font-bold transition-all ${viewMode === 'output' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>数据产出</button>
             </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/20 overflow-x-auto custom-scrollbar relative">
          {selectedTask ? (
              <div className="flex items-center gap-0 min-w-max relative px-20">
                {nodes.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <NodeComponent 
                        icon={node.icon} 
                        label={node.label} 
                        status={node.status} 
                        progress={node.status === 'running' ? simulatedProgress : undefined} 
                        onClick={() => handleNodeClick(node)}
                    />
                    {index < nodes.length - 1 && <FlowArrow status={node.status === 'success' ? 'success' : node.status === 'running' ? 'active' : 'pending'} />}
                  </React.Fragment>
                ))}
              </div>
          ) : (
              <div className="text-slate-300 font-bold italic animate-pulse">请先在上方列表选择一个任务以查看其具体的产线执行状态</div>
          )}
        </div>
      </div>

      <ImportPipelineModal visible={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); onImportModalClose?.(); }} onConfirm={(p) => { setIsImportModalOpen(false); onImportModalClose?.(); onOrchestrateTask?.(p); }} />

      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[800px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300 flex-1 min-h-0">
            <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-slate-100">
              <h3 className="text-[18px] font-extrabold text-slate-800">创建任务</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-all hover:rotate-90"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-10 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div className="space-y-6">
                <div className="flex items-center gap-3"><div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-md shadow-blue-500/20"></div><h4 className="text-[16px] font-bold text-slate-800">基本信息配置</h4></div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 任务名称</label>
                    <input type="text" placeholder="请输入任务名称" className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" value={taskConfig.name} onChange={(e) => setTaskConfig({...taskConfig, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 输出路径</label>
                    <div className="flex gap-3">
                      <input type="text" placeholder="[任务]_[20260128103823]_202601281736" className="flex-1 h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" value={taskConfig.outputPath} onChange={(e) => setTaskConfig({...taskConfig, outputPath: e.target.value})} />
                      <button onClick={() => setIsOutputSelectorOpen(true)} className="px-6 h-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold text-[14px] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap">浏览</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3"><div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-md shadow-blue-500/20"></div><h4 className="text-[16px] font-bold text-slate-800">调度配置</h4></div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 任务类型</label>
                    <div className="flex gap-12">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" checked={taskConfig.taskType === 'once'} onChange={() => setTaskConfig({...taskConfig, taskType: 'once'})} className="hidden" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${taskConfig.taskType === 'once' ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-300'}`}>{taskConfig.taskType === 'once' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />}</div>
                        <span className={`text-[14px] font-bold ${taskConfig.taskType === 'once' ? 'text-blue-600' : 'text-slate-600'}`}>一次性任务</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" checked={taskConfig.taskType === 'timer'} onChange={() => setTaskConfig({...taskConfig, taskType: 'timer'})} className="hidden" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${taskConfig.taskType === 'timer' ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-300'}`}>{taskConfig.taskType === 'timer' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}</div>
                        <span className={`text-[14px] font-bold ${taskConfig.taskType === 'timer' ? 'text-blue-600' : 'text-slate-600'}`}>定时任务</span>
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 失败策略</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-4 appearance-none bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer shadow-sm" value={taskConfig.errorStrategy} onChange={(e) => setTaskConfig({...taskConfig, errorStrategy: e.target.value})}>
                          <option value="stop">停止</option>
                          <option value="ignore">忽略并继续</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 报警方式</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-4 appearance-none bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer shadow-sm" value={taskConfig.alarmType} onChange={(e) => setTaskConfig({...taskConfig, alarmType: e.target.value})}>
                          <option value="system">系统通知</option>
                          <option value="email">邮件通知</option>
                          <option value="sms">短信通知</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-center gap-6 shrink-0">
              <button onClick={() => setIsConfigModalOpen(false)} className="w-40 h-12 rounded-xl border-2 border-blue-600 text-blue-600 font-black text-[15px] hover:bg-blue-50 transition-all shadow-sm active:scale-95">取消</button>
              <button onClick={handleSaveConfigAndOrchestrate} className="w-40 h-12 rounded-xl bg-blue-600 text-white font-black text-[15px] hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95">保存配置</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[800px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300">
            <div className="px-8 py-6 flex items-center gap-3 bg-white border-b border-slate-100">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Settings2 size={20} /></div>
              <h3 className="text-[18px] font-extrabold text-slate-800">任务属性编辑</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600 transition-all hover:rotate-90"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-10 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div className="space-y-6">
                <div className="flex items-center gap-3"><div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-md shadow-blue-500/20"></div><h4 className="text-[16px] font-bold text-slate-800">基本信息配置</h4></div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 任务名称</label>
                    <input type="text" value={editingTask.name} onChange={(e) => setEditingTask({...editingTask, name: e.target.value})} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 输出路径</label>
                    <div className="flex gap-3">
                      <input type="text" value={editingTask.outputPath} onChange={(e) => setEditingTask({...editingTask, outputPath: e.target.value})} className="flex-1 h-12 px-4 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
                      <button onClick={() => setIsOutputSelectorOpen(true)} className="px-6 h-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold text-[14px] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap">浏览</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-center gap-6 shrink-0">
              <button onClick={() => setIsEditModalOpen(false)} className="w-40 h-12 rounded-xl border-2 border-blue-600 text-blue-600 font-black text-[15px] hover:bg-blue-50 transition-all active:scale-95 shadow-sm">取消修改</button>
              <button onClick={handleSaveTaskEdit} className="w-40 h-12 rounded-xl bg-blue-600 text-white font-black text-[15px] hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all active:scale-95">保存配置</button>
            </div>
          </div>
        </div>
      )}

      {isTerminateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-8 relative animate-in zoom-in duration-300">
             <button onClick={() => setIsTerminateModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
             <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6"><AlertCircle size={40} className="text-rose-500" strokeWidth={2.5} /></div>
               <h3 className="text-[18px] font-bold text-slate-800 mb-2">终止任务确认</h3>
               <p className="text-slate-500 text-[14px] mb-8 font-medium leading-relaxed">您确认要终止当前运行任务？<br/>终止后该任务实例将立即停止。</p>
               <div className="flex w-full gap-4">
                  <button onClick={() => setIsTerminateModalOpen(false)} className="flex-1 h-10 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">取消</button>
                  <button onClick={confirmTerminate} className="flex-1 h-10 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-95">确定终止</button>
               </div>
             </div>
           </div>
        </div>
      )}

      {isRestartModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-8 relative animate-in zoom-in duration-300">
             <button onClick={() => setIsRestartModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
             <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6"><RotateCcw size={40} className="text-blue-600" strokeWidth={2.5} /></div>
               <h3 className="text-[18px] font-bold text-slate-800 mb-2">重启任务确认</h3>
               <p className="text-slate-500 text-[14px] mb-8 font-medium leading-relaxed">您确定要重启该任务吗？<br/>重启后，任务将重置并从起始节点开始执行。</p>
               <div className="flex w-full gap-4">
                  <button onClick={() => setIsRestartModalOpen(false)} className="flex-1 h-10 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">取消</button>
                  <button onClick={confirmRestart} className="flex-1 h-10 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95">确定重启</button>
               </div>
             </div>
           </div>
        </div>
      )}

      {isLogModalOpen && taskForLog && (
        <div className="fixed inset-0 z-[250] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsLogModalOpen(false)} />
          <div className="relative w-[560px] h-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500 font-['Noto_Sans_SC']">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Terminal size={24} /></div>
                 <div>
                    <h3 className="text-[19px] font-black text-slate-900 tracking-tight leading-none mb-1.5">任务执行日志</h3>
                    <p className="text-[12px] text-slate-400 font-medium">查看节点参数及输入数据</p>
                 </div>
               </div>
               <button onClick={() => setIsLogModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all hover:rotate-90">
                 <X size={28} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 bg-white relative">
              {(MOCK_LOGS[taskForLog.status === '失败' ? 'failed' : 'default']).map((log, idx) => (
                <div key={idx} className="relative animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[16px] font-black text-slate-900">{log.title}</h4>
                    </div>
                    <p className="text-[12px] font-mono font-bold text-slate-400">{log.time}</p>
                  </div>

                  <div className="space-y-1.5 overflow-hidden">
                    <div className="text-[13px] text-slate-600 font-medium leading-relaxed bg-[#F8FAFC] p-4 rounded-xl">
                        {log.detail}
                    </div>

                    {log.result && (
                        <div className="flex items-start gap-3 text-[13px] text-[#2563EB] font-black bg-[#EFF6FF] p-4 rounded-xl">
                            <FileIcon size={18} className="shrink-0 mt-0.5 opacity-80" />
                            <span className="leading-relaxed">{log.result}</span>
                        </div>
                    )}

                    {log.extra && (
                        <div className="flex items-start gap-3 text-[13px] text-[#059669] font-black bg-[#ECFDF5] p-4 rounded-xl">
                            <ShieldCheck size={18} className="shrink-0 mt-0.5 opacity-80" />
                            <span className="leading-relaxed">{log.extra}</span>
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white border-t border-slate-100 shrink-0">
               <button className="w-full h-14 bg-[#0F172A] text-white rounded-xl font-black text-[15px] flex items-center justify-center gap-3 hover:bg-black shadow-2xl shadow-slate-900/20 transition-all active:scale-[0.98] group">
                 <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> 
                 下载运行日志报告
               </button>
            </div>
          </div>
        </div>
      )}

      {isNodeInputModalOpen && currentNodeInfo && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-10 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-[1000px] max-h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-500 border border-slate-100">
                  <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl shadow-lg flex items-center justify-center transition-all ${
                              currentNodeInfo.status === 'success' ? 'bg-[#ECFDF5] text-[#10B981] shadow-emerald-100' :
                              currentNodeInfo.status === 'running' ? 'bg-blue-50 text-blue-600 shadow-blue-100' :
                              'bg-slate-50 text-slate-400 shadow-slate-100'
                          }`}>
                              {currentNodeInfo.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-[18px] font-black text-slate-800 tracking-tight">{currentNodeInfo.label}</h3>
                            </div>
                            <p className="text-[12px] text-slate-400 font-medium">查看节点参数及输入数据</p>
                          </div>
                      </div>
                      <button onClick={() => setIsNodeInputModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"><X size={28} strokeWidth={2.5} /></button>
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar p-8 space-y-8 bg-[#F8FAFC]/50">
                      {/* 节点运行参数展示 */}
                      <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-[14px] font-black text-slate-700 flex items-center gap-2">
                              <Settings2 size={16} className="text-blue-500" />
                              节点运行参数
                            </h4>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            {ALGO_CONFIG_MAP[currentNodeInfo.label.replace(/\d+$/, '').replace(/\*$/, '')] ? (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    {ALGO_CONFIG_MAP[currentNodeInfo.label.replace(/\d+$/, '').replace(/\*$/, '')].map((param, idx) => (
                                        <div key={idx} className="flex flex-col gap-1.5 border-b border-slate-50 pb-4 last:border-0">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{param.label}</span>
                                              {param.required && <span className="text-rose-500 text-[10px]">*</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {param.type === 'date' && <Calendar size={14} className="text-blue-400" />}
                                                {param.type === 'file' && <FileSearch size={14} className="text-blue-400" />}
                                                {param.type === 'select' && <List size={14} className="text-blue-400" />}
                                                <span className="text-[14px] font-bold text-slate-700">
                                                  {currentNodeInfo.params?.[param.label] || param.defaultValue || (param.type === 'select' ? param.options?.[0] : '-') || '系统默认配置'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-slate-400 py-4 italic">
                                    <Info size={16} />
                                    <span className="text-[13px]">该节点在执行时未配置特定运行参数。</span>
                                </div>
                            )}
                          </div>
                      </div>

                      {/* 输入文件清单 */}
                      <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <h4 className="text-[14px] font-black text-slate-700 flex items-center gap-2">
                                    <Database size={16} className="text-blue-500" />
                                    输入文件清单
                                </h4>
                                <div className="group relative">
                                    <HelpCircle size={16} className="text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
                                    <div className="absolute left-0 bottom-full mb-2 w-80 p-3 bg-slate-900/95 backdrop-blur shadow-2xl text-white text-[12px] rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 z-[500] leading-relaxed border border-white/10 font-medium">
                                        该环节共接收到 <strong className="text-blue-400 font-black">{NODE_INPUT_DATA_MOCK[currentNodeInfo.label.replace(/\*$/, '')]?.length || 0}</strong> 个上游传递的参数或文件项，作为本算子执行的初始上下文。您可以查看数据的大小、来源及存放路径。
                                        <div className="absolute top-full left-4 -translate-y-1 border-8 border-transparent border-t-slate-900/95" />
                                    </div>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-lg">
                                共 {NODE_INPUT_DATA_MOCK[currentNodeInfo.label.replace(/\*$/, '')]?.length || 0} 个资源项
                            </span>
                          </div>

                          {/* 增强型表格或占位 - 已删除固定 min-h 以适配自动伸缩 */}
                          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                              {((currentNodeInfo.status === 'running' || currentNodeInfo.status === 'pending') && (!NODE_INPUT_DATA_MOCK[currentNodeInfo.label.replace(/\*$/, '')] || NODE_INPUT_DATA_MOCK[currentNodeInfo.label.replace(/\*$/, '')].length === 0)) ? (
                                  /* 输入数据传输准备中占位样式 */
                                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500 min-h-[300px]">
                                      <div className="relative mb-8">
                                          <div className="w-24 h-24 rounded-full bg-[#EBF2FF] flex items-center justify-center">
                                              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-[spin_2s_linear_infinite]"></div>
                                          </div>
                                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-50">
                                              <RefreshCcw size={20} className="text-blue-500 animate-[spin_4s_linear_infinite_reverse]" />
                                          </div>
                                      </div>
                                      <h4 className="text-[20px] font-black text-[#1E293B] mb-3 tracking-tight">输入数据传输准备中...</h4>
                                      <div className="max-w-md space-y-1">
                                          <p className="text-[14px] text-slate-400 font-medium leading-relaxed">当前任务尚未推进至本算子节点，系统正在等待前序环</p>
                                          <p className="text-[14px] text-slate-400 font-medium leading-relaxed">节成果生成并同步上下文数据，请稍后查看。</p>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#f8faff] text-slate-500 font-black sticky top-0 z-10 border-b border-slate-100">
                                            <tr className="text-[12px] uppercase tracking-wider">
                                                <th className="px-6 py-4">名称</th>
                                                <th className="px-6 py-4 w-28">大小</th>
                                                <th className="px-6 py-4 w-28">类型</th>
                                                <th className="px-6 py-4 w-44">输入时间</th>
                                                <th className="px-6 py-4">存放路径</th>
                                                <th className="px-6 py-4 w-36 text-center">数据来源</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(NODE_INPUT_DATA_MOCK[currentNodeInfo.label.replace(/\*$/, '')] || []).map((file, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50/20 transition-all group h-14">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <FileIcon size={18} className="text-blue-400 opacity-70" />
                                                            <span className="text-[14px] font-bold text-slate-700 truncate max-w-[320px] group-hover:text-blue-600 transition-colors">
                                                                {file.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 font-mono text-[14px]">{file.size}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-black text-[10px] rounded border border-slate-200 uppercase tracking-tighter whitespace-nowrap">
                                                            {file.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 font-mono text-[14px] tracking-tighter whitespace-nowrap">{file.time}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                            <FolderOpen size={14} className="shrink-0" />
                                                            <span className="text-[14px] font-medium truncate max-w-[150px]">{file.path}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 text-slate-500 font-bold text-[12px] transition-all whitespace-nowrap group-hover:bg-blue-50 group-hover:text-blue-600">
                                                            <User size={12} className="opacity-60" />
                                                            {file.source}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!NODE_INPUT_DATA_MOCK[currentNodeInfo.label.replace(/\*$/, '')] || NODE_INPUT_DATA_MOCK[currentNodeInfo.label.replace(/\*$/, '')].length === 0) && (
                                                <tr>
                                                    <td colSpan={6} className="py-24 text-center">
                                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                                            <AlertCircle size={48} className="opacity-10" />
                                                            <p className="text-[14px] font-medium">暂无输入数据项</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
                  <div className="px-10 py-6 border-t border-slate-100 flex justify-end items-center shrink-0 bg-white">
                     <button onClick={() => setIsNodeInputModalOpen(false)} className="px-10 h-11 border border-slate-200 text-slate-600 rounded-xl font-black text-[14px] hover:bg-slate-50 transition-all shadow-sm">关闭详情</button>
                  </div>
              </div>
          </div>
      )}

      <DataResourceSelector visible={isOutputSelectorOpen} title="选择输出成果目录" rootName="我的输入数据" storageKey="app_data_products" selectionType="folder" onClose={() => setIsOutputSelectorOpen(false)} onConfirm={(path) => { setTaskConfig({...taskConfig, outputPath: typeof path === 'string' ? path : path.name}); setIsOutputSelectorOpen(false); }} />
    </div>
  );
};
