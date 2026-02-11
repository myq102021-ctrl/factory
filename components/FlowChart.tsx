
import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Square,
  Database,
  Cloud,
  Zap,
  Layers,
  Layout,
  ScanLine,
  Wheat,
  Sprout,
  Activity,
  BarChart3,
  Grid,
  RotateCcw,
  CloudSun,
  Droplets,
  Share2,
  ChevronRight,
  Maximize,
  X
} from 'lucide-react';
import { ProductionLine } from '../types';

interface Props {
  selectedLine: ProductionLine;
}

// 定义算子元数据映射
const OPERATORS = {
  START: { label: '开始', icon: <PlayCircle size={22} className="text-blue-600" /> },
  END: { label: '结束', icon: <Square size={18} className="text-slate-400 fill-slate-400/10" /> },
  COLLECT: { label: '数据采集', icon: <Database size={20} className="text-blue-500" /> },
  CLOUD_INPUT: { label: '云盘数据输入', icon: <Cloud size={20} className="text-blue-500" /> },
  MERGE: { label: '波段合成', icon: <Zap size={20} className="text-blue-500" /> },
  MOSAIC: { label: '影像镶嵌', icon: <Layers size={20} className="text-blue-500" /> },
  CROP: { label: '影像裁剪', icon: <Layout size={20} className="text-blue-500" /> },
  ABANDON: { label: '农业撂荒监测', icon: <ScanLine size={20} className="text-blue-500" /> },
  RICE_DIST: { label: '水稻种植分布', icon: <Wheat size={20} className="text-blue-500" /> },
  RAPE_DIST: { label: '油菜种植分布', icon: <Sprout size={20} className="text-blue-500" /> },
  GROWTH: { label: '作物长势监测', icon: <Activity size={20} className="text-blue-500" /> },
  YIELD: { label: '作物估产', icon: <BarChart3 size={20} className="text-blue-500" /> },
  GREENHOUSE: { label: '农业大棚监测', icon: <Grid size={20} className="text-blue-500" /> },
  BASE_CHANGE: { label: '生产基地变化监测', icon: <RotateCcw size={20} className="text-blue-500" /> },
  DROUGHT: { label: '旱情监测', icon: <CloudSun size={20} className="text-blue-500" /> },
  SOIL: { label: '耕地熵情反演', icon: <Droplets size={20} className="text-blue-500" /> },
  PUBLISH: { label: '服务发布', icon: <Share2 size={20} className="text-blue-500" /> },
};

export const FlowChart: React.FC<Props> = ({ selectedLine }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 监听 Esc 键退出全屏
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);
  
  // 根据产线信息动态构建流程步骤
  const getSteps = () => {
    const name = selectedLine?.name || '';
    const type = selectedLine?.type || '';

    if (name.includes('交通')) {
      return [OPERATORS.START, OPERATORS.COLLECT, OPERATORS.CROP, OPERATORS.PUBLISH, OPERATORS.END];
    }
    if (name.includes('多源卫星') || name.includes('融合')) {
      return [OPERATORS.START, OPERATORS.CLOUD_INPUT, OPERATORS.MERGE, OPERATORS.MOSAIC, OPERATORS.PUBLISH, OPERATORS.END];
    }
    if (name.includes('农作物') || name.includes('农业')) {
      return [OPERATORS.START, OPERATORS.CLOUD_INPUT, OPERATORS.RICE_DIST, OPERATORS.GROWTH, OPERATORS.YIELD, OPERATORS.PUBLISH, OPERATORS.END];
    }

    switch (type) {
      case '数据采集产线':
        return [OPERATORS.START, OPERATORS.COLLECT, OPERATORS.PUBLISH, OPERATORS.END];
      case '数据处理产线':
        return [OPERATORS.START, OPERATORS.CLOUD_INPUT, OPERATORS.MERGE, OPERATORS.MOSAIC, OPERATORS.CROP, OPERATORS.PUBLISH, OPERATORS.END];
      case '数据治理产线':
        return [OPERATORS.START, OPERATORS.COLLECT, OPERATORS.CROP, OPERATORS.MERGE, OPERATORS.PUBLISH, OPERATORS.END];
      default:
        return [OPERATORS.START, OPERATORS.CLOUD_INPUT, OPERATORS.CROP, OPERATORS.PUBLISH, OPERATORS.END];
    }
  };

  const steps = getSteps();

  // Fix: Added key property to the type definition to resolve the TypeScript error in the map function
  const Node = ({ icon, label, isLast, size = "normal" }: { icon: React.ReactNode; label: string; isLast: boolean; size?: "normal" | "large"; key?: React.Key }) => {
    const isLarge = size === "large";
    return (
      <div className="flex items-center group">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className={`
            ${isLarge ? 'w-32 h-32' : 'w-16 h-16 sm:w-20 sm:h-20'} 
            bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center 
            group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:border-blue-200 
            group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden
          `}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className={`
              ${isLarge ? 'w-20 h-20' : 'w-10 h-10 sm:w-12 sm:h-12'} 
              rounded-xl flex items-center justify-center transition-colors duration-300 relative z-10 
              ${label === '开始' || label === '结束' ? 'bg-slate-50 group-hover:bg-blue-50' : 'bg-blue-50 group-hover:bg-blue-600'}
            `}>
              <div className={`transition-colors duration-300 ${label === '开始' || label === '结束' ? '' : 'group-hover:text-white'} ${isLarge ? 'scale-[1.7]' : ''}`}>
                {icon}
              </div>
            </div>
          </div>
          <span className={`
            mt-4 font-bold text-slate-500 group-hover:text-blue-600 transition-colors tracking-tight text-center px-1 whitespace-nowrap
            ${isLarge ? 'text-[16px]' : 'text-[12px]'}
          `}>
            {label}
          </span>
        </div>
        
        {!isLast && (
          <div className={`${isLarge ? 'px-12' : 'px-2 sm:px-4'} flex items-center justify-center mb-10`}>
             <div className={`${isLarge ? 'w-32' : 'w-8 sm:w-12'} h-[2px] bg-slate-100 relative`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 animate-[flow_2s_infinite]"></div>
                <ChevronRight size={isLarge ? 24 : 14} className="absolute -right-2 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-blue-300 transition-colors" />
             </div>
          </div>
        )}
      </div>
    );
  };

  const ChartContent = ({ size = "normal" as "normal" | "large" }) => (
    <div className="min-h-full flex items-center px-8 py-4">
      {steps.map((step, index) => (
        <Node 
          key={index} 
          icon={step.icon} 
          label={step.label} 
          isLast={index === steps.length - 1} 
          size={size}
        />
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col relative overflow-hidden p-6 font-['Noto_Sans_SC']">
      {/* 顶部标题栏 */}
      <div className="flex items-center mb-8 relative z-10 shrink-0 justify-between">
        <div className="flex items-center">
          <div className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full mr-4 shadow-md shadow-blue-500/20"></div>
          <h3 className="text-[16px] font-extrabold text-slate-800 tracking-tight">产线流程预览</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end bg-blue-50/50 px-4 py-1.5 rounded-xl border border-blue-100/50">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Selected Pipeline</span>
              <span className="text-[13px] font-black text-blue-600 truncate max-w-[200px] leading-none">{selectedLine?.name}</span>
          </div>
          <button 
            onClick={() => setIsFullScreen(true)}
            className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:shadow-sm transition-all active:scale-95 group"
            title="全屏查看"
          >
            <Maximize size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* 流程内容区 */}
      <div className="flex-1 w-full overflow-x-auto relative z-10 custom-scrollbar flex items-center justify-center">
          <div key={selectedLine?.id}>
            <ChartContent size="normal" />
          </div>
      </div>

      {/* 背景装饰 */}
      <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.03] pointer-events-none">
          <Database size={240} />
      </div>

      {/* 全屏 Overlay - 全屏查看产线流程预览图 */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300 flex items-center justify-center p-12">
          <div className="w-full h-full max-w-[1600px] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
            
            {/* 全屏头部 */}
            <div className="h-24 px-12 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                     <Layers size={30} />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-black text-slate-800 tracking-tight leading-none mb-2">{selectedLine?.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded">Fullscreen View</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[13px] text-blue-500 font-bold">{selectedLine?.type}</span>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={() => setIsFullScreen(false)}
                 className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:rotate-90 transition-all duration-300 active:scale-90"
                 title="关闭全屏 (Esc)"
               >
                 <X size={32} strokeWidth={2.5} />
               </button>
            </div>

            {/* 全屏内容区 */}
            <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center justify-center bg-[#fcfdfe] relative">
              {/* 背景装饰图形 */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
                 <Database size={800} className="rotate-12" />
              </div>
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="transform scale-110 xl:scale-125 transition-transform">
                 <ChartContent size="large" />
              </div>
            </div>

            {/* 全屏底部操作栏 */}
            <div className="px-12 py-8 border-t border-slate-100 flex justify-between items-center bg-white shrink-0">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></div>
                    <span className="text-[14px] font-black text-slate-700 tracking-tight">已定义节点: {steps.length} 个算子</span>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Version Instance</p>
                    <p className="text-[14px] text-slate-600 font-mono font-bold">{selectedLine?.version || 'V1.0.0'}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Interaction tip</span>
                    <span className="text-[12px] text-slate-400 font-bold">按下键盘 ESC 键可快速退出预览</span>
                  </div>
                  <button 
                    onClick={() => setIsFullScreen(false)}
                    className="px-10 h-14 bg-slate-900 text-white rounded-2xl font-black text-[15px] hover:bg-black shadow-2xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    退出全屏模式
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}} />
    </div>
  );
};
