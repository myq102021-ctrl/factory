import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  RotateCcw, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Settings2,
  Lightbulb,
  X, 
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';
import { SatelliteConfig } from '../types';

const INITIAL_MOCK_CONFIGS: SatelliteConfig[] = [
  { id: '1', name: '高分一号', type: 'GF1', payload: '多光谱', code: 'MSS', resolution: '8', regex: '^GF1_.*_MSS.*\\.tif$' },
  { id: '2', name: '高分一号', type: 'GF1', payload: '全色', code: 'PAN', resolution: '2', regex: '^GF1_.*_PAN.*\\.tif$' },
  { id: '3', name: '高分二号', type: 'GF2', payload: '全色/多光谱', code: 'PMS', resolution: '0.8/3.2', regex: '^GF2_.*_PMS.*\\.tif$' },
  { id: '4', name: '高分六号', type: 'GF6', payload: '宽幅', code: 'WFV', resolution: '16', regex: '^GF6_.*_WFV.*\\.tif$' },
  { id: '5', name: '哨兵一号', type: 'Sentinel-1', payload: '合成孔径雷达', code: 'SAR', resolution: '5/20', regex: '^S1[AB]_.*\\.zip$' },
  { id: '6', name: '哨兵二号', type: 'Sentinel-2', payload: '多光谱', code: 'MSI', resolution: '10/20/60', regex: '^S2[AB]_.*\\.SAFE$' },
  { id: '7', name: '陆地卫星8号', type: 'Landsat-8', payload: '多光谱', code: 'OLI/TIRS', resolution: '15/30', regex: '^LC08_.*\\.tar\\.gz$' },
  { id: '8', name: '陆地卫星9号', type: 'Landsat-9', payload: '多光谱', code: 'OLI-2', resolution: '15/30', regex: '^LC09_.*\\.tar\\.gz$' },
];

export const SatelliteConfigView: React.FC = () => {
  // --- Data Persistence Logic Start ---
  const [configs, setConfigs] = useState<SatelliteConfig[]>(() => {
    const saved = localStorage.getItem('app_satellite_configs');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_CONFIGS;
  });

  useEffect(() => {
    localStorage.setItem('app_satellite_configs', JSON.stringify(configs));
  }, [configs]);
  // --- Data Persistence Logic End ---

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // 标签输入内部状态
  const [tagInputValue, setTagInputValue] = useState('');

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    payload: '全色',
    code: '',
    resolution: '',
    regex: ''
  });

  const [regexError, setRegexError] = useState<string | null>(null);

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

  const validateRegex = (value: string) => {
    if (!value) {
      setRegexError(null);
      return true;
    }
    try {
      new RegExp(value);
      setRegexError(null);
      return true;
    } catch (e) {
      setRegexError('正则表达式格式不正确');
      return false;
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setIsViewOnly(false);
    setFormData({
      name: '',
      type: '',
      payload: '全色',
      code: '',
      resolution: '',
      regex: ''
    });
    setTagInputValue('');
    setRegexError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (config: SatelliteConfig) => {
    setEditingId(config.id);
    setIsViewOnly(false);
    setFormData({
      name: config.name,
      type: config.type,
      payload: config.payload,
      code: config.code,
      resolution: config.resolution,
      regex: config.regex || ''
    });
    setTagInputValue('');
    setRegexError(null);
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (config: SatelliteConfig) => {
    setEditingId(config.id);
    setIsViewOnly(true);
    setFormData({
      name: config.name,
      type: config.type,
      payload: config.payload,
      code: config.code,
      resolution: config.resolution,
      regex: config.regex || ''
    });
    setTagInputValue('');
    setRegexError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条卫星配置规则吗？')) {
      setConfigs(prev => prev.filter(c => c.id !== id));
      if (selectedIds.has(id)) {
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
      }
    }
  };

  const handleSaveRule = () => {
    if (isViewOnly) {
      setIsModalOpen(false);
      return;
    }

    if (!formData.name || !formData.type || !formData.code || !formData.resolution) {
      alert('请填写完整的规则信息');
      return;
    }
    if (regexError) {
      alert('请输入正确的正则表达式');
      return;
    }

    if (editingId) {
      // 修改模式
      setConfigs(prev => prev.map(c => 
        c.id === editingId 
          ? { ...c, ...formData } 
          : c
      ));
    } else {
      // 新增模式
      const newRule: SatelliteConfig = {
        id: Date.now().toString(),
        ...formData
      };
      setConfigs([newRule, ...configs]);
    }

    setIsModalOpen(false);
  };

  // --- 标签处理逻辑优化 ---
  const commitTag = () => {
    const val = tagInputValue.trim();
    if (!val) return;
    
    const currentTags = formData.code ? formData.code.split(',').filter(Boolean) : [];
    if (!currentTags.includes(val)) {
      const newCode = [...currentTags, val].join(',');
      setFormData(prev => ({ ...prev, code: newCode }));
    }
    setTagInputValue('');
  };

  const handleAddTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (isViewOnly) return;
    const currentTags = formData.code.split(',').filter(Boolean);
    const newCode = currentTags.filter(tag => tag !== tagToRemove).join(',');
    setFormData({ ...formData, code: newCode });
  };

  const renderTags = () => {
    const tags = formData.code ? formData.code.split(',').filter(Boolean) : [];
    return tags.map((tag, idx) => (
      <span 
        key={idx} 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[12px] font-bold border border-blue-100 group/tag animate-in zoom-in-95 duration-200"
      >
        {tag}
        {!isViewOnly && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
            className="text-blue-300 hover:text-blue-600 transition-colors"
          >
            <X size={12} strokeWidth={3} />
          </button>
        )}
      </span>
    ));
  };

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative h-full">
      <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm min-h-0">
        
        {/* Title Area */}
        <div className="px-6 pt-5 pb-2 flex items-center shrink-0">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full mr-3 shadow-md shadow-blue-500/20"></div>
          <div className="flex items-center gap-2 group relative">
            <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">卫星配置</h2>
            <Lightbulb size={16} className="text-slate-400 cursor-help" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 flex items-center justify-between shrink-0">
          <div className="relative group w-[280px]">
            <input 
              type="text" 
              placeholder="搜索卫星名称、类型或标识..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setConfigs(INITIAL_MOCK_CONFIGS);
                setSearchQuery('');
              }}
              className="h-[36px] px-4 flex items-center justify-center text-slate-600 bg-white border border-slate-200 text-[13px] font-bold hover:bg-slate-50 transition-all rounded-lg shadow-sm"
            >
              <RotateCcw size={16} className="mr-2 text-blue-500" />
              重置数据
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="h-[36px] px-5 flex items-center justify-center text-white bg-[#3B82F6] hover:bg-blue-600 text-[13px] font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 rounded-lg"
            >
              <Plus size={18} className="mr-1.5" />
              添加规则
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="bg-[#f8fafc] text-slate-600 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5 w-14 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer" 
                    checked={filteredConfigs.length > 0 && selectedIds.size === filteredConfigs.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap w-20">序号</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">卫星名称</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">卫星类型</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">载荷类型</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">标识</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">分辨率 (m)</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredConfigs.length > 0 ? (
                filteredConfigs.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`transition-all hover:bg-blue-50/20 group ${selectedIds.has(item.id) ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer" 
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">{index + 1}</td>
                    <td className="px-5 py-4 font-bold text-slate-700 whitespace-nowrap">{item.name}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{item.payload}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1.5">
                        {item.code.split(',').filter(Boolean).map((c, ci) => (
                          <span key={ci} className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[11px] border border-slate-200 uppercase">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-blue-600 font-black whitespace-nowrap">{item.resolution}</td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleOpenDetailModal(item)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded" 
                          title="详情"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEditModal(item)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded" 
                          title="修改"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50 rounded" 
                          title="删除"
                        >
                          <Trash2 size={16} />
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

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="text-[12px] text-slate-500 font-bold">
              共 {filteredConfigs.length} 条数据
          </div>
          
          <div className="flex items-center gap-3">
              <div className="relative">
                <select className="appearance-none h-[28px] pl-3 pr-8 border border-slate-200 rounded-md text-[12px] text-slate-600 bg-white hover:border-blue-400 transition-colors cursor-pointer outline-none focus:border-blue-500">
                    <option>10条/页</option>
                    <option>20条/页</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="flex items-center gap-1.5 mx-2">
                <button className="w-[28px] h-[28px] flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all disabled:opacity-50">
                  <ChevronLeft size={14} />
                </button>
                <button className="w-[28px] h-[28px] flex items-center justify-center rounded bg-blue-600 text-white shadow-md font-bold transition-all text-[12px]">
                  1
                </button>
                <button className="w-[28px] h-[28px] flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[12px] text-slate-500 font-bold">
                <span>前往</span>
                <input 
                  type="text" 
                  defaultValue="1" 
                  className="w-[40px] h-[28px] border border-slate-200 rounded-lg text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-slate-700 transition-all" 
                />
                <span>页</span>
              </div>
          </div>
        </div>

      </div>

      {/* 规则表单弹窗 (新增/编辑/详情) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[640px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                {isViewOnly ? <FileText size={18} className="text-blue-600" /> : <Settings2 size={18} className="text-blue-600" />}
                <h3 className="text-[18px] font-bold text-slate-800">{isViewOnly ? '查看规则' : editingId ? '修改规则' : '添加规则'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar bg-white">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                    {!isViewOnly && <span className="text-rose-500">*</span>} 卫星名称
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="请输入卫星名称"
                    disabled={isViewOnly}
                    className={`w-full h-11 px-4 rounded-xl border transition-all text-[14px] ${
                      isViewOnly 
                        ? 'bg-slate-50 text-slate-600 border-slate-100 font-medium' 
                        : 'bg-white border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                    {!isViewOnly && <span className="text-rose-500">*</span>} 卫星型号
                  </label>
                  <input 
                    type="text" 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    placeholder="示例：GF1 / Sentinel-2"
                    disabled={isViewOnly}
                    className={`w-full h-11 px-4 rounded-xl border transition-all text-[14px] ${
                      isViewOnly 
                        ? 'bg-slate-50 text-slate-600 border-slate-100 font-medium' 
                        : 'bg-white border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                    {!isViewOnly && <span className="text-rose-500">*</span>} 载荷类型
                  </label>
                  <div className="relative group">
                    <select 
                      value={formData.payload}
                      onChange={e => setFormData({...formData, payload: e.target.value})}
                      disabled={isViewOnly}
                      className={`w-full h-11 pl-4 pr-10 appearance-none rounded-xl border transition-all text-[14px] ${
                        isViewOnly 
                          ? 'bg-slate-50 text-slate-600 border-slate-100 font-medium cursor-default' 
                          : 'bg-white border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 cursor-pointer'
                      }`}
                    >
                      <option value="全色">全色</option>
                      <option value="多光谱">多光谱</option>
                      <option value="全色/多光谱">全色/多光谱</option>
                      <option value="合成孔径雷达">合成孔径雷达</option>
                      <option value="高光谱">高光谱</option>
                      <option value="宽幅">宽幅</option>
                    </select>
                    {!isViewOnly && <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                    {!isViewOnly && <span className="text-rose-500">*</span>} 标识
                  </label>
                  <div 
                    className={`w-full min-h-[44px] p-2 rounded-xl border transition-all flex flex-wrap gap-2 items-center ${
                      isViewOnly 
                        ? 'bg-slate-50 border-slate-100' 
                        : 'bg-white border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500'
                    }`}
                  >
                    {renderTags()}
                    {!isViewOnly && (
                      <input 
                        type="text" 
                        value={tagInputValue}
                        onChange={e => setTagInputValue(e.target.value)}
                        onKeyDown={handleAddTagKeyDown}
                        onBlur={commitTag}
                        placeholder={formData.code ? "" : "请输入标识并回车..."}
                        className="flex-1 h-7 min-w-[80px] px-2 bg-transparent text-[14px] outline-none text-slate-700 font-medium"
                      />
                    )}
                    {isViewOnly && !formData.code && <span className="text-slate-400 italic text-[13px] px-2">未设置标识</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                    {!isViewOnly && <span className="text-rose-500">*</span>} 分辨率
                  </label>
                  <input 
                    type="text" 
                    value={formData.resolution}
                    onChange={e => setFormData({...formData, resolution: e.target.value})}
                    placeholder="请输入分辨率，如：2"
                    disabled={isViewOnly}
                    className={`w-full h-11 px-4 rounded-xl border transition-all text-[14px] ${
                      isViewOnly 
                        ? 'bg-slate-50 text-slate-600 border-slate-100 font-black' 
                        : 'bg-white border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[14px] font-bold text-slate-700 flex items-center gap-1">
                    正则表达式
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.regex}
                      onChange={e => {
                        setFormData({...formData, regex: e.target.value});
                        validateRegex(e.target.value);
                      }}
                      placeholder="用于筛选符合规则的文件名"
                      disabled={isViewOnly}
                      className={`w-full h-11 px-4 rounded-xl border transition-all text-[14px] ${
                        isViewOnly 
                          ? 'bg-slate-50 text-slate-600 border-slate-100 font-mono italic' 
                          : regexError 
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/5' 
                            : 'bg-white border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500'
                      }`}
                    />
                    {regexError && !isViewOnly && (
                      <div className="absolute top-full left-0 mt-1 flex items-center gap-1.5 text-rose-500 text-[12px] font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle size={14} />
                        <span>{regexError}</span>
                      </div>
                    )}
                  </div>
                  {!isViewOnly && <p className="text-[11px] text-slate-400 italic pt-1">提示：如果数据资源的文件名匹配此表达式，则认为其符合规则。</p>}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 flex justify-center gap-4 shrink-0 border-t border-slate-100">
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="w-28 h-10 flex items-center justify-center rounded-xl border border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-all"
               >
                 {isViewOnly ? '关闭' : '取消'}
               </button>
               {!isViewOnly && (
                 <button 
                   onClick={handleSaveRule}
                   className="w-40 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                 >
                   {editingId ? '保存修改' : '确认添加'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
