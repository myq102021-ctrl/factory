
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProductionTable } from './components/ProductionTable';
import { FlowChart } from './components/FlowChart';
import { DesignView } from './components/DesignView';
import { Home } from './components/Home';
import { AlgoManage } from './components/AlgoManage';
import { TaskCenter } from './components/TaskCenter';
import { TaskDetail } from './components/TaskDetail';
import { DataResource } from './components/DataResource';
import { DataProduct } from './components/DataProduct';
import { ScheduledTasks } from './components/ScheduledTasks';
import { AddTask } from './components/AddTask';
import { SatelliteConfigView } from './components/SatelliteConfigView';
import { MOCK_DATA } from './constants';
import { X, CheckCircle2, ChevronDown } from 'lucide-react';
import { ProductionLine } from './types';
import { TaskOrchestrationView } from './pages/TaskManagement/TaskOrchestrationView';

type ViewType = 'home' | 'list' | 'design' | 'algo-manage' | 'task-center' | 'task-detail' | 'data-resource' | 'data-product' | 'scheduled-tasks' | 'add-task' | 'satellite-config' | 'task-orchestration';
type ModalType = 'none' | 'create' | 'success';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('home');
  const [viewBeforeDetail, setViewBeforeDetail] = useState<ViewType>('task-center');
  const [modal, setModal] = useState<ModalType>('none');
  const [isCloningMode, setIsCloningMode] = useState(false);
  const [pendingCloneSource, setPendingCloneSource] = useState<ProductionLine | null>(null);
  
  // 记录是否需要进入任务中心后自动打开导入弹窗
  const [autoOpenImport, setAutoOpenImport] = useState(false);

  // --- Data Persistence Logic Start ---
  const [productionLines, setProductionLines] = useState<ProductionLine[]>(() => {
    const saved = localStorage.getItem('production_list');
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });

  const [draftLines, setDraftLines] = useState<ProductionLine[]>(() => {
    const saved = localStorage.getItem('draft_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [tempLines, setTempLines] = useState<ProductionLine[]>(() => {
    const saved = localStorage.getItem('temp_production_list');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('production_list', JSON.stringify(productionLines));
  }, [productionLines]);

  useEffect(() => {
    localStorage.setItem('draft_list', JSON.stringify(draftLines));
  }, [draftLines]);

  useEffect(() => {
    localStorage.setItem('temp_production_list', JSON.stringify(tempLines));
  }, [tempLines]);
  // --- Data Persistence Logic End ---

  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedAlgoName, setSelectedAlgoName] = useState<string>('波段合成');
  
  const [currentDesignDraft, setCurrentDesignDraft] = useState<ProductionLine | null>(null);
  const [orchestrationPipeline, setOrchestrationPipeline] = useState<ProductionLine | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    type: '',
    owner: '',
    desc: '',
    label: '',
    status: '启用'
  });

  const selectedLine = productionLines.find(item => item.id === selectedId) || productionLines[0];

  const generateId = () => Date.now().toString();

  const handleSaveMetadata = () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    // 如果是克隆模式，点击确认后直接进入设计视图
    if (isCloningMode && pendingCloneSource) {
      const clonedLine: ProductionLine = {
        ...pendingCloneSource,
        id: generateId(),
        name: formData.name,
        code: formData.code,
        type: formData.type || pendingCloneSource.type,
        description: formData.desc,
        createTime: now,
        updateTime: now,
        status: '草稿',
        creator: '系统管理员'
      };
      setModal('none');
      setIsCloningMode(false);
      setPendingCloneSource(null);
      setCurrentDesignDraft(clonedLine);
      setView('design');
      return;
    }

    if (formData.id) {
      setDraftLines(prev => prev.map(d => 
        d.id === formData.id 
          ? { ...d, name: formData.name, code: formData.code, type: formData.type || '其他', description: formData.desc, updateTime: now } 
          : d
      ));
      setModal('none');
    } else {
      setModal('success');
    }
  };

  const handleDeleteLine = (id: string, isDraft: boolean, isTemp?: boolean) => {
    const typeStr = isTemp ? '临时产线' : isDraft ? '草稿' : '产线';
    if (confirm(`确认删除该${typeStr}吗？`)) {
      if (isTemp) {
        setTempLines(prev => prev.filter(item => item.id !== id));
      } else if (isDraft) {
        setDraftLines(prev => prev.filter(item => item.id !== id));
      } else {
        setProductionLines(prev => prev.filter(item => item.id !== id));
        if (selectedId === id) setSelectedId('');
      }
    }
  };

  const handleGoToDesign = () => {
    setModal('none');
    const newDraft: ProductionLine = {
      id: generateId(),
      name: formData.name,
      code: formData.code,
      version: 'V' + new Date().toISOString().slice(0,10).replace(/-/g, ''),
      type: formData.type || '其他',
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: '草稿',
      creator: '系统管理员',
      description: formData.desc
    };
    setCurrentDesignDraft(newDraft);
    setView('design');
  };

  const handleContinueDesign = (draft: ProductionLine) => {
    setCurrentDesignDraft(draft);
    setView('design');
  };

  // 修改克隆逻辑：预填信息并弹出设置窗
  const handleCloneLine = (original: ProductionLine) => {
    setPendingCloneSource(original);
    setIsCloningMode(true);
    setFormData({
      id: '', // 新建 ID
      name: `${original.name}_复件`,
      code: `${original.code}_copy`,
      type: original.type,
      owner: 'admin',
      desc: original.description || '',
      label: '',
      status: '启用'
    });
    setModal('create');
  };

  const handleEditDraftInfo = (draft: ProductionLine) => {
    setFormData({
      id: draft.id,
      name: draft.name,
      code: draft.code,
      type: draft.type,
      owner: 'admin', 
      desc: draft.description || '',
      label: '',
      status: '草稿'
    });
    setIsCloningMode(false);
    setModal('create'); 
  };

  const handleSaveDraftContent = (lineData: ProductionLine) => {
    setDraftLines(prev => {
      const exists = prev.find(d => d.id === lineData.id);
      if (exists) {
        return prev.map(d => d.id === lineData.id ? { ...lineData, updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19) } : d);
      }
      return [lineData, ...prev];
    });
    setView('list');
  };

  const handleSubmitContent = (lineData: ProductionLine) => {
    const formalLine: ProductionLine = {
      ...lineData,
      status: '启用', 
      updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setProductionLines(prev => [formalLine, ...prev]);
    setDraftLines(prev => prev.filter(d => d.id !== lineData.id));
    setTempLines(prev => prev.filter(d => d.id !== lineData.id));
    setView('list');
  };

  const handleCloseModals = () => {
    setModal('none');
    setIsCloningMode(false);
    setPendingCloneSource(null);
    setFormData({ id: '', name: '', code: '', type: '', owner: '', desc: '', label: '', status: '启用' });
  };

  const generateDefaultLineName = () => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `产线_${YYYY}${MM}${DD}${mm}`;
  };

  const generateRandomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `pipline_${result}`;
  };

  const handleOpenCreateModal = () => {
    setIsCloningMode(false);
    setFormData({
      id: '',
      name: generateDefaultLineName(),
      code: generateRandomCode(),
      type: '',
      owner: '',
      desc: '',
      label: '',
      status: '启用'
    });
    setModal('create');
  };

  const handleSidebarNav = (targetView: string) => {
    setAutoOpenImport(false); // 手动点击侧边栏导航时，重置自动打开状态
    if (targetView === 'home') setView('home');
    else if (targetView === 'production-list') setView('list');
    else if (targetView === 'algo-manage') setView('algo-manage');
    else if (targetView === 'task-center') setView('task-center');
    else if (targetView === 'scheduled-tasks') setView('scheduled-tasks');
    else if (targetView === 'data-resource') setView('data-resource');
    else if (targetView === 'data-product') setView('data-product');
    else if (targetView === 'satellite-config') setView('satellite-config');
  };

  const handleViewTaskDetail = (taskId: string) => {
    setViewBeforeDetail(view);
    setSelectedTaskId(taskId);
    setView('task-detail');
  };

  // --- 统一处理任务创建触发逻辑
  const handleCreateTask = (algoName?: string) => {
    if (algoName) {
      // 如果指定了算法（通常从算法管理进入），进入一步步创建流程
      setSelectedAlgoName(algoName);
      setView('add-task');
    } else {
      // 如果没有指定（通常从首页“创建新任务”进入），进入任务中心并自动打开模板选择
      setView('task-center');
      setAutoOpenImport(true);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {view !== 'design' && view !== 'task-orchestration' && <Sidebar onNavigate={handleSidebarNav} currentView={view === 'add-task' ? 'algo-manage' : view} />}
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {view === 'home' && (
            <div className="flex-1 flex flex-col overflow-hidden">
               <Home onAction={(v) => v === 'list' ? handleCreateTask() : setView(v)} />
            </div>
          )}

          {view === 'algo-manage' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <AlgoManage onCreateTask={handleCreateTask} />
            </div>
          )}

          {view === 'task-center' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <TaskCenter 
                onViewDetail={handleViewTaskDetail} 
                onOrchestrateTask={(p) => {
                  setOrchestrationPipeline(p);
                  setView('task-orchestration');
                }}
                autoOpenImport={autoOpenImport}
                onImportModalClose={() => setAutoOpenImport(false)}
              />
            </div>
          )}

          {view === 'scheduled-tasks' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <ScheduledTasks onViewDetail={handleViewTaskDetail} />
            </div>
          )}

          {view === 'task-detail' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <TaskDetail taskId={selectedTaskId || '1'} onBack={() => setView(viewBeforeDetail)} />
            </div>
          )}

          {view === 'add-task' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <AddTask algoName={selectedAlgoName} onBack={() => setView('algo-manage')} onNavigate={handleSidebarNav} />
            </div>
          )}

          {view === 'data-resource' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <DataResource />
            </div>
          )}

          {view === 'data-product' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <DataProduct />
            </div>
          )}

          {view === 'satellite-config' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <SatelliteConfigView />
            </div>
          )}

          {view === 'list' && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
              <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative">
                  <div className="flex-[2] min-0 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden relative shadow-sm">
                    <ProductionTable 
                      data={productionLines} 
                      draftData={draftLines}
                      tempData={tempLines}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      onCreate={handleOpenCreateModal}
                      onDelete={(id, isDraft, isTemp) => handleDeleteLine(id, isDraft, isTemp)}
                      onContinueDesign={handleContinueDesign}
                      onClone={handleCloneLine}
                      onEditDraft={handleEditDraftInfo}
                    />
                  </div>
                  <div className="flex-1 min-h-[260px] flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden relative shadow-sm">
                    {selectedLine && <FlowChart selectedLine={selectedLine} />}
                  </div>
              </div>
            </div>
          )}

          {view === 'design' && (
            <DesignView 
              lineName={currentDesignDraft?.name || formData.name || '新产线流程设计'} 
              initialData={currentDesignDraft}
              onBack={() => setView('list')} 
              onSaveDraft={handleSaveDraftContent}
              onSubmit={handleSubmitContent}
            />
          )}

          {view === 'task-orchestration' && orchestrationPipeline && (
            <TaskOrchestrationView 
              initialPipeline={orchestrationPipeline}
              onBack={() => setView('task-center')}
              onSubmit={(name) => {
                alert(`任务 ${name} 提交成功`);
                setView('task-center');
              }}
            />
          )}

          {modal !== 'none' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              {modal === 'create' && (
                <div className="bg-white w-full max-w-[640px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 max-h-[90vh] flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
                    <h3 className="text-[18px] font-bold text-slate-800">{isCloningMode ? '克隆产线' : formData.id ? '编辑产线信息' : '新增产线'}</h3>
                    <button onClick={handleCloseModals} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-2">
                         <label className="text-[14px] font-medium text-slate-700">
                           <span className="text-rose-500 mr-1">*</span>产线名称
                         </label>
                         <input 
                           type="text" 
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           placeholder="请输入产线名称"
                           className="w-full h-10 px-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]"
                         />
                       </div>

                       <div className="space-y-2">
                         <label className="text-[14px] font-medium text-slate-700">
                           <span className="text-rose-500 mr-1">*</span>产线编码
                         </label>
                         <input 
                           type="text" 
                           value={formData.code}
                           onChange={e => setFormData({...formData, code: e.target.value})}
                           placeholder="请输入产线编码"
                           className="w-full h-10 px-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px]"
                         />
                       </div>

                       <div className="space-y-2 relative">
                         <label className="text-[14px] font-medium text-slate-700">
                           <span className="text-rose-500 mr-1">*</span>产线类型
                         </label>
                         <div className="relative">
                            <select 
                              value={formData.type}
                              onChange={e => setFormData({...formData, type: e.target.value})}
                              className="w-full h-10 px-4 appearance-none rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px] bg-white text-slate-400 font-normal"
                            >
                              <option value="">请选择产线类型</option>
                              <option value="数据采集产线">数据采集产线</option>
                              <option value="数据处理产线">数据处理产线</option>
                              <option value="数据治理产线">数据治理产线</option>
                              <option value="其他">其他</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                         </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[14px] font-medium text-slate-700">责任人</label>
                         <div className="relative">
                            <select 
                              value={formData.owner}
                              onChange={e => setFormData({...formData, owner: e.target.value})}
                              className="w-full h-10 px-4 appearance-none rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px] bg-white text-slate-400 font-normal"
                            >
                              <option value="">请选择责任人</option>
                              <option value="admin">管理员</option>
                              <option value="user">操作员</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                         </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[14px] font-medium text-slate-700">产线描述</label>
                         <textarea 
                           rows={3}
                           value={formData.desc}
                           onChange={e => setFormData({...formData, desc: e.target.value})}
                           placeholder="请输入描述信息"
                           className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px] resize-none"
                         />
                       </div>

                       {!formData.id && (
                         <div className="space-y-2">
                           <label className="text-[14px] font-medium text-slate-700">标签</label>
                           <div className="relative">
                              <select 
                                value={formData.label}
                                onChange={e => setFormData({...formData, label: e.target.value})}
                                className="w-full h-10 px-4 appearance-none rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[14px] bg-white text-slate-400 font-normal"
                              >
                                <option value="">请选择或输入创建新标签</option>
                                <option value="标签1">标签1</option>
                                <option value="标签2">标签2</option>
                              </select>
                              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           </div>
                         </div>
                       )}

                       {!formData.id && (
                         <div className="space-y-3 pt-2">
                           <label className="text-[14px] font-medium text-slate-700">产线状态</label>
                           <div className="flex gap-12">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="radio" 
                                  name="lineStatus" 
                                  checked={formData.status === '启用'}
                                  onChange={() => setFormData({...formData, status: '启用'})}
                                  className="hidden" 
                                />
                                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${formData.status === '启用' ? 'border-blue-600' : 'border-slate-300'}`}>
                                  {formData.status === '启用' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                </div>
                                <span className={`text-[14px] transition-colors ${formData.status === '启用' ? 'text-blue-600' : 'text-slate-600'}`}>启用</span>
                              </label>
                              
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="radio" 
                                  name="lineStatus" 
                                  checked={formData.status === '停用'}
                                  onChange={() => setFormData({...formData, status: '停用'})}
                                  className="hidden" 
                                />
                                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${formData.status === '停用' ? 'border-blue-600' : 'border-slate-300'}`}>
                                  {formData.status === '停用' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                </div>
                                <span className={`text-[14px] transition-colors ${formData.status === '停用' ? 'text-blue-600' : 'text-slate-600'}`}>停用</span>
                              </label>
                           </div>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="px-8 py-6 bg-slate-50/50 flex justify-center gap-4 shrink-0">
                     <button onClick={handleCloseModals} className="w-24 h-9 flex items-center justify-center rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-all">取消</button>
                     <button onClick={handleSaveMetadata} className="w-24 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">确认</button>
                  </div>
                </div>
              )}

              {modal === 'success' && (
                <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl p-8 relative animate-in zoom-in duration-300">
                  <button onClick={handleCloseModals} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                       <CheckCircle2 size={40} className="text-blue-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[20px] font-bold text-slate-800 mb-2">创建成功！</h3>
                    <p className="text-slate-500 text-[14px] mb-8">产线创建完毕，去【设计】产线流程吧</p>
                    <div className="flex w-full gap-4">
                       <button onClick={handleCloseModals} className="flex-1 h-10 border border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">取消</button>
                       {/* Fix: Added missing closing quote and bracket for the button tag below */}
                       <button onClick={handleGoToDesign} className="flex-1 h-10 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">去设计</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
      </main>
    </div>
  );
};

export default App;
