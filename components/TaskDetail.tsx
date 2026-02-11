import React, { useState, useMemo, useEffect } from 'react';
import { 
  Undo2, 
  Clipboard, 
  Clock, 
  User, 
  FileText, 
  History, 
  Activity, 
  AlertCircle,
  Layout,
  Info,
  Layers,
  Map,
  Inbox,
  Send,
  Plus,
  Minus,
  FileArchive,
  Folder,
  ChevronRight,
  File,
  Zap,
  PlayCircle,
  Bug,
  Crop,
  CloudUpload,
  Square,
  CheckCircle2,
  CalendarRange,
  Pause,
  Play,
  Ban,
  Power,
  XCircle,
  Database,
  Share2,
  Loader2,
  FileImage,
  ChevronDown,
  Timer,
  Search,
  FolderOpen,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileCheck,
  Globe,
  Copy,
  Eye,
  EyeOff,
  ArrowLeft,
  Download
} from 'lucide-react';
import { getPipelineStepsForTask } from './TaskCenter';
import { ResourceItem } from '../types';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
}

type TabType = 'info' | 'flow' | 'range' | 'input' | 'output';

const NODE_OUTPUT_MOCK_DATA: Record<string, any[]> = {
  '数据采集': [
    { name: 'Sentinel2_L2A_Raw_CloudFree.zip', size: '1.2GB', type: 'zip', date: '2026-01-16 14:30:12' },
    { name: 'Metadata_Report.json', size: '12KB', type: 'json', date: '2026-01-16 14:30:15' }
  ],
  '波段合成': [
    { name: 'Bands_Merged_Stack_432.tif', size: '3.5GB', type: 'tif', date: '2026-01-16 14:45:22' },
    { name: 'Histogram_Stats.xml', size: '45KB', type: 'xml', date: '2026-01-16 14:45:25' }
  ],
  '影像镶嵌': [
    { name: 'Mosaic_Full_Coverage.tif', size: '8.2GB', type: 'tif', date: '2026-01-16 15:10:05' },
    { name: 'Seamline_Vector.shp', size: '2.1MB', type: 'shp', date: '2026-01-16 15:10:10' }
  ],
  '影像裁剪': [
    { name: 'Area_Of_Interest_Subscene.tif', size: '890MB', type: 'tif', date: '2026-01-16 15:30:44' }
  ],
  '服务发布': [
    { name: 'OGC_WMTS_Capabilities.xml', size: '128KB', type: 'xml', date: '2026-01-16 15:45:00' }
  ]
};

const FALLBACK_TASKS = [
    { id: '1', name: '[任务]_[20260116142424]_生产测试', type: '一次性任务', source: '测试最新-xx-0106', status: '运行中', start: '2026-01-16 14:24:24', end: '-' },
    { id: 'sch-1', name: '[定时]湖北省哨兵数据日更采集_实例0117', type: '定时任务', pipelineName: '哨兵数据自动化采集产线', cycle: '每天 02:00', status: '运行中', schedulingStatus: '调度中', start: '2026-01-17 02:00:15', end: '-', lastRun: '2026-01-16 02:00:15', nextRun: '2026-01-17 02:00:00' },
];

export const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['数据采集']));

  const taskDataFromStorage = useMemo(() => {
    const savedTasks = localStorage.getItem('app_tasks');
    const savedScheduled = localStorage.getItem('app_scheduled_tasks');
    
    const tasks = savedTasks ? JSON.parse(savedTasks) : FALLBACK_TASKS;
    const scheduled = savedScheduled ? JSON.parse(savedScheduled) : FALLBACK_TASKS.filter(t => t.id.startsWith('sch-'));
    
    const allTasks = [...tasks, ...scheduled];
    const found = allTasks.find((t: any) => t.id === taskId);
    
    if (found) {
        let status = found.status;
        if (status === '进行中') status = '运行中';
        return {
            ...found,
            status,
            source: found.source || found.pipelineName || '未知算子'
        };
    }
    return allTasks[0];
  }, [taskId]);

  const [taskStatus, setTaskStatus] = useState('运行中');
  const [schedulingStatus, setSchedulingStatus] = useState('调度中');

  useEffect(() => {
    if (taskDataFromStorage) {
        setTaskStatus(taskDataFromStorage.status || '运行中');
        setSchedulingStatus(taskDataFromStorage.schedulingStatus || (taskDataFromStorage.type === '定时任务' ? '调度中' : '无调度'));
        setActiveTab('info');
    }
  }, [taskId, taskDataFromStorage]);

  const updatePersistedStatus = (newTaskStatus: string, newSchedStatus: string) => {
    const storageKeys = ['app_tasks', 'app_scheduled_tasks'];
    storageKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            const list = JSON.parse(data);
            const updated = list.map((t: any) => t.id === taskId ? { ...t, status: newTaskStatus, schedulingStatus: newSchedStatus } : t);
            localStorage.setItem(key, JSON.stringify(updated));
        }
    });
  };

  const isScheduledTask = useMemo(() => 
    taskId.startsWith('sch-') || taskDataFromStorage?.type === '定时任务' || taskDataFromStorage?.cycle !== undefined, 
    [taskId, taskDataFromStorage]
  );

  const flowNodes = useMemo(() => {
    return getPipelineStepsForTask(taskDataFromStorage?.source || '其他', taskStatus);
  }, [taskDataFromStorage, taskStatus]);

  const successfulNodes = useMemo(() => {
    return flowNodes.filter(node => node.status === 'success' && node.label !== '开始' && node.label !== '结束');
  }, [flowNodes]);

  const inputFiles = useMemo(() => {
    if (taskDataFromStorage?.inputFiles) return taskDataFromStorage.inputFiles;
    if (taskDataFromStorage?.name?.includes('测试') || taskDataFromStorage?.name?.includes('湖北')) {
        return [
            { id: 'in1', name: 'GF2_PMS1_E114.1_N22.8_20221012.tif', size: '1.4GB', type: 'tif', path: '/我的输入数据/湖北省/GF2_Archive' },
            { id: 'in2', name: 'GF2_PMS1_E114.1_N22.8_20221012.xml', size: '45KB', type: 'xml', path: '/我的输入数据/湖北省/GF2_Archive' }
        ];
    }
    return [];
  }, [taskDataFromStorage]);

  const handlePause = () => {
    if (confirm('确认暂停当前定时调度吗？暂停后将不再自动触发新实例。')) {
      setSchedulingStatus('暂停调度');
      setTaskStatus('已终止');
      updatePersistedStatus('已终止', '暂停调度');
    }
  };

  const handleEnable = () => {
    setSchedulingStatus('调度中');
    setTaskStatus('运行中');
    updatePersistedStatus('运行中', '调度中');
  };

  const handleTerminate = () => {
    if (confirm('确认终止此定时任务调度吗？终止后将不再自动产生新的执行实例。')) {
      setSchedulingStatus('终止调度');
      setTaskStatus('已终止');
      updatePersistedStatus('已终止', '终止调度');
    }
  };

  const toggleFolder = (label: string) => {
    const next = new Set(expandedFolders);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setExpandedFolders(next);
  };

  const tabs = [
    { id: 'info', label: '基本信息', icon: <Info size={14} /> },
    { id: 'flow', label: '产线视图', icon: <Layers size={14} /> },
    { id: 'range', label: '任务范围', icon: <Map size={14} /> },
    { id: 'input', label: '输入数据', icon: <Inbox size={14} /> },
    { id: 'output', label: '输出数据', icon: <Send size={14} /> },
  ];

  const getTaskStatusColor = (status: string) => {
    switch(status) {
        case '运行中': return 'text-blue-600 bg-blue-50 border-blue-100';
        case '成功': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case '失败': return 'text-rose-600 bg-rose-50 border-rose-100';
        case '已终止': return 'text-slate-500 bg-slate-100 border-slate-200';
        default: return 'text-slate-400 bg-slate-50 border-slate-50';
    }
  };

  const getSchedStatusColor = (status: string) => {
    switch(status) {
        case '调度中': return 'text-blue-600 bg-blue-50 border-blue-100';
        case '暂停调度': return 'text-amber-600 bg-amber-50 border-amber-100';
        case '终止调度': return 'text-slate-500 bg-slate-100 border-slate-200';
        default: return 'text-slate-400 bg-slate-50 border-slate-50';
    }
  };

  const getFileIcon = (item: ResourceItem | any, size: number = 24) => {
    if (item.type === 'folder') return <Folder size={size} fill="currentColor" strokeWidth={0} className="text-blue-400 opacity-80" />;
    switch (item.fileType || item.type) {
      case 'tif': return <FileImage size={size} className="text-blue-500" />;
      case 'zip': return <FileArchive size={size} className="text-indigo-500" />;
      case 'json': return <FileJson size={size} className="text-amber-500" />;
      case 'xml': return <FileCode size={size} className="text-rose-500" />;
      default: return <FileText size={size} className="text-slate-400" />;
    }
  };

  if (!taskDataFromStorage) return <div className="p-12 text-center text-slate-400 font-bold">任务数据不存在或正在加载...</div>;

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 overflow-hidden h-full font-['Noto_Sans_SC']">
      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm min-h-0">
        <div className="px-8 py-4 flex items-center justify-between border-b border-slate-100/50 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full shadow-sm shadow-blue-500/20"></div>
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight leading-none">任务详情</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {isScheduledTask && schedulingStatus !== '终止调度' && (
              <div className="flex items-center gap-2 mr-4 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {schedulingStatus === '调度中' ? (
                  <button onClick={handlePause} className="flex items-center gap-1.5 px-3 h-7 rounded-md bg-amber-500 text-white font-bold text-[12px] hover:bg-amber-600 transition-all shadow-sm">
                    <Pause size={14} /> 暂停调度
                  </button>
                ) : (
                  <button onClick={handleEnable} className="flex items-center gap-1.5 px-3 h-7 rounded-md bg-emerald-500 text-white font-bold text-[12px] hover:bg-emerald-600 transition-all shadow-sm">
                    <Play size={14} /> 启用调度
                  </button>
                )}
                <button onClick={handleTerminate} className="flex items-center gap-1.5 px-3 h-7 rounded-md bg-white border border-rose-200 text-rose-500 font-bold text-[12px] hover:bg-rose-50 transition-all">
                  <Ban size={14} /> 终止调度
                </button>
              </div>
            )}
            <button onClick={onBack} className="flex items-center gap-2 px-5 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-300 transition-all text-[13px] shadow-sm active:scale-95 group">
              <Undo2 size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> 
              <span>返回</span>
            </button>
          </div>
        </div>

        <div className="px-8 pt-3 flex items-end gap-1 border-b border-slate-100/50 shrink-0 bg-slate-50/40">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-7 py-2.5 text-[14px] font-bold transition-all duration-300 rounded-t-xl relative border-x border-t flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 border-slate-100 -mb-[1px] z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]' 
                  : 'text-slate-400 bg-transparent border-transparent hover:text-slate-600 hover:bg-white/40'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'text-blue-500' : 'text-slate-300'}`}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <>
                  <div className="absolute -bottom-[2px] left-0 w-full h-[3px] bg-white z-20" />
                  <div className="absolute top-0 left-0 w-full h-[2.5px] bg-blue-500 rounded-t-full" />
                </>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar bg-white">
          {activeTab === 'info' && (
            <div className="max-w-[1400px] animate-in fade-in slide-in-from-top-1 duration-500 mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-200/50 pb-4">
                      <div className="p-1.5 bg-blue-600 rounded-lg text-white"><Clipboard size={18} /></div>
                      <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">任务核心标识</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">任务名称</label>
                        <div className="text-[15px] font-bold text-slate-800 bg-white border border-slate-100 p-3 rounded-xl shadow-sm">{taskDataFromStorage?.name || '-'}</div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">关联产线/算法</label>
                        <div className="text-[15px] font-bold text-blue-600 bg-blue-50/50 border border-blue-100/50 p-3 rounded-xl shadow-sm flex items-center justify-between group cursor-pointer">
                          <span>{taskDataFromStorage?.source || '-'}</span>
                          <Layout size={14} className="opacity-40 group-hover:opacity-100" />
                        </div>
                      </div>

                      {/* 修改部分：将任务状态、调度状态、调度周期放在同一行 */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">任务状态</label>
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold border shadow-sm transition-all duration-300 w-full ${getTaskStatusColor(taskStatus)}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${taskStatus === '运行中' ? 'bg-blue-500 animate-pulse' : taskStatus === '成功' ? 'bg-emerald-500' : taskStatus === '失败' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                            <span className="text-[14px]">{taskStatus}</span>
                          </div>
                        </div>
                        {isScheduledTask && (
                          <>
                            <div className="space-y-1.5">
                              <label className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">调度状态</label>
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold border shadow-sm transition-all duration-300 w-full ${getSchedStatusColor(schedulingStatus)}`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${schedulingStatus === '调度中' ? 'bg-blue-500 animate-pulse' : schedulingStatus === '暂停调度' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                <span className="text-[14px]">{schedulingStatus}</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">调度周期</label>
                              <div className="text-[14px] font-bold text-indigo-600 bg-white border border-slate-100 p-3 rounded-xl shadow-sm h-[42px] flex items-center">{taskDataFromStorage?.cycle || '自定义调度'}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-200/50 pb-4">
                      <div className="p-1.5 bg-indigo-600 rounded-lg text-white"><Activity size={18} /></div>
                      <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">运行执行详情</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                         <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400"><User size={20} /></div>
                         <div className="flex-1">
                           <p className="text-[12px] font-bold text-slate-400 mb-1">创建人员</p>
                           <p className="text-[15px] font-bold text-slate-800">系统管理员</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                         <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400"><Clock size={20} /></div>
                         <div className="flex-1">
                           <p className="text-[12px] font-bold text-slate-400 mb-1">执行总耗时</p>
                           <p className="text-[15px] font-bold text-slate-800">{(taskStatus === '成功' || taskStatus === '运行中') ? '1分 45秒' : '中断于 2分 10秒'}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-6">
                    <div className="mt-2 space-y-3">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><FileText size={14} /> 任务描述备注</label>
                      <div className="w-full p-5 bg-white rounded-xl border border-slate-100 text-[14px] text-slate-600 font-medium leading-relaxed shadow-sm min-h-[80px]">
                        {taskDataFromStorage?.description || '该任务由系统自动生成，用于处理时空数智相关业务数据流水。'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative ${
                      (taskStatus === '运行中') ? 'bg-blue-50' : taskStatus === '成功' ? 'bg-emerald-50' : taskStatus === '已终止' ? 'bg-slate-50' : 'bg-rose-50'
                    }`}>
                      {(taskStatus === '运行中') ? (
                        <Loader2 size={48} className="text-blue-500 animate-spin" strokeWidth={2.5} />
                      ) : taskStatus === '成功' ? (
                        <CheckCircle2 size={48} className="text-emerald-500" strokeWidth={2.5} />
                      ) : (taskStatus === '已终止') ? (
                        <Ban size={48} className="text-slate-400" strokeWidth={2.5} />
                      ) : (
                        <AlertCircle size={48} className="text-rose-500" strokeWidth={2.5} />
                      )}
                      {(taskStatus === '运行中') && (<div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-20" />)}
                    </div>
                    <div className={`px-6 py-2 rounded-full text-[16px] font-black uppercase tracking-widest border mb-3 transition-all duration-300 ${getTaskStatusColor(taskStatus)}`}>{taskStatus}</div>
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-[240px]">
                      {(taskStatus === '运行中') ? '任务正在执行计算节点，请耐心等待...' : 
                       taskStatus === '成功' ? '所有流程节点已成功运行完毕，成果已入库。' : 
                       (taskStatus === '已终止') ? (schedulingStatus === '暂停调度' ? '任务调度已暂停，可手动重新启用。' : '任务已被手动终止。') : '流程运行异常，请检查日志。'}
                    </p>
                  </div>

                  <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6"><History size={18} className="text-slate-400" /><h3 className="text-[14px] font-bold text-slate-800 tracking-tight">时间追溯</h3></div>
                    <div className="relative pl-6 border-l border-slate-200 space-y-8">
                       <div className="relative">
                         <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                         <p className="text-[12px] font-bold text-slate-400 mb-1">最近开始时间</p>
                         <p className="text-[14px] font-mono font-bold text-slate-700">{taskDataFromStorage?.start || taskDataFromStorage?.lastRun || '-'}</p>
                       </div>
                       <div className="relative">
                         <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-slate-300 border-2 border-white shadow-sm" />
                         <p className="text-[12px] font-bold text-slate-400 mb-1">最近结束时间</p>
                         <p className="text-[14px] font-mono font-bold text-slate-700">{taskDataFromStorage?.end || '-'}</p>
                       </div>
                       {isScheduledTask && (
                        <div className="relative">
                          <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                          <p className="text-[12px] font-bold text-slate-400 mb-1">预计下次执行</p>
                          <p className="text-[14px] font-mono font-bold text-emerald-600">{schedulingStatus === '调度中' ? (taskDataFromStorage?.nextRun || '-') : '-'}</p>
                        </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="max-w-[1400px] animate-in fade-in duration-700 mx-auto flex flex-col h-full">
              <div className="flex-1 min-h-[500px] border border-slate-100 rounded-3xl p-12 bg-white shadow-sm flex flex-col mb-4 overflow-x-auto custom-scrollbar relative">
                <div className="flex items-center justify-between mb-16 shrink-0">
                  <div className="flex items-center gap-2"><div className="w-1 h-4 bg-blue-600 rounded-full"></div><h3 className="text-[15px] font-bold text-slate-800">任务运行节点进度</h3></div>
                  <div className={`px-4 py-1.5 rounded-lg border text-[12px] font-bold ${getTaskStatusColor(taskStatus)}`}>当前任务状态: {taskStatus}</div>
                </div>
                <div className="flex-1 flex items-center justify-center min-w-max px-20">
                   <div className="flex items-center gap-0 relative">
                     {flowNodes.map((node, index) => (
                       <React.Fragment key={node.id}>
                         <div className="flex flex-col items-center z-10 group">
                           <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all duration-500 relative shrink-0 ${
                               node.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                               node.status === 'running' ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]' :
                               node.status === 'failed' ? 'bg-rose-50 border-rose-400 text-rose-600' : 'bg-white border-slate-100 text-slate-300 opacity-60'
                           }`}>
                             <div className={`transition-transform duration-300 ${node.status !== 'pending' ? 'group-hover:scale-110' : ''}`}>{node.icon}</div>
                             {node.status === 'success' && (<div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md border-2 border-emerald-500"><CheckCircle2 size={16} className="text-emerald-500" /></div>)}
                             {node.status === 'failed' && (<div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md border-2 border-rose-500"><XCircle size={16} className="text-rose-500" /></div>)}
                             {node.status === 'running' && (<div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-md border-2 border-blue-500"><Loader2 size={16} className="text-blue-500 animate-spin" /></div>)}
                           </div>
                           <span className={`mt-4 text-[14px] font-bold tracking-tight transition-colors ${node.status === 'pending' ? 'text-slate-300' : 'text-slate-600'}`}>{node.label}</span>
                         </div>
                         {index < flowNodes.length - 1 && (
                           <div className="w-24 h-24 flex items-center justify-center px-2 shrink-0">
                             <div className={`w-full h-[3px] rounded-full relative overflow-hidden ${node.status === 'success' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                               {node.status === 'success' && (<div className="absolute inset-0 w-full h-full bg-emerald-500/20" />)}
                               {node.status === 'running' && (<div className="absolute inset-0 w-full h-full animate-[flow_2s_infinite] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />)}
                               <div className={`absolute right-0 top-1/2 -translate-y-1/2 border-l-[8px] border-y-[6px] border-y-transparent ${node.status === 'success' ? 'border-l-emerald-300' : 'border-l-slate-200'}`}></div>
                             </div>
                           </div>
                         )}
                       </React.Fragment>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'input' && (
            <div className="max-w-[1400px] animate-in fade-in duration-500 mx-auto">
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    {inputFiles.length > 0 ? (
                        <table className="w-full text-left text-[14px] border-collapse">
                            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 w-[50%]">名称</th>
                                    <th className="px-8 py-5">大小</th>
                                    <th className="px-8 py-5">类型</th>
                                    <th className="px-8 py-5">原始路径</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {inputFiles.map((file: any) => (
                                    <tr key={file.id} className="hover:bg-blue-50/20 transition-all group">
                                        <td className="px-8 py-4 flex items-center gap-3">
                                            <div className="shrink-0">{getFileIcon(file, 20)}</div>
                                            <span className="font-black text-slate-800 truncate">{file.name}</span>
                                        </td>
                                        <td className="px-8 py-4 text-slate-500 font-mono text-[13px]">{file.size}</td>
                                        <td className="px-8 py-4 text-slate-400 uppercase text-[12px]">{file.type}</td>
                                        <td className="px-8 py-4 text-slate-400 text-[13px] truncate max-w-[300px]" title={file.path}>
                                            <div className="flex items-center gap-2 italic">
                                                <FolderOpen size={14} className="text-slate-300" />
                                                {file.path || '/系统根目录/数据采集/历史存档'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                                    <Inbox size={48} className="text-slate-200" strokeWidth={1.5} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                                    <AlertCircle size={18} className="text-slate-300" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-[16px] font-black text-slate-400 tracking-tight">该任务没有输入文件</p>
                                <p className="text-[13px] text-slate-300 font-medium">任务可能直接调用了数据服务或尚未指定输入源</p>
                            </div>
                            {taskDataFromStorage?.outputPath && (
                                <div className="mt-4 px-6 py-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">成果路径:</span>
                                    <span className="text-[13px] font-mono font-bold text-slate-600">{taskDataFromStorage.outputPath}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="max-w-[1400px] animate-in fade-in duration-500 mx-auto">
               <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                 <table className="w-full text-left text-[14px] border-collapse">
                   <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                     <tr>
                       <th className="px-8 py-5 w-[60%]">名称</th>
                       <th className="px-8 py-5">大小</th>
                       <th className="px-8 py-5">类型</th>
                       <th className="px-8 py-5">修改/生成日期</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {successfulNodes.length > 0 ? (
                       successfulNodes.map((node) => (
                         <React.Fragment key={node.id}>
                            <tr 
                              onClick={() => toggleFolder(node.label)}
                              className="bg-slate-50/30 hover:bg-blue-50/30 transition-all cursor-pointer group"
                            >
                              <td className="px-8 py-4 flex items-center gap-3">
                                <div className={`transition-transform duration-300 ${expandedFolders.has(node.label) ? 'rotate-90' : ''}`}>
                                  <ChevronRight size={16} className="text-slate-400" />
                                </div>
                                <div className="text-blue-500 opacity-80"><Folder size={24} fill="currentColor" strokeWidth={0} /></div>
                                <span className="font-black text-slate-800">{node.label}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100">已生成目录</span>
                              </td>
                              <td className="px-8 py-4 text-slate-400">目录</td>
                              <td className="px-8 py-4 text-slate-400">FOLDER</td>
                              <td className="px-8 py-4 text-slate-400 font-mono">-</td>
                            </tr>
                            
                            {expandedFolders.has(node.label) && (NODE_OUTPUT_MOCK_DATA[node.label] || []).map((file, idx) => (
                              <tr key={`${node.id}-file-${idx}`} className="hover:bg-blue-50/10 transition-all animate-in slide-in-from-top-1">
                                <td className="pl-20 pr-8 py-3 flex items-center gap-3">
                                  <div className="shrink-0">{getFileIcon(file, 20)}</div>
                                  <span className="font-bold text-slate-600 truncate">{file.name}</span>
                                </td>
                                <td className="px-8 py-3 text-slate-500 font-mono text-[13px]">{file.size}</td>
                                <td className="px-8 py-3 text-slate-400 uppercase text-[12px]">{file.type}</td>
                                <td className="px-8 py-3 text-slate-400 font-mono text-[13px]">{file.date}</td>
                              </tr>
                            ))}
                         </React.Fragment>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={4} className="px-8 py-24 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-300">
                              <Loader2 size={48} className={`opacity-20 ${(taskStatus === '运行中') ? 'animate-spin' : ''}`} />
                              <p className="text-[14px] font-medium">
                                {(taskStatus === '运行中') ? '任务正在执行第一个节点，成果文件夹生成中...' : '任务无执行成功节点，暂无成果输出。'}
                              </p>
                            </div>
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'range' && (
            <div className="w-full h-[600px] bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner animate-in fade-in duration-700 group">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?q=80&w=2000&auto=format&fit=crop')` }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[280px] border-2 border-blue-500 bg-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center animate-in zoom-in duration-1000 delay-300 rounded">
                <div className="text-white text-[12px] font-black bg-blue-600/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">任务计算范围</div>
              </div>
              <div className="absolute top-8 left-8 flex flex-col gap-px bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10">
                <button className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-100"><Plus size={20} strokeWidth={2.5} /></button>
                <button className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"><Minus size={20} strokeWidth={2.5} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};