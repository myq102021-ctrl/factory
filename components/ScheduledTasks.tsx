
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Eye, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Ban,
  Edit3,
  FileText,
  Play,
  Settings2,
  X,
  AlertCircle,
  Database
} from 'lucide-react';
import { DataResourceSelector } from './DataResourceSelector';

const INITIAL_MOCK_SCHEDULED_TASKS = [
  { id: 'sch-1', name: '[定时]湖北省哨兵数据日更采集', pipelineName: '哨兵数据自动化采集产线', cycle: '每天 02:00', status: '运行中', lastRun: '2026-01-16 02:00:15', nextRun: '2026-01-17 02:00:00', outputPath: '/data/output/hubei_sentinel_daily', errorStrategy: 'stop', alarmType: 'system' },
  { id: 'sch-2', name: '[定时]大冶市农作物分类周报生成', pipelineName: '农作物提取与分类产线', cycle: '每周一 08:30', status: '已终止', lastRun: '2026-01-12 08:30:44', nextRun: '-', outputPath: '/data/output/daye_crop_weekly', errorStrategy: 'ignore', alarmType: 'email' },
  { id: 'sch-3', name: '[定时]全量影像索引自动化重建', pipelineName: '影像索引维护与管理产线', cycle: '每月1号 01:00', status: '成功', lastRun: '2026-01-01 01:00:02', nextRun: '2026-02-01 01:00:00', outputPath: '/data/output/index_rebuild', errorStrategy: 'stop', alarmType: 'system' },
  { id: 'sch-4', name: '[定时]广东省L2A级数据自动预处理', pipelineName: '多源卫星数据预处理产线', cycle: '每天 04:00', status: '失败', lastRun: '2026-01-16 04:00:21', nextRun: '2026-01-17 04:00:00', outputPath: '/data/output/guangdong_l2a', errorStrategy: 'stop', alarmType: 'sms' },
  { id: 'sch-5', name: '[定时]系统存储空间水位巡检', pipelineName: '系统资源监控运维产线', cycle: '每1小时', status: '运行中', lastRun: '2026-01-16 15:00:00', nextRun: '2026-01-16 16:00:00', outputPath: '/data/logs/watermark', errorStrategy: 'ignore', alarmType: 'system' },
  { id: 'sch-6', name: '[定时]历史数据冷备归档任务', pipelineName: '数据全生命周期管理产线', cycle: '每季度初', status: '成功', lastRun: '2026-01-01 03:00:00', nextRun: '2026-04-01 03:00:00', outputPath: '/data/archive/cold_backup', errorStrategy: 'stop', alarmType: 'email' },
  { id: 'sch-7', name: '[定时]算法算子调用频次统计', pipelineName: '算子应用情况分析产线', cycle: '每天 23:55', status: '运行中', lastRun: '2025-12-31 23:55:01', nextRun: '2026-01-16 23:55:00', outputPath: '/data/stats/usage', errorStrategy: 'stop', alarmType: 'system' },
];

interface Props {
  onViewDetail?: (taskId: string) => void;
}

export const ScheduledTasks: React.FC<Props> = ({ onViewDetail }) => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('app_scheduled_tasks');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_SCHEDULED_TASKS;
  });

  const [activeTab, setActiveTab] = useState<'list' | 'draft'>('list');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isOutputSelectorOpen, setIsOutputSelectorOpen] = useState(false);

  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [taskToTerminate, setTaskToTerminate] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('app_scheduled_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleDeleteTask = (id: string) => {
    if(confirm('确认删除该定时任务吗？')) {
        setTasks((prev: any[]) => prev.filter((t: any) => t.id !== id));
    }
  };

  const handleOpenEditModal = (task: any) => {
    setEditingTask({ ...task });
    setIsEditModalOpen(true);
  };

  const handleSaveTaskEdit = () => {
    if (editingTask) {
        setTasks((prev: any[]) => prev.map((t: any) => 
            t.id === editingTask.id ? { ...editingTask } : t
        ));
        setIsEditModalOpen(false);
        setEditingTask(null);
    }
  };

  const handleOpenTerminateModal = (task: any) => {
    setTaskToTerminate(task);
    setIsTerminateModalOpen(true);
  };

  const confirmTerminate = () => {
    if (taskToTerminate) {
        setTasks((prev: any[]) => prev.map((t: any) => 
            t.id === taskToTerminate.id ? { ...t, status: '已终止', nextRun: '-' } : t
        ));
        setIsTerminateModalOpen(false);
        setTaskToTerminate(null);
        if (isEditModalOpen) setIsEditModalOpen(false);
    }
  };

  const handleRerun = (name: string) => {
    alert(`已手动触发任务: ${name}\n新的任务实例已加入执行队列。`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
        case '运行中':
            return 'bg-blue-50 text-blue-600 ring-blue-100';
        case '成功':
            return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
        case '失败':
            return 'bg-rose-50 text-rose-600 ring-rose-100';
        case '已终止':
            return 'bg-slate-50 text-slate-400 ring-slate-100';
        default:
            return 'bg-slate-50 text-slate-400 ring-slate-100';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
        case '运行中':
            return 'bg-blue-500 animate-pulse';
        case '成功':
            return 'bg-emerald-500';
        case '失败':
            return 'bg-rose-500';
        case '已终止':
            return 'bg-slate-400';
        default:
            return 'bg-slate-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative h-full font-['Noto_Sans_SC']">
      
      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm min-h-0">
        
        <div className="px-6 py-4 flex items-center shrink-0 border-b border-slate-50">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full mr-3 shadow-md shadow-blue-500/20"></div>
          <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">定时任务管理</h2>
        </div>

        <div className="px-6 py-3 flex items-center justify-between shrink-0 bg-slate-50/20 border-b border-slate-50">
          <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200/50 backdrop-blur-sm">
            <button onClick={() => setActiveTab('list')} className={`px-6 h-8 rounded-md text-[13px] flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 font-medium hover:text-slate-700'}`}>
              生效中 <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-600 ring-1 ring-blue-100">{tasks.length}</span>
            </button>
            <button onClick={() => setActiveTab('draft')} className={`px-6 h-8 rounded-md text-[13px] flex items-center gap-2 transition-all ${activeTab === 'draft' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 font-medium hover:text-slate-700'}`}>
              草稿箱 <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">2</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-72">
              <input type="text" placeholder="搜索定时任务名称或周期..." className="w-full h-9 pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <button className="h-9 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <RotateCcw size={14} className="text-blue-500" /> 刷新
            </button>
            <button className="h-9 px-5 flex items-center gap-2 bg-blue-600 text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              <Plus size={16} /> 新建定时任务
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-slate-50/80 backdrop-blur-sm text-slate-500 sticky top-0 z-10 border-b border-slate-100/50">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></th>
                <th className="px-4 py-4 font-bold text-slate-600">任务名称</th>
                <th className="px-4 py-4 font-bold text-slate-600">执行周期</th>
                <th className="px-4 py-4 font-bold text-slate-600 text-center">状态</th>
                <th className="px-4 py-4 font-bold text-slate-600">上次执行时间</th>
                <th className="px-4 py-4 font-bold text-slate-600">下次执行时间</th>
                <th className="px-4 py-4 font-bold text-slate-600 text-left pl-6">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-blue-50/40 transition-all group cursor-pointer" onClick={() => onViewDetail?.(task.id)}>
                  <td className="px-6 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" onClick={(e) => e.stopPropagation()} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{task.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">产线/算法: {task.pipelineName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                       <Clock size={14} className="opacity-50" />
                       {task.cycle}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ring-1 ring-inset ${getStatusStyle(task.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(task.status)}`} />
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-mono tracking-tight">{task.lastRun}</td>
                  <td className="px-4 py-4 text-slate-500 font-mono font-bold tracking-tight">{task.nextRun}</td>
                  <td className="px-4 py-4 text-left pl-6">
                    <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-all text-blue-600">
                      <button onClick={(e) => { e.stopPropagation(); onViewDetail?.(task.id); }} className="hover:text-blue-800 transition-colors" title="详情"><Eye size={16}/></button>
                      <button className="text-slate-500 hover:text-blue-800 transition-colors" title="任务流程编辑" onClick={(e) => e.stopPropagation()}><Edit3 size={16}/></button>
                      <button 
                        disabled={task.status === '运行中'}
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(task); }} 
                        className={`transition-colors ${task.status === '运行中' ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-blue-600'}`}
                        title={task.status === '运行中' ? "运行中任务不支持编辑属性" : "任务属性编辑"}
                      >
                        <Settings2 size={16}/>
                      </button>
                      <button 
                        disabled={task.status === '运行中'}
                        onClick={(e) => { e.stopPropagation(); handleRerun(task.name); }} 
                        className={`transition-colors ${task.status === '运行中' ? 'text-slate-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-800'}`} 
                        title={task.status === '运行中' ? "运行中任务不支持重新执行" : "重新执行"}
                      >
                        <Play size={16}/>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenTerminateModal(task); }}
                        className="text-orange-400 hover:text-orange-600 disabled:opacity-20"
                        disabled={task.status !== '运行中'}
                        title="终止当前执行"
                      >
                        <Ban size={16}/>
                      </button>
                      <button className="text-indigo-500 hover:text-indigo-700" title="日志" onClick={(e) => e.stopPropagation()}><FileText size={16}/></button>
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
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select className="appearance-none h-8 pl-3 pr-8 border border-slate-200 rounded-lg text-[11px] text-slate-600 bg-white font-bold outline-none">
                <option>10条/页</option>
                <option>20条/页</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><ChevronLeft size={16}/></button>
              <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-[12px] font-black shadow-md shadow-blue-500/20">1</button>
              <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[800px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300">
            <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Settings2 size={20} /></div>
                <h3 className="text-[18px] font-extrabold text-slate-800">任务属性编辑</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-all hover:rotate-90"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-10 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-md shadow-blue-500/20"></div>
                   <h4 className="text-[16px] font-bold text-slate-800">基本信息配置</h4>
                </div>
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

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-md shadow-blue-500/20"></div>
                   <h4 className="text-[16px] font-bold text-slate-800">调度信息配置</h4>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 任务类型</label>
                    <div className="flex gap-12">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 ring-4 ring-blue-50 flex items-center justify-center transition-all">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />
                        </div>
                        <span className="text-[14px] font-bold text-blue-600">定时任务</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 失败策略</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-4 appearance-none bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer shadow-sm" value={editingTask.errorStrategy} onChange={(e) => setEditingTask({...editingTask, errorStrategy: e.target.value})}>
                          <option value="stop">停止</option>
                          <option value="ignore">忽略并继续</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1"><span className="text-rose-500">*</span> 报警方式</label>
                      <div className="relative group">
                        <select className="w-full h-12 px-4 appearance-none bg-white border border-slate-200 rounded-xl text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer shadow-sm" value={editingTask.alarmType} onChange={(e) => setEditingTask({...editingTask, alarmType: e.target.value})}>
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
               <p className="text-slate-500 text-[14px] mb-8 font-medium leading-relaxed">您确认要终止当前任务调度吗？<br/>终止后将不再自动产生新的任务实例。</p>
               <div className="flex w-full gap-4">
                  <button onClick={() => setIsTerminateModalOpen(false)} className="flex-1 h-10 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">取消</button>
                  <button onClick={confirmTerminate} className="flex-1 h-10 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all active:scale-95">确定终止</button>
               </div>
             </div>
           </div>
        </div>
      )}

      <DataResourceSelector 
        visible={isOutputSelectorOpen}
        title="选择输出目录"
        rootName="我的输出数据"
        storageKey="app_data_products" 
        selectionType="folder"
        onClose={() => setIsOutputSelectorOpen(false)}
        onConfirm={(path) => {
            if (typeof path === 'string' && editingTask) {
                setEditingTask({ ...editingTask, outputPath: path });
            }
            setIsOutputSelectorOpen(false);
        }}
      />
    </div>
  );
};
