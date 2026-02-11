
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ChevronLeft, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { ProductionLine } from '../../types';
import { FlowChart } from '../../components/FlowChart';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pipeline: ProductionLine) => void;
}

export const ImportPipelineModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
  const [pipelines, setPipelines] = useState<ProductionLine[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with latest production list data
  useEffect(() => {
    if (visible) {
      const saved = localStorage.getItem('production_list');
      if (saved) {
        const allLines = JSON.parse(saved);
        setPipelines(allLines.filter((p: ProductionLine) => p.status === '启用' || p.status === '停用'));
      }
    }
  }, [visible]);

  const selectedLine = useMemo(() => 
    pipelines.find(p => p.id === selectedId), 
    [pipelines, selectedId]
  );

  if (!visible) return null;

  const filtered = pipelines.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <div className="bg-white w-full max-w-[1000px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FolderOpen size={20} /></div>
             <h3 className="text-[18px] font-extrabold text-slate-800 tracking-tight">导入产线模板</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10">
          <div className="p-6 space-y-5">
            {/* Search Box */}
            <div className="relative group shrink-0">
              <input 
                type="text" 
                placeholder="请输入产线名称快速搜索" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-12 border border-slate-200 rounded-xl text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm placeholder:text-slate-300"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            </div>

            {/* List Table Area */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col min-h-[300px]">
              <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8faff] text-slate-500 font-bold sticky top-0 z-10 border-b border-slate-100">
                        <tr>
                        <th className="px-8 py-4 text-[13px] uppercase tracking-wider">产线名称</th>
                        <th className="px-8 py-4 text-[13px] uppercase tracking-wider w-[240px]">版本号</th>
                        <th className="px-8 py-4 text-[13px] uppercase tracking-wider w-[240px]">创建时间</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.length > 0 ? (
                        filtered.map(p => (
                            <tr 
                            key={p.id} 
                            onClick={() => setSelectedId(p.id)}
                            className={`cursor-pointer transition-all ${selectedId === p.id ? 'bg-blue-50/80 ring-2 ring-inset ring-blue-100' : 'hover:bg-slate-50/40'}`}
                            >
                            <td className="px-8 py-5">
                                <div className={`font-extrabold text-[14px] ${selectedId === p.id ? 'text-blue-600' : 'text-slate-700'}`}>{p.name}</div>
                            </td>
                            <td className="px-8 py-5 text-slate-500 font-mono text-[13px] tracking-tight">{p.version}</td>
                            <td className="px-8 py-5 text-slate-400 font-mono text-[13px]">{p.createTime}</td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={3} className="py-24 text-center text-slate-300 italic bg-white">
                               暂无匹配的产线模板，请先前往产线管理创建产线
                            </td>
                        </tr>
                        )}
                    </tbody>
                  </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between shrink-0 px-6 py-4 bg-white border-t border-slate-50">
                  <span className="text-[12px] text-slate-400 font-bold">共 {filtered.length} 条</span>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                        <select className="appearance-none h-8 pl-3 pr-8 border border-slate-200 rounded-lg text-[12px] text-slate-600 bg-white font-bold outline-none cursor-pointer">
                        <option>10条/页</option>
                        <option>20条/页</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-300 hover:text-blue-600 transition-all"><ChevronLeft size={16}/></button>
                        <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-[12px] font-black shadow-md shadow-blue-500/20">1</button>
                        <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><ChevronRight size={16}/></button>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-slate-500 font-bold">
                        前往 <input type="text" defaultValue="1" className="w-10 h-8 border border-slate-200 rounded-lg text-center text-slate-700 outline-none focus:border-blue-500 transition-all" /> 页
                    </div>
                  </div>
              </div>
            </div>

            {/* Workflow Preview Area - Appearing when selected */}
            {selectedLine ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="border border-blue-100 rounded-2xl overflow-hidden bg-white shadow-lg shadow-blue-900/5 min-h-[220px] flex flex-col">
                  <FlowChart selectedLine={selectedLine} />
                </div>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-3">
                 <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                    <ChevronDown size={24} className="opacity-20" />
                 </div>
                 <p className="text-[13px] font-medium">请在上方列表选择一条产线以预览流程图</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-center gap-6 shrink-0">
          <button 
            onClick={onClose} 
            className="w-36 h-11 border-2 border-blue-600 text-blue-600 rounded-xl font-black text-[14px] hover:bg-blue-50 transition-all shadow-sm active:scale-95"
          >
            取消
          </button>
          <button 
            disabled={!selectedId}
            onClick={() => {
              if (selectedLine) onConfirm(selectedLine);
            }}
            className="w-36 h-11 bg-blue-600 text-white rounded-xl font-black text-[14px] hover:bg-blue-700 shadow-xl shadow-blue-500/30 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed active:scale-95"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
};
