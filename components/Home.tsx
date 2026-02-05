
import React, { useState } from 'react';
import { 
  Plus, 
  Settings2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Cpu,
  Factory,
  ClipboardList,
  Zap,
  MousePointer2,
  Database,
  ChevronRight,
  BarChart3,
  Search,
  CheckCircle2,
  Share2,
  Server,
  Workflow,
  Globe,
  Activity,
  CloudUpload,
  Box,
  Layout
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: { value: string; isUp: boolean };
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, trend, icon, color }) => (
  <div className="flex-1 bg-white/95 border border-white/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
    <div>
      <h3 className="text-slate-400 text-[12px] font-bold mb-1 uppercase tracking-wider">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-black text-slate-800 tracking-tight">{value}</span>
        {unit && <span className="text-slate-400 text-[14px] font-bold ml-1">{unit}</span>}
        {trend && (
          <span className={`flex items-center text-[11px] font-black ml-3 px-2 py-0.5 rounded-full ${trend.isUp ? 'text-blue-600 bg-blue-50' : 'text-rose-600 bg-rose-50'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
  </div>
);

interface MetricBoxProps {
  title: string;
  value: string;
  trend?: string;
  isUp?: boolean;
  chartType?: 'bar' | 'wave' | 'radial' | 'indicator';
}

const MetricBox: React.FC<MetricBoxProps> = ({ title, value, trend, isUp, chartType }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100/60 shadow-sm hover:border-blue-100 transition-colors flex flex-col justify-between h-[110px]">
    <div>
      <h4 className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">{title}</h4>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-[20px] font-black text-slate-800">{value}</span>
        {trend && (
          <span className={`text-[10px] font-bold ml-1.5 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
    <div className="h-8 flex items-end">
      {chartType === 'bar' && (
        <div className="flex items-end gap-1 w-full h-full">
          {[30, 60, 45, 80, 50, 70, 40].map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm bg-blue-500/${i === 3 ? '100' : '20'}`} style={{ height: `${h}%` }} />
          ))}
        </div>
      )}
      {chartType === 'wave' && (
        <div className="w-full h-full relative overflow-hidden opacity-40">
           <svg viewBox="0 0 100 30" className="w-full h-full">
             <path d="M0,15 Q25,5 50,20 T100,10 L100,30 L0,30 Z" fill="#3B82F6" />
           </svg>
        </div>
      )}
      {chartType === 'radial' && (
        <div className="w-8 h-8 rounded-full border-[3px] border-emerald-500/20 border-t-emerald-500 animate-[spin_3s_linear_infinite]" />
      )}
      {chartType === 'indicator' && (
        <div className="flex items-center gap-1.5 text-rose-500 font-black text-[10px]">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" /> WARNING
        </div>
      )}
    </div>
  </div>
);

export const Home: React.FC<{ onAction: (view: 'design' | 'list') => void }> = ({ onAction }) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'wordcloud'>('workflow');

  // Word Cloud configuration designed to map words roughly into continent shapes
  const wordMapData = [
    // North America (Top Left)
    { text: '影像裁剪', size: 'text-[20px]', color: 'text-indigo-400', top: '35%', left: '15%' },
    { text: '数据采集', size: 'text-[16px]', color: 'text-blue-500', top: '30%', left: '18%' },
    { text: '影像镶嵌', size: 'text-[14px]', color: 'text-purple-400', top: '40%', left: '12%' },
    { text: '影像处理', size: 'text-[12px]', color: 'text-slate-400', top: '25%', left: '22%' },

    // South America (Bottom Left)
    { text: '影像镶嵌', size: 'text-[18px]', color: 'text-blue-400', top: '65%', left: '25%' },
    { text: '数据采集', size: 'text-[22px]', color: 'text-purple-500', top: '60%', left: '20%' },
    { text: '影像裁剪', size: 'text-[14px]', color: 'text-indigo-300', top: '75%', left: '23%' },

    // Eurasia (Top Right/Center)
    { text: '波段合成', size: 'text-[38px]', color: 'text-blue-600', top: '40%', left: '55%' },
    { text: '服务发布', size: 'text-[28px]', color: 'text-indigo-500', top: '35%', left: '62%' },
    { text: '影像镶嵌', size: 'text-[24px]', color: 'text-purple-600', top: '48%', left: '58%' },
    { text: '数据采集', size: 'text-[32px]', color: 'text-blue-500', top: '32%', left: '50%' },
    { text: '影像裁剪', size: 'text-[20px]', color: 'text-indigo-400', top: '42%', left: '45%' },
    { text: '特征提取', size: 'text-[16px]', color: 'text-slate-400', top: '38%', left: '70%' },
    { text: '模型推理', size: 'text-[14px]', color: 'text-blue-300', top: '45%', left: '72%' },
    { text: '波段合成', size: 'text-[18px]', color: 'text-purple-400', top: '30%', left: '58%' },
    { text: '质量核查', size: 'text-[15px]', color: 'text-slate-500', top: '28%', left: '52%' },

    // Africa (Center Bottom)
    { text: '影像镶嵌', size: 'text-[22px]', color: 'text-indigo-500', top: '62%', left: '48%' },
    { text: '服务发布', size: 'text-[20px]', color: 'text-blue-500', top: '72%', left: '52%' },
    { text: '影像裁剪', size: 'text-[18px]', color: 'text-purple-500', top: '68%', left: '46%' },
    { text: '数据采集', size: 'text-[14px]', color: 'text-slate-400', top: '58%', left: '50%' },

    // Australia (Bottom Right)
    { text: '影像镶嵌', size: 'text-[18px]', color: 'text-indigo-400', top: '72%', left: '75%' },
    { text: '数据采集', size: 'text-[14px]', color: 'text-blue-300', top: '75%', left: '78%' },
    { text: '波段合成', size: 'text-[12px]', color: 'text-slate-300', top: '68%', left: '72%' },
  ];

  return (
    <div className="flex-1 flex flex-col p-3 overflow-hidden h-full">
      <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/10 border border-white/50 p-4 gap-4 overflow-hidden relative">
        
        {/* Top Header & Summary Stats */}
        <div className="flex flex-col gap-4 shrink-0">
          <div className="flex justify-between items-end px-2">
            <div>
              <h2 className="text-[16px] font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase">
                数据概览
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-bold text-slate-400">
               <Clock size={14} /> 2025-05-12 10:45:22
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="算子总数 / OPERATORS" 
              value="128" 
              trend={{ value: "12%", isUp: true }}
              icon={<Cpu size={24} />}
              color="bg-blue-600"
            />
            <StatCard 
              title="产线总数 / LINES" 
              value="8" 
              unit="条"
              icon={<Factory size={24} />}
              color="bg-indigo-600"
            />
            <StatCard 
              title="任务总数 / TASKS" 
              value="156" 
              trend={{ value: "8%", isUp: true }}
              icon={<ClipboardList size={24} />}
              color="bg-purple-600"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          <div className="flex-[4] flex flex-col gap-4 overflow-hidden min-h-0">
            {/* View Switching Panel */}
            <div className="flex-1 bg-white/95 border border-white/60 rounded-xl p-5 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center gap-8 mb-4 border-b border-slate-100/60 shrink-0">
                <button 
                  onClick={() => setActiveTab('workflow')}
                  className={`pb-3 text-[15px] font-black transition-all relative ${activeTab === 'workflow' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  时空数智工厂流程图
                  {activeTab === 'workflow' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('wordcloud')}
                  className={`pb-3 text-[15px] font-black transition-all relative ${activeTab === 'wordcloud' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  算子词云
                  {activeTab === 'wordcloud' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                </button>
              </div>

              <div className="flex-1 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-center relative overflow-hidden">
                
                {activeTab === 'workflow' ? (
                  /* Workflow Diagram View (Unchanged logic) */
                  <div className="w-full h-full max-w-[1200px] relative animate-in fade-in duration-500">
                    <svg viewBox="0 0 1200 450" className="w-full h-full drop-shadow-lg overflow-visible">
                      <defs>
                          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                          </linearGradient>
                      </defs>
                      <g className="flow-lines">
                          <path d="M1050,320 L950,220" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M900,200 L800,120" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M700,110 L630,150" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M580,220 L580,250" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M500,280 L350,180" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M270,160 L170,200" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M170,270 L300,330" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="6,4">
                              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                          </path>
                      </g>
                      {[
                        { x: 1050, y: 350, label: '数据源管理', color: '#3B82F6' },
                        { x: 920, y: 200, label: '数据源接入入库', color: '#3B82F6' },
                        { x: 750, y: 100, label: '数据检验与匹配', color: '#3B82F6' },
                        { x: 580, y: 180, label: '产线设计与编排', color: '#3B82F6' },
                        { x: 580, y: 310, label: '产线自动化处理', color: '#3B82F6', isHub: true },
                        { x: 310, y: 160, label: '智能任务调度', color: '#3B82F6' },
                        { x: 170, y: 240, label: '产品服务发布', color: '#3B82F6' },
                        { x: 350, y: 360, label: '数据中心调用', color: '#3B82F6' },
                      ].map((node, i) => (
                        <g key={i} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer group">
                          <rect 
                              x={node.isHub ? -60 : -45} 
                              y={node.isHub ? -45 : -35} 
                              width={node.isHub ? 120 : 90} 
                              height={node.isHub ? 90 : 70} 
                              rx="8" 
                              fill="white" 
                              stroke={node.color} 
                              strokeWidth={node.isHub ? 2.5 : 1} 
                              transform="skewY(-15)" 
                              className="transition-all duration-300 shadow-xl group-hover:stroke-blue-500"
                          />
                          <circle r="6" fill={node.color} transform="translate(0, -10)" className="group-hover:scale-125 transition-transform" />
                          <text y="55" textAnchor="middle" className={`text-[11px] font-black uppercase fill-slate-700 tracking-tight transition-all group-hover:fill-blue-600 ${node.isHub ? 'text-[13px]' : ''}`}>
                              {node.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                ) : (
                  /* Updated Word Cloud View - Words form the World Map */
                  <div className="w-full h-full relative animate-in fade-in zoom-in duration-1000 bg-white/10 flex items-center justify-center">
                    {/* Ghost Guide Background (Very Subtle) */}
                    <div className="absolute inset-0 opacity-[0.04] p-12 pointer-events-none">
                      <svg viewBox="0 0 1000 500" className="w-full h-full fill-slate-800">
                        <path d="M150,150 Q160,140 180,145 T220,130 T260,140 T300,120 T350,140 T380,110 T420,130 T460,115 T500,140 T540,120 T580,145 T620,130 T660,150 T700,135 T750,160 T800,140 T850,165 T900,150 L900,350 Q850,370 800,350 T750,380 T700,360 T650,390 T600,370 T550,400 T500,380 T450,410 T400,390 T350,420 T300,400 T250,430 T200,410 T150,430 Z" />
                      </svg>
                    </div>

                    {/* Word Clusters Forming Continents */}
                    <div className="absolute inset-0 overflow-hidden">
                      {wordMapData.map((word, i) => (
                        <div 
                          key={i} 
                          className={`absolute ${word.size} ${word.color} font-black tracking-tight cursor-default transition-all duration-700 hover:scale-125 hover:brightness-110 select-none drop-shadow-sm hover:z-50 animate-in fade-in duration-500`}
                          style={{ 
                            top: word.top, 
                            left: word.left, 
                            animationDelay: `${i * 30}ms`,
                            transform: `translate(-50%, -50%) rotate(${Math.random() * 4 - 2}deg)`
                          }}
                        >
                          {word.text}
                        </div>
                      ))}
                    </div>

                    {/* Geographical Labels (Optional for depth) */}
                    <div className="absolute top-[20%] left-[20%] text-[10px] text-slate-200 font-bold uppercase pointer-events-none">Americas</div>
                    <div className="absolute top-[20%] left-[55%] text-[10px] text-slate-200 font-bold uppercase pointer-events-none">Eurasia</div>
                    <div className="absolute bottom-[20%] left-[50%] text-[10px] text-slate-200 font-bold uppercase pointer-events-none">Africa</div>

                    <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[12px] font-bold text-slate-400/40 uppercase">
                      <Globe size={14} /> Global Operator Ecosystem
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Panel Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricBox title="执行中任务" value="14" isUp={true} trend="5%" chartType="bar" />
                <MetricBox title="成功任务数" value="142" chartType="radial" />
                <MetricBox title="平均耗时" value="4.2m" trend="0.3" isUp={false} chartType="wave" />
                <MetricBox title="异常率" value="1.2%" trend="3%" isUp={true} chartType="indicator" />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
            {/* Quick Action Panel */}
            <div className="bg-white/95 border border-white/60 rounded-xl p-5 shadow-sm shrink-0">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-blue-600" />
                快捷操作 / Actions
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => onAction('list')}
                  className="w-full h-10 bg-blue-600 text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Plus size={16} /> 创建新任务
                </button>
                <button 
                  onClick={() => onAction('design')}
                  className="w-full h-10 bg-slate-800 text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-sm active:scale-[0.98]"
                >
                  <MousePointer2 size={16} /> 进入产线设计
                </button>
              </div>
            </div>

            {/* Recent Tasks Panel */}
            <div className="flex-1 bg-white/95 border border-white/60 rounded-xl p-5 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-tighter">最新动态 / Activity</h3>
                <ChevronRight size={14} className="text-slate-400" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {[
                  { title: '智能质检任务 #T2001', status: 'RUNNING', color: 'blue' },
                  { title: '生产流程优化 #T2002', status: 'DONE', color: 'emerald' },
                  { title: '设备维护计划 #T2003', status: 'PENDING', color: 'amber' },
                  { title: '能源消耗分析 #T2004', status: 'RUNNING', color: 'blue' },
                  { title: '性能回归测试 #T2005', status: 'DONE', color: 'emerald' },
                  { title: '基础数据同步 #T2006', status: 'DONE', color: 'emerald' },
                ].map((task, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      task.color === 'blue' ? 'bg-blue-600' :
                      task.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[12px] font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{task.title}</h4>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">10:45:22</span>
                        <span className={`text-[9px] font-black px-1.5 rounded ${
                          task.color === 'blue' ? 'text-blue-600 bg-blue-50' :
                          task.color === 'emerald' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                        }`}>{task.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
