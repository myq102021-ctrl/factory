
import React, { useState, useMemo } from 'react';
import { Eye, Trash2, Search, Plus, ChevronLeft, ChevronRight, ChevronDown, Lightbulb, Filter, RotateCcw, PlayCircle, Edit3, Copy } from 'lucide-react';
import { ProductionLine } from '../types';

interface Props {
  data: ProductionLine[];
  draftData: ProductionLine[];
  tempData: ProductionLine[]; // 新增临时产线数据传入
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string, isDraft: boolean, isTemp?: boolean) => void; // 更新删除回调签名
  onContinueDesign?: (draft: ProductionLine) => void;
  onEditDraft?: (draft: ProductionLine) => void;
  onClone?: (line: ProductionLine) => void; // 新增克隆回调
}

export const ProductionTable: React.FC<Props> = ({ 
  data, 
  draftData, 
  tempData,
  selectedId, 
  onSelect, 
  onCreate, 
  onDelete,
  onContinueDesign,
  onEditDraft,
  onClone
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'draft' | 'temp'>('list'); // 增加 temp 状态
  const [openFilter, setOpenFilter] = useState<'type' | 'status' | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 根据当前选中的 Tab 获取对应的数据源
  const currentData = useMemo(() => {
    if (activeTab === 'list') return data;
    if (activeTab === 'draft') return draftData;
    return tempData;
  }, [activeTab, data, draftData, tempData]);

  const typeOptions = useMemo(() => Array.from(new Set(currentData.map(item => item.type))), [currentData]);
  const statusOptions = useMemo(() => Array.from(new Set(currentData.map(item => item.status))), [currentData]);

  const filteredData = useMemo(() => {
    return currentData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [currentData, searchQuery, selectedTypes, selectedStatuses]);

  const toggleFilter = (filter: 'type' | 'status') => setOpenFilter(openFilter === filter ? null : filter);
  const handleTypeSelect = (type: string) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  const handleStatusSelect = (status: string) => setSelectedStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  
  const handleTabChange = (tab: 'list' | 'draft' | 'temp') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedStatuses([]);
    onSelect('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-['Noto_Sans_SC']">
      <div className="px-6 pt-5 pb-2 flex items-center shrink-0">
         <div className="w-1.5 h-5 bg-blue-600 rounded-full mr-3 shadow-md shadow-blue-500/20"></div>
         <div className="flex items-center gap-2 group relative">
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">
              {activeTab === 'list' ? '产线列表' : activeTab === 'draft' ? '草稿箱' : '临时产线'}
            </h2>
            <Lightbulb size={16} className="text-slate-400 cursor-help" />
         </div>
      </div>

      <div className="px-6 py-3 flex justify-between items-center gap-3 shrink-0">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button onClick={() => handleTabChange('list')} className={`w-[110px] h-[32px] rounded-md text-[14px] transition-all flex items-center justify-center gap-2 ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600 font-medium'}`}>
            产线列表 <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>{data.length}</span>
          </button>
          <button onClick={() => handleTabChange('draft')} className={`w-[110px] h-[32px] rounded-md text-[14px] transition-all flex items-center justify-center gap-2 ${activeTab === 'draft' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600 font-medium'}`}>
            草稿箱 <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === 'draft' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>{draftData.length}</span>
          </button>
          {/* 新增临时产线 Tab */}
          <button onClick={() => handleTabChange('temp')} className={`w-[110px] h-[32px] rounded-md text-[14px] transition-all flex items-center justify-center gap-2 ${activeTab === 'temp' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600 font-medium'}`}>
            临时产线 <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === 'temp' ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>{tempData.length}</span>
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative group">
            <input type="text" placeholder="搜索产线名称..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 h-[32px] bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56 transition-all" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
          </div>
          <button className="h-[32px] px-3 flex items-center text-slate-600 bg-white border border-slate-200 text-[13px] font-bold hover:text-rose-600 rounded-lg transition-all"><Trash2 size={15} className="mr-1.5" /> 批量删除</button>
          <button onClick={onCreate} className="h-[32px] px-4 bg-blue-600 text-white text-[13px] font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 rounded-lg transition-all active:scale-95 flex items-center gap-1.5"><Plus size={18} /> 新建产线</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border-t border-slate-50">
        <table className="w-full text-[13px] text-left border-collapse">
          <thead className="bg-[#f8fafc] text-slate-500 border-b border-slate-100 sticky top-0 z-20">
            <tr>
              <th className="px-6 py-3.5 w-14"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" /></th>
              <th className="px-5 py-3.5 font-bold">产线名称</th>
              <th className="px-5 py-3.5 font-bold">版本号</th>
              <th className="px-5 py-3.5 font-bold">产线类型 <Filter size={12} className="inline ml-1 opacity-40" /></th>
              <th className="px-5 py-3.5 font-bold">创建时间</th>
              <th className="px-5 py-3.5 font-bold text-center">状态 <Filter size={12} className="inline ml-1 opacity-40" /></th>
              <th className="px-5 py-3.5 font-bold text-left pl-6">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <tr key={item.id} onClick={() => activeTab === 'list' && onSelect(item.id)} className={`transition-all group cursor-pointer ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'}`}>
                  <td className="px-6 py-4"><input type="checkbox" onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded border-slate-300" /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.name}</span>
                      <span className="text-slate-400 text-[11px] font-mono opacity-80">{item.code}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-mono">{item.version}</td>
                  <td className="px-5 py-4 text-slate-600">{item.type}</td>
                  <td className="px-5 py-4 text-slate-400 font-mono">{item.createTime}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ring-inset ${item.status === '启用' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : item.status === '停用' ? 'bg-amber-50 text-amber-600 ring-amber-100' : item.status === '不可用' ? 'bg-rose-50 text-rose-600 ring-rose-100' : 'bg-slate-50 text-slate-500 ring-slate-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === '启用' ? 'bg-emerald-500' : item.status === '停用' ? 'bg-amber-400' : item.status === '不可用' ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-left pl-6">
                    <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-all text-blue-600">
                      {activeTab === 'temp' ? (
                         <button className="hover:text-blue-800 flex items-center gap-1 font-bold" onClick={(e) => { e.stopPropagation(); onContinueDesign?.(item); }}>
                            <PlayCircle size={16} /> 转化为正式产线
                         </button>
                      ) : (
                        <>
                          <button className="hover:text-blue-800" title="预览" onClick={(e) => e.stopPropagation()}><Eye size={16} /></button>
                          <button className="hover:text-blue-800" title="编辑" onClick={(e) => { e.stopPropagation(); onContinueDesign?.(item); }}><Edit3 size={16} /></button>
                          <button className="hover:text-blue-800" title="克隆" onClick={(e) => { e.stopPropagation(); onClone?.(item); }}><Copy size={16} /></button>
                        </>
                      )}
                      <button className="text-rose-400 hover:text-rose-600" title="删除" onClick={(e) => { e.stopPropagation(); onDelete(item.id, activeTab === 'draft', activeTab === 'temp'); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
