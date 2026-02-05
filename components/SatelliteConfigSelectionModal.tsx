
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  X, 
  Eye, 
  Settings2,
  FileText
} from 'lucide-react';
import { SatelliteConfig } from '../types';

interface SatelliteConfigSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
}

export const SatelliteConfigSelectionModal: React.FC<SatelliteConfigSelectionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialSelectedIds = []
}) => {
  const [configs, setConfigs] = useState<SatelliteConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  
  // Detail Modal State
  const [detailConfig, setDetailConfig] = useState<SatelliteConfig | null>(null);

  useEffect(() => {
    if (visible) {
      const saved = localStorage.getItem('app_satellite_configs');
      if (saved) {
        setConfigs(JSON.parse(saved));
      }
      setSelectedIds(new Set(initialSelectedIds));
    }
  }, [visible, initialSelectedIds]);

  const filteredConfigs = useMemo(() => {
    return configs.filter(c => 
      c.name.includes(searchQuery) || 
      c.type.includes(searchQuery) || 
      c.code.includes(searchQuery)
    );
  }, [configs, searchQuery]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredConfigs.length && filteredConfigs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredConfigs.map(c => c.id)));
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[900px] h-[700px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in slide-in-from-top-4">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <h3 className="text-[16px] font-bold text-slate-800">数据匹配</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-slate-50/30 border-b border-slate-50">
            <div className="relative group w-[320px]">
                <input 
                type="text" 
                placeholder="搜索卫星名称、类型或标识..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar px-6 bg-white">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="bg-[#f8fafc] text-slate-600 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 w-14 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer" 
                    checked={filteredConfigs.length > 0 && selectedIds.size === filteredConfigs.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap w-16">序号</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap">卫星名称</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap">卫星类型</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap">载荷类型</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap">标识</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap">分辨率 (m)</th>
                <th className="px-4 py-3.5 font-bold whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredConfigs.length > 0 ? (
                filteredConfigs.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`transition-all hover:bg-blue-50/20 group ${selectedIds.has(item.id) ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer" 
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="px-4 py-4 text-slate-500 font-medium whitespace-nowrap">{index + 1}</td>
                    <td className="px-4 py-4 font-bold text-slate-700 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{item.type}</td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{item.payload}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[11px] border border-slate-200 uppercase">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-blue-600 font-black whitespace-nowrap">{item.resolution}</td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center opacity-60 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setDetailConfig(item)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded" 
                          title="详情"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <Settings2 size={48} className="opacity-10 mb-2" />
                       <p className="text-[13px]">暂无符合规则的卫星配置数据</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white border-t border-slate-50 flex justify-end gap-3 shrink-0">
           <button 
             onClick={onClose}
             className="w-28 h-10 flex items-center justify-center rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-all text-[14px]"
           >
             取消
           </button>
           <button 
             onClick={() => onConfirm(Array.from(selectedIds))}
             className="w-40 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-[14px]"
           >
             确定匹配
           </button>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      {detailConfig && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-4 animate-in fade-in duration-200">
            <div className="bg-white w-[500px] rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button onClick={() => setDetailConfig(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={18} /></button>
                <div className="flex items-center gap-2 mb-6">
                    <FileText size={20} className="text-blue-600" />
                    <h3 className="text-[16px] font-bold text-slate-800">规则详情</h3>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[12px] font-bold text-slate-400 mb-1">卫星名称</label>
                            <div className="text-[14px] font-medium text-slate-700">{detailConfig.name}</div>
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-400 mb-1">卫星型号</label>
                            <div className="text-[14px] font-medium text-slate-700">{detailConfig.type}</div>
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-400 mb-1">载荷类型</label>
                            <div className="text-[14px] font-medium text-slate-700">{detailConfig.payload}</div>
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-400 mb-1">标识</label>
                            <div className="text-[14px] font-medium text-slate-700">{detailConfig.code}</div>
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-400 mb-1">分辨率</label>
                            <div className="text-[14px] font-medium text-slate-700">{detailConfig.resolution}m</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[12px] font-bold text-slate-400 mb-1">正则表达式</label>
                        <div className="text-[13px] font-mono text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 break-all">
                            {detailConfig.regex || '未设置'}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => setDetailConfig(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-200">关闭</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
