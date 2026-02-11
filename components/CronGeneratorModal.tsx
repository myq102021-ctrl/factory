
import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, ChevronRight, Info, Plus, Minus } from 'lucide-react';

interface CronGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (cron: string) => void;
}

type CronUnit = 'second' | 'minute' | 'hour' | 'day' | 'month';

export const CronGeneratorModal: React.FC<CronGeneratorModalProps> = ({ visible, onClose, onSave }) => {
  const [activeUnit, setActiveUnit] = useState<CronUnit>('second');
  
  // 简单模拟 Cron 状态
  const [configs, setConfigs] = useState<Record<CronUnit, any>>({
    second: { type: 'every', start: 3, interval: 5, range: [1, 10], specific: [] },
    minute: { type: 'every' },
    hour: { type: 'every' },
    day: { type: 'every' },
    month: { type: 'every' }
  });

  const units = [
    { id: 'second', label: '秒', icon: <Calendar size={14} /> },
    { id: 'minute', label: '分', icon: <Calendar size={14} /> },
    { id: 'hour', label: '时', icon: <Calendar size={14} /> },
    { id: 'day', label: '天', icon: <Calendar size={14} /> },
    { id: 'month', label: '月', icon: <Calendar size={14} /> },
  ];

  const generatedCron = useMemo(() => {
    // 简化版生成逻辑，仅用于演示 UI
    return configs.second.type === 'every' ? '* * * * * ?' : '0/5 * * * * ?';
  }, [configs]);

  const futureTimes = [
    "2026-02-02 10:59:02",
    "2026-02-02 10:59:03",
    "2026-02-02 10:59:04",
    "2026-02-02 10:59:05",
    "2026-02-02 10:59:06",
  ];

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[650px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4 duration-300">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[18px] font-black text-slate-800">corn表达式</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-all hover:rotate-90">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-slate-50/30 flex-1">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
             {/* 顶部 Tabs */}
             <div className="flex bg-[#F8FAFC] border-b border-slate-100">
                {units.map(unit => (
                  <button 
                    key={unit.id}
                    onClick={() => setActiveUnit(unit.id as CronUnit)}
                    className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-[14px] font-bold transition-all border-r last:border-r-0 ${activeUnit === unit.id ? 'bg-white text-blue-600 border-b-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {unit.icon} {unit.label}
                  </button>
                ))}
             </div>

             {/* 配置区域 */}
             <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <label className="flex items-center gap-4 group cursor-pointer">
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={configs[activeUnit].type === 'every'} 
                    onChange={() => setConfigs({...configs, [activeUnit]: {...configs[activeUnit], type: 'every'}})}
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${configs[activeUnit].type === 'every' ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-300'}`}>
                    {configs[activeUnit].type === 'every' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                  <span className={`text-[14px] font-bold ${configs[activeUnit].type === 'every' ? 'text-blue-600' : 'text-slate-600'}`}>每一{units.find(u => u.id === activeUnit)?.label}钟</span>
                </label>

                <div className="flex items-center gap-4 group">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={configs[activeUnit].type === 'interval'} 
                      onChange={() => setConfigs({...configs, [activeUnit]: {...configs[activeUnit], type: 'interval'}})}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${configs[activeUnit].type === 'interval' ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-300'}`}>
                      {configs[activeUnit].type === 'interval' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <span className={`text-[14px] font-bold ${configs[activeUnit].type === 'interval' ? 'text-blue-600' : 'text-slate-600'}`}>每隔</span>
                  </label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-9">
                    <button className="px-2 hover:bg-slate-50 text-slate-400"><Minus size={14}/></button>
                    <input type="text" value={configs[activeUnit].interval} className="w-12 text-center text-[13px] outline-none font-bold text-slate-700" readOnly />
                    <button className="px-2 hover:bg-slate-50 text-slate-400"><Plus size={14}/></button>
                  </div>
                  <span className="text-[14px] font-bold text-slate-600">{units.find(u => u.id === activeUnit)?.label}执行 从</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-9">
                    <button className="px-2 hover:bg-slate-50 text-slate-400"><Minus size={14}/></button>
                    <input type="text" value={configs[activeUnit].start} className="w-12 text-center text-[13px] outline-none font-bold text-slate-700" readOnly />
                    <button className="px-2 hover:bg-slate-50 text-slate-400"><Plus size={14}/></button>
                  </div>
                  <span className="text-[14px] font-bold text-slate-600">{units.find(u => u.id === activeUnit)?.label}开始</span>
                </div>

                <label className="flex items-center gap-4 group cursor-pointer opacity-50">
                  <div className={`w-5 h-5 rounded-full border-2 border-slate-300`} />
                  <span className="text-[14px] font-bold text-slate-600">具体{units.find(u => u.id === activeUnit)?.label}数(可多选)</span>
                </label>

                <div className="flex items-center gap-4 group">
                   <label className="flex items-center gap-4 cursor-pointer">
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={configs[activeUnit].type === 'range'} 
                      onChange={() => setConfigs({...configs, [activeUnit]: {...configs[activeUnit], type: 'range'}})}
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${configs[activeUnit].type === 'range' ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-300'}`}>
                      {configs[activeUnit].type === 'range' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <span className={`text-[14px] font-bold ${configs[activeUnit].type === 'range' ? 'text-blue-600' : 'text-slate-600'}`}>周期从</span>
                  </label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-9">
                    <input type="text" value={configs[activeUnit].range[0]} className="w-12 text-center text-[13px] outline-none font-bold" readOnly />
                  </div>
                  <span className="text-[14px] font-bold text-slate-600">到</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-9">
                    <input type="text" value={configs[activeUnit].range[1]} className="w-12 text-center text-[13px] outline-none font-bold" readOnly />
                  </div>
                  <span className="text-[14px] font-bold text-slate-600">{units.find(u => u.id === activeUnit)?.label}</span>
                </div>

                <div className="pt-8 border-t border-slate-100 mt-4">
                  <div className="mb-4">
                     <span className="text-[15px] font-bold text-slate-700">cron表达式：</span>
                     <span className="text-[16px] font-mono font-black text-blue-600 tracking-widest ml-1">{generatedCron}</span>
                  </div>
                  
                  <div className="bg-[#fdfdfd] border border-slate-100 rounded-xl p-6">
                    <h4 className="text-[13px] font-bold text-slate-500 mb-4">根据当前时间及表达式预估未来 5 次执行时间：</h4>
                    <div className="space-y-3 pl-6">
                      {futureTimes.map((t, idx) => (
                        <div key={idx} className="font-mono text-[14px] text-slate-600 flex items-center gap-4">
                          <span className="w-4 h-4 rounded bg-slate-100 text-slate-400 text-[10px] flex items-center justify-center font-bold">{idx + 1}</span>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-white border-t border-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="w-28 h-10 border border-slate-200 rounded-lg text-slate-500 font-bold hover:bg-slate-50 transition-all">关闭</button>
          <button onClick={() => onSave(generatedCron)} className="w-28 h-10 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">保存</button>
        </div>
      </div>
    </div>
  );
};
