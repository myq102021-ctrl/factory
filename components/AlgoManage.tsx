
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  ChevronDown, 
  Eye, 
  HelpCircle,
  Box,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Database,
  Zap,
  Layers,
  Layout,
  ScanLine,
  Wheat,
  Sprout,
  Activity,
  BarChart3,
  Grid,
  CloudSun,
  Droplets,
  Share2,
  PlusCircle,
  Star,
  X,
  Info,
  Globe,
  FileJson,
  Upload,
  Calendar,
  FileText,
  Pipette
} from 'lucide-react';

// 定义参数类型接口
interface AlgoParam {
  label: string;
  type: 'select' | 'text' | 'date' | 'file' | 'range';
  required: boolean;
  options?: string[];
  hint?: string;
  icon?: React.ReactNode;
}

// 扩展算子库数据结构，同步产线设计的参数信息
const ALGO_LIBRARY = [
  { 
    name: '数据采集', 
    category: '输入节点', 
    icon: <Database size={24} />, 
    description: '从多源卫星、无人机或IoT设备获取原始时空数据。',
    params: [
      { label: '数据来源', type: 'select', options: ['欧空局'], required: true, icon: <Globe size={16} /> },
      { label: '遥感平台', type: 'select', options: ['Sentinel-2'], required: true, icon: <Box size={16} /> },
      { label: '传感器', type: 'select', options: ['MSI'], required: true, icon: <Activity size={16} /> },
      { label: '数据级别', type: 'select', options: ['L2A'], required: true, icon: <Layers size={16} /> },
      { label: '采集起始日期', type: 'date', required: true, icon: <Calendar size={16} /> },
      { label: '采集结束日期', type: 'date', required: true, icon: <Calendar size={16} /> },
      { label: '采集地理范围', type: 'file', required: true, hint: '支持上传 .shp, .kml, .geojson', icon: <Grid size={16} /> },
      { label: '云量区间选择 (%)', type: 'range', required: true }
    ] as AlgoParam[]
  },
  { 
    name: '波段合成', 
    category: '处理节点', 
    icon: <Zap size={24} />, 
    description: '将不同波段的影像进行合并，生成多光谱影像产品。',
    params: [
      { label: '波段范围', type: 'text', required: true, hint: '示例: 3,2,1表示按B3、B2、B1顺序排列波段，1,2,3表示按B1、B2、B3顺序排列。请输入英文分号隔开的数据。', icon: <Pipette size={16} /> },
      { label: '输出坐标系', type: 'select', options: ['EPSG:4326 (WGS 84)', 'EPSG:4490 (CGCS 2000)'], required: false, icon: <Globe size={16} /> }
    ] as AlgoParam[]
  },
  { 
    name: '影像镶嵌', 
    category: '处理节点', 
    icon: <Layers size={24} />, 
    description: '将多幅相邻影像拼接成大范围的无缝影像图。',
    params: [
      { label: '输出坐标系', type: 'select', options: ['EPSG:4326 (WGS 84)', 'EPSG:4490 (CGCS 2000)'], required: true, icon: <Globe size={16} /> }
    ] as AlgoParam[]
  },
  { 
    name: '影像裁剪', 
    category: '处理节点', 
    icon: <Layout size={24} />, 
    description: '根据矢量边界或坐标范围对影像进行精确裁剪。',
    params: [
      { label: '裁剪矢量路径', type: 'file', required: true, hint: '支持上传 .shp, .kml, .geojson 格式的矢量范围', icon: <FileJson size={16} /> },
      { label: '输出坐标系', type: 'select', options: ['EPSG:4326 (WGS 84)', 'EPSG:4490 (CGCS 2000)'], required: true, icon: <Globe size={16} /> }
    ] as AlgoParam[]
  },
  { 
    name: '服务发布', 
    category: '输出节点', 
    icon: <Share2 size={24} />, 
    description: '将处理完成的数据产品发布为标准OGC地图服务。',
    params: [
      { label: '服务名称', type: 'text', required: true, icon: <FileText size={16} /> },
      { label: '输出坐标系', type: 'select', options: ['EPSG:4326 (WGS 84)', 'EPSG:4490 (CGCS 2000)'], required: true, icon: <Globe size={16} /> }
    ] as AlgoParam[]
  },
  { name: '农业撂荒监测', category: '智能解译节点', icon: <ScanLine size={24} />, description: '基于多时相遥感影像自动识别耕地撂荒区域。' },
  { name: '水稻种植分布', category: '智能解译节点', icon: <Wheat size={24} />, description: '利用深度学习模型提取区域内水稻种植的空间分布。' },
  { name: '油菜种植分布', category: '智能解译节点', icon: <Sprout size={24} />, description: '高精度识别油菜种植区域，支持面积统计与制图。' },
  { name: '水稻作物长势监测', category: '智能解译节点', icon: <Activity size={24} />, description: '通过植被指数分析水稻不同生长期健康状况。' },
  { name: '油菜作物长势监测', category: '智能解译节点', icon: <Activity size={24} />, description: '监测油菜生长关键期的营养与水分状态。' },
  { name: '水稻作物估产', category: '智能解译节点', icon: <BarChart3 size={24} />, description: '结合气象与遥感数据构建产量预测模型。' },
  { name: '油菜作物估产', category: '智能解译节点', icon: <BarChart3 size={24} />, description: '预测油菜成熟期单产与总产，辅助农业决策。' },
  { name: '农业大棚监测', category: '智能解译节点', icon: <Grid size={24} />, description: '自动提取塑料大棚与温室，分析农业设施分布。' },
  { name: '生产基地变化监测', category: '智能解译节点', icon: <RotateCcw size={24} />, description: '对比不同时期的生产基地影像，发现新增或减少。' },
  { name: '旱情监测', category: '智能解译节点', icon: <CloudSun size={24} />, description: '评估区域土壤水分状况，发布干旱风险预警。' },
  { name: '耕地熵情反演', category: '智能解译节点', icon: <Droplets size={24} />, description: '高频次获取耕地表层含水量空间分布信息。' },
];

interface AlgoManageProps {
  onCreateTask?: (algoName?: string) => void;
}

export const AlgoManage: React.FC<AlgoManageProps> = ({ onCreateTask }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlgo, setSelectedAlgo] = useState<typeof ALGO_LIBRARY[0] | null>(null);

  const filterGroups = [
    { 
      id: 'categories', 
      label: '算子分类', 
      items: ['全部', '输入节点', '处理节点', '智能解译节点', '输出节点'] 
    },
    { 
      id: 'sensors', 
      label: '传感器类型', 
      items: ['全部', '可见光', '多光谱', '雷达'] 
    }
  ];

  const filteredAlgos = useMemo(() => {
    return ALGO_LIBRARY.filter(item => 
      item.name.includes(searchQuery) || item.category.includes(searchQuery)
    );
  }, [searchQuery]);

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative h-full">
      
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        
        {/* 左侧筛选面板 */}
        <div className="w-[280px] flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm shrink-0">
          <div className="h-[64px] px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <LayoutGrid size={18} className="text-blue-600" />
              <span className="text-[16px] font-bold text-slate-800">标签筛选</span>
            </div>
            <button className="text-slate-300 hover:text-blue-600 transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="relative">
              <input 
                type="text" 
                placeholder="请输入标签名称" 
                className="w-full h-9 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>

            {filterGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Box size={14} className="text-slate-400" />
                    <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">{group.label}</h3>
                  </div>
                  <ChevronDown size={14} className="text-slate-300" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, i) => (
                    <button 
                      key={i} 
                      className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all border ${
                        item === '全部' 
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm shadow-blue-500/20' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧主内容面板 */}
        <div className="flex-1 flex flex-col border border-white/60 rounded-xl bg-white/95 backdrop-blur-sm overflow-hidden shadow-sm">
          
          <div className="h-[64px] px-5 flex items-center justify-between shrink-0 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-blue-600 rounded-full shadow-sm"></div>
              <h2 className="text-[16px] font-bold text-slate-800 flex items-center gap-1.5">
                算法管理
                <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-blue-400" />
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="搜索算法名称..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>
              <button className="h-9 px-4 bg-blue-600 text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                进入时空智算引擎
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAlgos.map((algo, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full overflow-hidden">
                  
                  <div className="p-5 flex-1">
                    <div className="flex gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-blue-200">
                        {algo.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-[16px] font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {algo.name}
                          </h3>
                          <span className="bg-emerald-50 text-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 shrink-0 uppercase tracking-tighter">
                            已发布
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md border border-blue-100">
                            {algo.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-4 h-[40px]">
                      {algo.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${algo.name}`} className="w-full h-full" alt="avatar" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-600 truncate max-w-[100px]">系统管理员</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 font-mono">2025-05-12</span>
                    </div>
                  </div>

                  <div className="flex items-center border-t border-slate-50 bg-slate-50/20">
                    <button 
                      onClick={() => onCreateTask?.(algo.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-bold text-slate-500 hover:text-blue-600 hover:bg-white transition-all border-r border-slate-50 group/btn"
                    >
                      <PlusCircle size={14} className="text-slate-400 group-hover/btn:text-blue-600" /> 创建任务
                    </button>
                    <button 
                      onClick={() => setSelectedAlgo(algo)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-bold text-slate-500 hover:text-blue-600 hover:bg-white transition-all border-r border-slate-50 group/btn"
                    >
                      <Eye size={14} className="text-slate-400 group-hover/btn:text-blue-600" /> 详情
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-bold text-slate-500 hover:text-blue-600 hover:bg-white transition-all group/btn">
                      <Star size={14} className="text-slate-400 group-hover/btn:text-blue-600" /> 收藏
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部页码区 */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div className="text-[13px] text-slate-500 font-medium">
              共 {filteredAlgos.length} 条
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group">
                <select className="appearance-none h-8 pl-3 pr-8 border border-slate-200 rounded text-[13px] text-slate-600 bg-white hover:border-blue-400 transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-blue-100">
                  <option>10条/页</option>
                  <option>20条/页</option>
                  <option>50条/页</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500" />
              </div>

              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-600 bg-blue-600 text-white text-[13px] font-bold shadow-sm">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium ml-2">
                <span>前往</span>
                <input 
                  type="text" 
                  defaultValue="1" 
                  className="w-12 h-8 border border-slate-200 rounded text-center text-[13px] text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
                />
                <span>页</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 算法详情 Modal */}
      {selectedAlgo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[800px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600">
                  {selectedAlgo.icon}
                </div>
                <div>
                  <h3 className="text-[20px] font-black text-slate-800 tracking-tight">{selectedAlgo.name}</h3>
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">{selectedAlgo.category}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlgo(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="space-y-8">
                <section>
                  <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" /> 算法简介
                  </h4>
                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-[14px] text-slate-600 leading-relaxed font-medium">
                    {selectedAlgo.description}
                  </div>
                </section>

                <section>
                  <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Box size={14} className="text-blue-500" /> 参数定义 (Metadata)
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-[13px] border-collapse">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">参数名称</th>
                          <th className="px-6 py-4">类型</th>
                          <th className="px-6 py-4 text-center">是否必填</th>
                          <th className="px-6 py-4">说明/枚举值</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 bg-white">
                        {selectedAlgo.params ? (
                          selectedAlgo.params.map((param, i) => (
                            <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                                {param.icon && <span className="text-slate-400">{param.icon}</span>}
                                {param.label}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[11px] uppercase border border-slate-200">
                                  {param.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {param.required ? (
                                  <span className="text-rose-500 font-black">是</span>
                                ) : (
                                  <span className="text-slate-300">否</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  {param.hint && (
                                    <div className="flex items-start gap-1.5 text-slate-400 text-[12px] italic">
                                      <Info size={12} className="mt-0.5 shrink-0 text-blue-400" />
                                      <span>{param.hint}</span>
                                    </div>
                                  )}
                                  {param.options && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {param.options.map((opt, oi) => (
                                        <span key={oi} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {!param.hint && !param.options && <span className="text-slate-300">--</span>}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-300 italic">
                              暂无运行时参数定义
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex justify-center gap-4 shrink-0">
               <button 
                 onClick={() => setSelectedAlgo(null)}
                 className="w-32 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-all shadow-sm"
               >
                 关闭预览
               </button>
               <button 
                 onClick={() => {
                   onCreateTask?.(selectedAlgo.name);
                   setSelectedAlgo(null);
                 }}
                 className="w-48 h-11 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 <PlusCircle size={18} /> 基于此算子创建任务
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
