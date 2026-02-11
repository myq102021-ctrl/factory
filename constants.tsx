
import { ProductionLine, Algorithm, AlgoConfigParam } from './types';

export const MOCK_DATA: ProductionLine[] = [
  {
    id: '1',
    name: '测试最新-xx-0106',
    code: 'test-xx-0106',
    version: 'V202601061052',
    type: '数据治理产线',
    createTime: '2026-01-06 09:28:01',
    status: '启用',
  },
  {
    id: '2',
    name: '2026-01-验证产线',
    code: '2026-01-test',
    version: 'V202601040939',
    type: '数据治理产线',
    createTime: '2026-01-02 11:25:35',
    status: '停用',
  },
  {
    id: '3',
    name: '1230版本验证产线',
    code: '1230-ver-check',
    version: 'V202512310901',
    type: '数据处理产线',
    createTime: '2025-12-30 21:14:44',
    status: '不可用',
  },
  {
    id: '4',
    name: '智慧交通流量分析',
    code: 'smart-traffic-001',
    version: 'V202601051420',
    type: '数据采集产线',
    createTime: '2026-01-05 14:22:10',
    status: '启用',
  },
  {
    id: '5',
    name: '多源卫星数据融合',
    code: 'sat-fusion-X',
    version: 'V202601030800',
    type: '数据处理产线',
    createTime: '2026-01-03 08:00:00',
    status: '启用',
  }
];

export const MOCK_ALGORITHMS: Algorithm[] = [
  {
    id: 'a1',
    name: '违规建筑自动发现',
    image: 'https://images.unsplash.com/photo-1590066074591-6f7756056340?auto=format&fit=crop&q=80&w=200',
    status: '已提交',
    tags: ['智能解译', '卫星'],
    description: '比对历史与最新遥感影像，自动提取非许可的新增建筑图斑，为城市执法部门提供违建线索。',
    author: '城管监督指挥中心',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arch',
    date: '2024-03-01'
  },
  {
    id: 'a2',
    name: '车辆目标检测',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=200',
    status: '已提交',
    tags: ['可见光', '无人机'],
    description: '在亚米级高分辨率卫星影像上，利用Faster R-CNN等目标检测算法，自动统计停车场或道路...',
    author: '大数据实验室',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lab',
    date: '2024-02-15'
  },
  {
    id: 'a3',
    name: '滑坡风险评估',
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&q=80&w=200',
    status: '已提交',
    tags: ['雷达', '卫星'],
    description: '综合地形地貌、地质构造及降雨数据，结合InSAR形变监测结果，评估区域滑坡易发性及...',
    author: '地质调查局',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Geo',
    date: '2024-01-10'
  },
  {
    id: 'a4',
    name: '夜光遥感经济指数',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=200',
    status: '已提交',
    tags: ['多光谱', '互联网'],
    description: '利用夜间灯光遥感数据，校正饱和与溢出效应，构建夜光指数以评估区域经济发展水平、人口...',
    author: '经济地理研究所',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Econ',
    date: '2023-12-20'
  },
  {
    id: 'a5',
    name: '建筑物变化检测',
    image: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=200',
    status: '已提交',
    tags: ['智能解译', '无人机'],
    description: '基于双时相高分辨率遥感影像，利用深度学习网络自动识别新增、拆除及改扩建建筑物，辅助...',
    author: 'AI创新中心',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AI',
    date: '2023-12-05'
  },
  {
    id: 'a6',
    name: '无人机正射影像...',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=200',
    status: '已提交',
    tags: ['基础处理', '无人机'],
    description: '对无人机采集的多张重叠航拍照片进行特征点匹配、空三加密与镶嵌融合，生成大范围高精度...',
    author: '测绘工程中心',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Map',
    date: '2023-11-30'
  }
];

// Full CSV Data Source containing all 12+ algorithms
export const CSV_DATA_SOURCE = `算法名称,参数设置,参数说明,是否必填
农业撂荒监测,参考耕地范围,支持上传shp、kml、geojson数据，支持本地上传,否
,撂荒地阈值,是一个区间0-1.0 支持用户输入,否
水稻种植分布,,,
油菜种植分布,,,
水稻作物长势监测,输出范围,支持上传shp、kml、geojson数据，支持本地上传,否
油菜作物长势监测,输出范围,支持上传shp、kml、geojson数据，支持本地上传,否
水稻作物估产,输出范围,支持上传shp、kml、geojson数据，支持本地上传,否
油菜作物估产,输出范围,支持上传shp、kml、geojson数据，支持本地上传,否
农业大棚监测,模型,枚举，默认值“sti_sp_greenhouse_0p5_to_1m”,是
,裁剪范围,支持上传shp、kml、geojson数据，支持本地上传,否
生产基地变化监测,输出范围,支持上传shp、kml、geojson数据，支持本地上传,否
旱情监测,输出范围,支持上传shp、kml、geojson数据，支持本地上传,否
耕地熵情反演,输出范围,支持上传shp、kml、geojson数据，支持本地上传,否
数据采集,采集起始日期,请选择采集起始时间,是
,采集结束日期,请选择采集就结束日期,是
,采集地理范围,"请选择采集地理范围，支持上传 .shp, .kml, .geojson",是
,数据来源,请选择数据采集来源，枚举，默认值欧空局,是
,遥感平台,请选择遥感平台，枚举，默认值Sentinel-2,是
,传感器,请选择传感器，枚举，默认值MSI,是
,数据级别,请选择数据级别，枚举，默认值L2A,是
,云量区间选择,选择云量区间，默认0-25%,否
波段合成,波段范围,"示例: 3,2,1表示按B3、B2、B1顺序排列波段，1,2,3表示按B1、B2、B3顺序排列。请输入英文分号隔开的数据。",是
,输出坐标系,枚举：EPSG：4326；EPSG：4490,是
影像镶嵌,输出坐标系,枚举：EPSG：4326；EPSG：4490,是
影像裁剪,裁剪矢量,"支持上传 .shp, .kml, .geojson 格式的矢量范围",是
,输出坐标系,枚举：EPSG：4326；EPSG：4490,是`;

export const parseCsvConfig = (csvText: string) => {
    const lines = csvText.split('\n');
    const configMap: Record<string, AlgoConfigParam[]> = {};
    let currentAlgoName = '';
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols: string[] = [];
      let inQuote = false;
      let currentToken = '';
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') inQuote = !inQuote;
        else if (char === ',' && !inQuote) { cols.push(currentToken.trim()); currentToken = ''; } 
        else currentToken += char;
      }
      cols.push(currentToken.trim());
      const rawName = cols[0]?.trim();
      const paramName = cols[1]?.trim();
      let paramDesc = cols[2]?.trim();
      if (paramDesc && paramDesc.startsWith('"') && paramDesc.endsWith('"')) paramDesc = paramDesc.slice(1, -1);
      const isRequired = cols[3]?.trim() === '是';
      if (rawName) currentAlgoName = rawName;
      if (currentAlgoName && paramName) {
        if (!configMap[currentAlgoName]) configMap[currentAlgoName] = [];
        let type: AlgoConfigParam['type'] = 'text';
        let options: string[] | undefined;
        let defaultValue: any = '';
        if (paramDesc.includes('上传') || paramDesc.includes('文件') || paramDesc.includes('影像')) type = 'file';
        else if (paramName.includes('日期')) type = 'date';
        else if (paramDesc.includes('枚举')) {
          type = 'select';
          let enumPart = paramDesc.includes('枚举：') ? paramDesc.split('枚举：')[1] : paramDesc.includes('枚举,') ? paramDesc.split('枚举,')[1] : paramDesc.split('枚举')[1];
          if (enumPart) {
             const parts = enumPart.split(/[;；]/).map(s => s.trim()).filter(s => s && !s.includes('默认值'));
             if (paramDesc.includes('默认值')) {
                 const match = paramDesc.match(/[“"']([^”"']+)["”']/);
                 if (match) {
                     defaultValue = match[1];
                     options = parts.length > 0 ? (parts.includes(defaultValue) ? parts : [defaultValue, ...parts]) : [defaultValue];
                 } else {
                     const defMatch = paramDesc.match(/默认值\s*([^\s,;，。]+)/);
                     if (defMatch) {
                       defaultValue = defMatch[1];
                       options = parts.length > 0 ? parts : [defaultValue];
                     } else if (parts.length > 0) {
                       options = parts;
                       defaultValue = parts[0];
                     }
                 }
             } else if (parts.length > 0) {
                 options = parts;
                 defaultValue = parts[0];
             }
          }
        }
        configMap[currentAlgoName].push({ label: paramName, description: paramDesc, required: isRequired, type, options, defaultValue });
      }
    }
    return configMap;
};

export const ALGO_CONFIG_MAP = parseCsvConfig(CSV_DATA_SOURCE);
