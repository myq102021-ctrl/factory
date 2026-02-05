
import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Settings2, 
  Search, 
  Cloud, 
  Calendar, 
  Database, 
  Play, 
  RefreshCcw, 
  ChevronRight, 
  CheckSquare, 
  AlertCircle,
  Loader2,
  Box
} from 'lucide-react';
import { DataResourceSelector } from './DataResourceSelector';
import { MockApi } from '../services/mockApi';
import { SatelliteConfig, ResourceItem } from '../types';

interface LinkedDataSelectorProps {
  initialPath?: string;
  onConfirm: (results: ResourceItem[], path: string, rules: any) => void;
  mode?: 'embedded' | 'modal'; // embedded: for property panel, modal: for full screen dialog
}

export const LinkedDataSelector: React.FC<LinkedDataSelectorProps> = ({ 
  initialPath = '', 
  onConfirm,
  mode = 'modal' 
}) => {
  // State
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Rule State
  const [rules, setRules] = useState({
    satellite: '',
    sensor: '',
    dateStart: '',
    dateEnd: '',
    cloudCover: 20,
    regex: ''
  });

  // Data State
  const [results, setResults] = useState<ResourceItem[]>([]);
  const [satConfigs, setSatConfigs] = useState<SatelliteConfig[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load Satellite Configs
  useEffect(() => {
    const saved = localStorage.getItem('app_satellite_configs');
    if (saved) {
      setSatConfigs(JSON.parse(saved));
    } else {
        // Fallback default
        setSatConfigs([
            { id: '1', name: '高分一号', type: 'GF1', payload: 'PMS', code: 'PMS', resolution: '2' },
            { id: '2', name: 'Sentinel-2', type: 'Sentinel-2', payload: 'MSI', code: 'MSI', resolution: '10' }
        ]);
    }
  }, []);

  const handlePathConfirm = (result: string | ResourceItem) => {
    if (typeof result === 'string') {
      setCurrentPath(result);
      setIsBrowseOpen(false);
      // Auto-reset results when path changes
      setResults([]);
      setHasSearched(false);
    }
  };

  const handleMatch = async () => {
    if (!currentPath) {
      alert('请先选择数据路径');
      return;
    }
    setLoading(true);
    setHasSearched(false);
    
    try {
      // Call standard backend interface
      const data = await MockApi.matchResources(currentPath, rules);
      setResults(data);
      setHasSearched(true);
      // Call confirm to sync with parent immediately
      onConfirm(data, currentPath, rules);
    } catch (e) {
      console.error(e);
      alert('匹配失败');
    } finally {
      setLoading(false);
    }
  };

  const uniqueSatTypes = Array.from(new Set(satConfigs.map(c => c.type)));
  // Filter sensors based on selected satellite type
  const availableSensors = satConfigs.filter(c => !rules.satellite || c.type === rules.satellite).map(c => c.payload);
  // Remove duplicates
  const uniqueSensors = Array.from(new Set(availableSensors));

  return (
    <div className={`flex flex-col gap-4 ${mode === 'modal' ? 'h-full' : ''}`}>
      
      {/* 1. Path Anchoring */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FolderOpen size={14} className="text-blue-500" />
            数据路径 (Root Path)
          </label>
          <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">Step 1</span>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              value={currentPath}
              readOnly
              placeholder="请选择云端数据目录..."
              className="w-full h-10 pl-3 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
            {currentPath && <CheckSquare size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
          </div>
          <button 
            onClick={() => setIsBrowseOpen(true)}
            className="px-4 h-10 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all whitespace-nowrap"
          >
            浏览...
          </button>
        </div>
      </div>

      {/* 2. Match Rules */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
             <Settings2 size={14} className="text-blue-500" />
             匹配规则 (Rules)
           </label>
           <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">Step 2</span>
        </div>
        
        <div className="p-5 grid grid-cols-2 gap-4">
           {/* Satellite */}
           <div className="space-y-1.5">
             <span className="text-[12px] font-bold text-slate-600">卫星类型</span>
             <div className="relative">
               <select 
                 className="w-full h-9 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                 value={rules.satellite}
                 onChange={(e) => setRules({...rules, satellite: e.target.value})}
               >
                 <option value="">全部卫星</option>
                 {uniqueSatTypes.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
               <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
             </div>
           </div>

           {/* Sensor (Dynamic) */}
           <div className="space-y-1.5">
             <span className="text-[12px] font-bold text-slate-600">传感器/载荷</span>
             <div className="relative">
               <select 
                 className="w-full h-9 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                 value={rules.sensor}
                 onChange={(e) => setRules({...rules, sensor: e.target.value})}
                 disabled={!rules.satellite && uniqueSensors.length > 5} // Disable if too many options, or enable always
               >
                 <option value="">全部载荷</option>
                 {uniqueSensors.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
             </div>
           </div>

           {/* Date Range */}
           <div className="col-span-2 space-y-1.5">
             <span className="text-[12px] font-bold text-slate-600 flex items-center gap-1"><Calendar size={12}/> 时间范围</span>
             <div className="flex items-center gap-2">
                <input 
                    type="date" 
                    className="flex-1 h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:border-blue-500 hover:bg-white transition-colors"
                    value={rules.dateStart}
                    onChange={(e) => setRules({...rules, dateStart: e.target.value})}
                />
                <span className="text-slate-300">-</span>
                <input 
                    type="date" 
                    className="flex-1 h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:border-blue-500 hover:bg-white transition-colors"
                    value={rules.dateEnd}
                    onChange={(e) => setRules({...rules, dateEnd: e.target.value})}
                />
             </div>
           </div>

           {/* Cloud Cover */}
           <div className="col-span-2 space-y-2 pt-1">
              <div className="flex justify-between items-center text-[12px]">
                 <span className="font-bold text-slate-600 flex items-center gap-1"><Cloud size={12}/> 云量阈值</span>
                 <span className="font-mono text-blue-600 font-bold">{rules.cloudCover}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={rules.cloudCover} 
                onChange={(e) => setRules({...rules, cloudCover: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
           </div>

           {/* Regex */}
           <div className="col-span-2 space-y-1.5 border-t border-slate-100 pt-3 mt-1">
             <span className="text-[12px] font-bold text-slate-600 flex items-center gap-1"><Database size={12}/> 文件名正则匹配</span>
             <input 
                type="text" 
                placeholder="例如: .*_L2A_.*.zip"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-mono focus:outline-none focus:border-blue-500 hover:bg-white transition-colors"
                value={rules.regex}
                onChange={(e) => setRules({...rules, regex: e.target.value})}
             />
           </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
           <button 
             onClick={() => setRules({ satellite: '', sensor: '', dateStart: '', dateEnd: '', cloudCover: 20, regex: '' })}
             className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-bold hover:bg-white hover:text-slate-700 transition-all flex items-center justify-center gap-1"
           >
             <RefreshCcw size={14} /> 重置
           </button>
           <button 
             onClick={handleMatch}
             disabled={!currentPath || loading}
             className="flex-[2] h-9 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
           >
             {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
             执行动态匹配
           </button>
        </div>
      </div>

      {/* 3. Results Feedback */}
      {(hasSearched || results.length > 0) && (
        <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden ${mode === 'embedded' ? 'flex-1 min-h-[200px]' : 'flex-1'}`}>
           <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Box size={14} className="text-blue-500" />
                匹配结果 ({results.length})
              </label>
              <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">Step 3</span>
           </div>
           
           <div className="flex-1 overflow-auto custom-scrollbar p-0 relative">
              {results.length > 0 ? (
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead className="bg-white sticky top-0 z-10 shadow-sm text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-bold border-b border-slate-100 w-1/2">文件名</th>
                      <th className="px-4 py-2 font-bold border-b border-slate-100">大小</th>
                      <th className="px-4 py-2 font-bold border-b border-slate-100 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map((file) => (
                      <tr key={file.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-2 font-mono text-slate-700 truncate max-w-[200px]" title={file.name}>{file.name}</td>
                        <td className="px-4 py-2 text-slate-500">{file.size || '-'}</td>
                        <td className="px-4 py-2 text-right text-blue-600 font-bold cursor-pointer hover:underline">预览</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                   <AlertCircle size={24} className="mb-2 opacity-50" />
                   <p className="text-[12px]">当前路径下无匹配数据</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Internal Modal for Path Selection */}
      <DataResourceSelector 
        visible={isBrowseOpen}
        title="选择数据路径锚点"
        selectionType="folder" // Restrict to folder selection
        onClose={() => setIsBrowseOpen(false)}
        onConfirm={handlePathConfirm}
      />
    </div>
  );
};
