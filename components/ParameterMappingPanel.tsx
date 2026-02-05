
import React, { useState, useMemo } from 'react';
import { 
  X, 
  ArrowRight, 
  Link2, 
  Plus, 
  Trash2, 
  Info,
  ChevronDown,
  Box
} from 'lucide-react';
import { Connection, ParamMapping, AlgoConfigParam } from '../types';
import { ALGO_CONFIG_MAP } from '../constants';

interface NodeData {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Props {
  visible: boolean;
  connection: Connection;
  sourceNode: NodeData;
  targetNode: NodeData;
  onClose: () => void;
  onUpdate: (mappings: ParamMapping[]) => void;
}

export const ParameterMappingPanel: React.FC<Props> = ({ 
  visible, 
  connection, 
  sourceNode, 
  targetNode, 
  onClose, 
  onUpdate 
}) => {
  if (!visible) return null;

  // 初始化映射数据，如果为空则默认给一行
  const mappings = connection.data?.mappings || [];

  // 推导源节点的输出参数（Mock 逻辑，因为原始 CSV 只有输入）
  const sourceOutputs = useMemo(() => {
    const baseName = sourceNode.name.replace(/\d+$/, '');
    const standardOutputs = ["输出成果文件", "任务执行报告", "元数据记录"];
    if (baseName.includes('采集')) return ["原始遥感影像", ...standardOutputs];
    if (baseName.includes('裁剪')) return ["裁切后影像", ...standardOutputs];
    if (baseName.includes('监测') || baseName.includes('分析')) return ["解译矢量图斑", "分析热力图", ...standardOutputs];
    return standardOutputs;
  }, [sourceNode.name]);

  // 推导目标节点的输入参数（基于 ALGO_CONFIG_MAP）
  const targetInputs = useMemo(() => {
    const baseName = targetNode.name.replace(/\d+$/, '');
    const configs = ALGO_CONFIG_MAP[baseName] || [];
    return configs.map(c => c.label);
  }, [targetNode.name]);

  const handleAddMapping = () => {
    const newMapping: ParamMapping = {
      id: `map-${Date.now()}`,
      sourceParam: sourceOutputs[0] || '',
      targetParam: targetInputs[0] || ''
    };
    onUpdate([...mappings, newMapping]);
  };

  const handleRemoveMapping = (id: string) => {
    onUpdate(mappings.filter(m => m.id !== id));
  };

  const handleChange = (id: string, field: 'sourceParam' | 'targetParam', value: string) => {
    onUpdate(mappings.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="flex flex-col h-full w-[400px] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <span className="text-[16px] font-bold text-slate-800">连接参数绑定</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Source and Target Visual Display */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
             <Link2 size={80} className="rotate-45" />
          </div>
          
          {/* Source */}
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">源算子</span>
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
               {sourceNode.icon}
            </div>
            <span className="text-[13px] font-bold text-slate-700">{sourceNode.name}</span>
          </div>

          {/* Flow Indicator */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="flex items-center text-blue-500 animate-pulse">
               <ArrowRight size={24} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Flow</span>
          </div>

          {/* Target */}
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">目标算子</span>
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
               {targetNode.icon}
            </div>
            <span className="text-[13px] font-bold text-slate-700">{targetNode.name}</span>
          </div>
        </div>

        {/* Mappings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Link2 size={14} className="text-blue-500" /> 数据流向映射
            </h4>
            <button 
              onClick={handleAddMapping}
              className="text-blue-600 hover:text-blue-700 text-[12px] font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-blue-50"
            >
              <Plus size={14} /> 添加映射
            </button>
          </div>

          <div className="space-y-3">
            {mappings.length > 0 ? (
              mappings.map((map) => (
                <div key={map.id} className="flex items-center gap-2 group animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex-1 grid grid-cols-[1fr_20px_1fr] items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm group-hover:border-blue-300 transition-all">
                    {/* Source Param Select */}
                    <div className="relative">
                       <select 
                         value={map.sourceParam}
                         onChange={(e) => handleChange(map.id, 'sourceParam', e.target.value)}
                         className="w-full h-8 pl-2 pr-6 appearance-none bg-transparent text-[12px] text-slate-700 font-medium focus:outline-none cursor-pointer"
                       >
                         {sourceOutputs.map(o => <option key={o} value={o}>{o}</option>)}
                       </select>
                       <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="flex justify-center text-slate-300">
                      <ChevronDown size={14} className="-rotate-90" />
                    </div>

                    {/* Target Param Select */}
                    <div className="relative">
                       <select 
                         value={map.targetParam}
                         onChange={(e) => handleChange(map.id, 'targetParam', e.target.value)}
                         className="w-full h-8 pl-2 pr-6 appearance-none bg-transparent text-[12px] text-slate-700 font-medium focus:outline-none cursor-pointer"
                       >
                         <option value="" disabled>选择输入端口...</option>
                         {targetInputs.length > 0 ? (
                           targetInputs.map(i => <option key={i} value={i}>{i}</option>)
                         ) : (
                           <option value="default">默认输入</option>
                         )}
                       </select>
                       <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveMapping(map.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-2">
                <Box size={32} className="opacity-20" />
                <span className="text-[12px] font-medium">暂未建立任何参数对应关系</span>
                <button onClick={handleAddMapping} className="mt-2 text-blue-600 font-bold text-[12px] hover:underline">点击快速添加</button>
              </div>
            )}
          </div>
        </div>

        {/* Warning Info */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
           <div className="shrink-0 text-amber-500 mt-0.5">
             <Info size={16} />
           </div>
           <div className="space-y-1">
             <p className="text-[12px] font-bold text-amber-800 leading-tight">注意：建立映射后</p>
             <p className="text-[11px] text-amber-700/80 leading-relaxed">
               源算子的输出数据将作为目标算子的指定输入参数进行自动传递。未配置映射的参数将采用默认配置。
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
