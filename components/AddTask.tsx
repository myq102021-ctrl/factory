import React, { useState, useMemo, useEffect } from 'react';
import { 
  Undo2, 
  SendHorizontal, 
  ChevronDown, 
  Info, 
  X, 
  Settings2,
  CheckSquare,
  Loader2,
  Database,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Calendar,
  List,
  Maximize2
} from 'lucide-react';
import { ResourceItem } from '../types';
import { MockApi } from '../services/mockApi';
import { DataResourceSelector } from './DataResourceSelector'; 
import { SatelliteConfigSelectionModal } from './SatelliteConfigSelectionModal';
import { ALGO_CONFIG_MAP } from '../constants';

interface AddTaskProps {
  algoName?: string;
  onBack: () => void;
  onNavigate?: (view: any) => void;
}

type Step = 1 | 2 | 3;

export const AddTask: React.FC<AddTaskProps> = ({ algoName = '数据采集', onBack, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isInputFileSelectorOpen, setIsInputFileSelectorOpen] = useState(false);
  const [isOutputFileSelectorOpen, setIsOutputFileSelectorOpen] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [matchedFiles, setMatchedFiles] = useState<ResourceItem[]>([]);
  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(new Set());
  const [isMatching, setIsMatching] = useState(false);
  const [hasAttemptedMatch, setHasAttemptedMatch] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'matchedFullscreen'>('none');

  // --- 翻页状态开始 ---
  const [matchCurrentPage, setMatchCurrentPage] = useState(1);
  const matchPageSize = 5;
  const totalMatchPages = Math.ceil(matchedFiles.length / matchPageSize) || 1;

  const paginatedMatchedFiles = useMemo(() => {
    const start = (matchCurrentPage - 1) * matchPageSize;
    return matchedFiles.slice(start, start + matchPageSize);
  }, [matchedFiles, matchCurrentPage]);
  // --- 翻页状态结束 ---

  // --- 动态参数逻辑开始 ---
  const [algoParams, setAlgoParams] = useState<Record<string, any>>({});
  const algoConfig = useMemo(() => ALGO_CONFIG_MAP[algoName] || [], [algoName]);

  useEffect(() => {
    if (algoConfig.length > 0) {
        const defaults: any = {};
        algoConfig.forEach(p => {
            if (p.defaultValue !== undefined && p.defaultValue !== '') {
                defaults[p.label] = p.defaultValue;
            } else if (p.type === 'select' && p.options && p.options.length > 0) {
                defaults[p.label] = p.options[0];
            } else {
                defaults[p.label] = '';
            }
        });
        setAlgoParams(prev => ({...defaults, ...prev}));
    }
  }, [algoConfig]);

  const defaultTaskName = useMemo(() => {
    const now = new Date();
    const ts = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    return `${algoName}_${ts}`;
  }, [algoName]);

  const [formData, setFormData] = useState({
    taskName: defaultTaskName,
    description: '',
    inputPath: '',
    outputPath: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNext = () => {
    if (currentStep === 1) {
      const newErrors: { [key: string]: string } = {};
      if (!formData.taskName) newErrors.taskName = '请输入任务名称';
      if (!formData.outputPath) newErrors.outputPath = '请选择输出路径';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    setErrors({});
    if (currentStep < 3) setCurrentStep((currentStep + 1) as Step);
  };

  const handleSubmit = () => {
      const newTask = {
          id: `task_${Date.now()}`,
          name: formData.taskName,
          type: '一次性任务',
          source: algoName,
          status: '进行中',
          start: new Date().toISOString().slice(0, 19).replace('T', ' '),
          end: '-'
      };
      const savedTasks = localStorage.getItem('app_tasks');
      const currentTasks = savedTasks ? JSON.parse(savedTasks) : [];
      localStorage.setItem('app_tasks', JSON.stringify([newTask, ...currentTasks]));
      if (onNavigate) onNavigate('task-center');
  };

  const handleMatchConfirm = async (ids: string[]) => {
    setSelectedRuleIds(ids);
    setIsMatchModalOpen(false);
    if (ids.length === 0) {
        setMatchedFiles([]);
        setSelectedResultIds(new Set());
        setHasAttemptedMatch(false);
        setMatchCurrentPage(1);
        return;
    }
    setIsMatching(true);
    setHasAttemptedMatch(true);
    setMatchCurrentPage(1);
    try {
        const results = await MockApi.matchResourcesByConfigs(formData.inputPath, ids);
        setMatchedFiles(results);
        setSelectedResultIds(new Set(results.map(r => r.id)));
    } catch (e) {
        alert('匹配失败');
    } finally {
        setIsMatching(false);
    }
  };

  const toggleResultSelection = (id: string) => {
    const next = new Set(selectedResultIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedResultIds(next);
  };

  const steps = [
    { id: 1, label: '基本信息' },
    { id: 2, label: '算法信息' },
    { id: 3, label: '调度信息' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 overflow-hidden h-full font-['Noto_Sans_SC'] relative">
      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm min-h-0">
        <div className="px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full shadow-sm shadow-blue-500/20"></div>
            <h2 className="text-[18px] font-bold text-slate-800 tracking-tight leading-none">添加任务</h2>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 px-5 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-300 transition-all text-[13px] shadow-sm active:scale-95 group">
            <Undo2 size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> 
            <span>返回</span>
          </button>
        </div>

        <div className="px-8 py-3 bg-slate-50/40 border-b border-slate-100 flex items-center gap-12 shrink-0">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black border-2 transition-all ${currentStep === s.id ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 scale-110' : currentStep > s.id ? 'bg-blue-100 border-blue-100 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                {s.id}
              </div>
              <span className={`text-[14px] font-bold transition-colors ${currentStep === s.id ? 'text-blue-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar bg-white relative">
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-1 duration-500">
              <div className="flex items-center gap-4">
                <label className="w-24 shrink-0 text-[14px] font-bold text-slate-700 text-right">算法名称</label>
                <div className="flex-1 h-11 px-4 flex items-center bg-slate-50 border border-slate-100 rounded-lg text-[14px] text-slate-500 font-medium">{algoName}</div>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 shrink-0 text-[14px] font-bold text-slate-700 text-right">
                    <span className="text-rose-500 mr-1">*</span>任务名称
                </label>
                <div className="flex-1">
                    <input 
                        type="text" 
                        placeholder="请输入任务名称" 
                        value={formData.taskName} 
                        onChange={(e) => setFormData({...formData, taskName: e.target.value})} 
                        className={`w-full h-11 px-4 bg-white border rounded-lg text-[14px] text-slate-700 focus:outline-none focus:ring-4 transition-all ${errors.taskName ? 'border-rose-300 ring-rose-500/5' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/5'}`} 
                    />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <label className="w-24 shrink-0 text-[14px] font-bold text-slate-700 text-right mt-3">任务描述</label>
                <textarea rows={4} placeholder="请输入任务描述" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-blue-500/5 transition-all resize-none" />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 shrink-0 text-[14px] font-bold text-slate-700 text-right">
                    <span className="text-rose-500 mr-1">*</span>输出路径
                </label>
                <div className="flex-1 flex gap-2">
                    <input 
                        type="text" 
                        placeholder="请选择输出路径" 
                        value={formData.outputPath} 
                        onChange={(e) => setFormData({...formData, outputPath: e.target.value})} 
                        className={`flex-1 h-11 px-4 bg-white border rounded-lg text-[14px] text-slate-700 focus:outline-none transition-all ${errors.outputPath ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/5'}`} 
                    />
                    <button onClick={() => setIsOutputFileSelectorOpen(true)} className="h-11 px-6 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-[14px] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">浏览</button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-1 duration-500">
               <div className="bg-slate-50/40 p-8 rounded-[24px] border border-slate-100 space-y-5">
                  <div className="flex items-center gap-4">
                    <label className="w-24 shrink-0 text-[14px] font-bold text-slate-700 text-right">
                        <span className="text-rose-500 mr-1">*</span>输入数据
                    </label>
                    <div className="flex-1 flex gap-3">
                        <input 
                        type="text" 
                        placeholder="请选择或输入输入数据路径" 
                        value={formData.inputPath} 
                        onChange={(e) => setFormData({...formData, inputPath: e.target.value})} 
                        className="flex-1 h-11 px-4 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
                        />
                        <button 
                        onClick={() => setIsInputFileSelectorOpen(true)} 
                        className="h-11 px-6 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-bold text-[14px] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                        浏览
                        </button>
                        <button 
                        onClick={() => setIsMatchModalOpen(true)} 
                        className="h-11 px-6 bg-white text-slate-600 border border-slate-200 rounded-lg font-bold text-[14px] hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                        <Settings2 size={16} /> 配置数据与规则
                        </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-[13px] text-blue-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 leading-relaxed font-medium ml-28">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>请选择待处理数据目录并选择卫星配置，系统将自动匹配符合条件的文件。</span>
                  </div>

                  {hasAttemptedMatch && (
                    <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden shadow-xl bg-white animate-in slide-in-from-top-4 duration-500 ml-28">
                        <div className="bg-[#f8faff] px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                            <h4 className="text-[14px] font-black text-slate-700 flex items-center gap-2">
                                <CheckSquare size={18} className="text-blue-600" />
                                已匹配资源 ({selectedResultIds.size}/{matchedFiles.length})
                            </h4>
                            
                            <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => setActiveModal('matchedFullscreen')}
                                  disabled={matchedFiles.length === 0}
                                  className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors disabled:opacity-30"
                                  title="全屏查看"
                                >
                                  <Maximize2 size={18} />
                                </button>
                                <div className="h-4 w-px bg-slate-200 mx-1" />
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-slate-400">
                                        第 {matchCurrentPage} / {totalMatchPages} 页
                                    </span>
                                    <div className="flex gap-1.5">
                                        <button 
                                            disabled={matchCurrentPage === 1}
                                            onClick={() => setMatchCurrentPage(p => p - 1)}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button 
                                            disabled={matchCurrentPage === totalMatchPages}
                                            onClick={() => setMatchCurrentPage(p => p + 1)}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="min-h-[200px] overflow-auto custom-scrollbar">
                            <table className="w-full text-left text-[13px] border-collapse">
                                <thead className="bg-slate-50/80 text-slate-500 font-bold sticky top-0 z-10 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-4 w-12 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                                checked={matchedFiles.length > 0 && selectedResultIds.size === matchedFiles.length}
                                                onChange={() => {
                                                    if (selectedResultIds.size === matchedFiles.length) setSelectedResultIds(new Set());
                                                    else setSelectedResultIds(new Set(matchedFiles.map(f => f.id)));
                                                }}
                                            />
                                        </th>
                                        <th className="px-4 py-4 w-12 text-center">序号</th>
                                        <th className="px-4 py-4">数据名称</th>
                                        <th className="px-4 py-4">卫星类型</th>
                                        <th className="px-4 py-4">载荷类型</th>
                                        <th className="px-4 py-4">标识</th>
                                        <th className="px-4 py-4">分辨率</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isMatching ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 size={32} className="animate-spin text-blue-500" />
                                                    <p className="text-slate-400 font-bold">正在匹配数据...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedMatchedFiles.length > 0 ? (
                                        paginatedMatchedFiles.map((file, index) => (
                                            <tr key={file.id} className={`hover:bg-blue-50/30 transition-colors ${selectedResultIds.has(file.id) ? 'bg-blue-50/20' : ''}`}>
                                                <td className="px-4 py-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                                        checked={selectedResultIds.has(file.id)}
                                                        onChange={() => toggleResultSelection(file.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center font-mono font-bold text-slate-400">
                                                    {(matchCurrentPage - 1) * matchPageSize + index + 1}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Database size={16} className="text-blue-400 opacity-60" />
                                                        <span className="font-bold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-slate-500 font-medium">{file.satelliteType || '-'}</td>
                                                <td className="px-4 py-4 text-slate-500 font-medium">{file.sensor || '-'}</td>
                                                <td className="px-4 py-4">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[11px] border border-slate-200">
                                                        {file.code || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-800 font-black">{file.resolution ? `${file.resolution}m` : '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                                    <AlertCircle size={40} className="opacity-10" />
                                                    <p className="text-[14px] font-bold">未找到匹配项</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                  )}

                  {algoConfig.length > 0 && (
                    <div className="pt-8 mt-4 border-t border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-1.5 h-4 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/20"></div>
                          <h4 className="text-[14px] font-black text-slate-800 tracking-tight uppercase">算子参数配置</h4>
                        </div>
                        
                        {algoConfig.map((param, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <label className="w-24 shrink-0 text-[14px] font-bold text-slate-700 text-right">
                                    {param.required && <span className="text-rose-500 mr-1">*</span>}
                                    {param.label}
                                </label>
                                <div className="flex-1 group">
                                    {param.type === 'select' ? (
                                        <div className="relative">
                                            <select 
                                                value={algoParams[param.label] || ''}
                                                onChange={(e) => setAlgoParams({...algoParams, [param.label]: e.target.value})}
                                                className="w-full h-11 pl-4 pr-10 appearance-none bg-white border border-slate-200 rounded-lg text-[14px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm cursor-pointer"
                                            >
                                                {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    ) : param.type === 'date' ? (
                                        <div className="relative">
                                            <input 
                                                type="date"
                                                value={algoParams[param.label] || ''}
                                                onChange={(e) => setAlgoParams({...algoParams, [param.label]: e.target.value})}
                                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                            />
                                        </div>
                                    ) : (
                                        <input 
                                            type="text"
                                            placeholder={param.description || `请输入${param.label}`}
                                            value={algoParams[param.label] || ''}
                                            onChange={(e) => setAlgoParams({...algoParams, [param.label]: e.target.value})}
                                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                        />
                                    )}
                                    {param.description && (
                                        <p className="mt-1.5 text-[11px] text-slate-400 font-medium italic pl-1">{param.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                  )}
               </div>
            </div>
          )}
          
          {currentStep === 3 && (
             <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 shadow-inner">
                    <FileText size={40} />
                </div>
                <p className="text-[14px] font-bold text-slate-400 tracking-wider">
                    在此阶段配置任务调度周期、失败策略及告警规则（开发中...）
                </p>
             </div>
          )}
        </div>
        
        <div className="px-8 py-6 border-t border-slate-50 bg-white flex justify-center gap-4 shrink-0 z-10">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep((currentStep - 1) as Step)} 
                className="w-32 h-11 flex items-center justify-center gap-2 rounded-lg border border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-all shadow-sm"
              >
                <Undo2 size={16} /> 上一步
              </button>
            )}
            <button 
              onClick={currentStep < 3 ? handleNext : handleSubmit} 
              className={`w-48 h-11 flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95`}
            >
              {currentStep < 3 ? '下一步' : '提交任务'} {currentStep < 3 && <SendHorizontal size={16} />}
            </button>
        </div>
      </div>

      <DataResourceSelector 
        visible={isInputFileSelectorOpen}
        title="选择输入路径"
        rootName="我的输入数据"
        storageKey="app_data_resources" 
        selectionType="folder"
        onClose={() => setIsInputFileSelectorOpen(false)}
        onConfirm={(path) => {
            setFormData({...formData, inputPath: typeof path === 'string' ? path : path.name});
            setIsInputFileSelectorOpen(false);
        }}
      />

      <DataResourceSelector 
        visible={isOutputFileSelectorOpen}
        title="选择输出路径"
        rootName="我的输出数据"
        storageKey="app_data_products" 
        selectionType="folder"
        onClose={() => setIsOutputFileSelectorOpen(false)}
        onConfirm={(path) => {
            setFormData({...formData, outputPath: typeof path === 'string' ? path : path.name});
            setIsOutputFileSelectorOpen(false);
        }}
      />

      <SatelliteConfigSelectionModal 
        visible={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        onConfirm={handleMatchConfirm}
        initialSelectedIds={selectedRuleIds}
      />

      {/* 全屏匹配资源列表弹窗 */}
      {activeModal === 'matchedFullscreen' && matchedFiles.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full h-full max-w-[1400px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-500">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><CheckSquare size={24} /></div>
                    <h3 className="text-[20px] font-black text-slate-800 tracking-tight">已匹配数据列表</h3>
                    <span className="px-3 py-1 bg-blue-600 text-white text-[12px] font-black rounded-full shadow-lg shadow-blue-500/20">
                        {matchedFiles.length} 个结果
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
                              {matchedFiles.map((file, index) => (
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
                    以上数据基于所选卫星配置自动匹配得出，共计 {matchedFiles.length} 个资源。
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