
import { ResourceItem, SatelliteConfig } from '../types';

export const MOCK_RESOURCES: ResourceItem[] = [
  // 根目录 Level 1
  { id: 'hubei', name: '湖北省', parentId: 'root', type: 'folder', folderSubType: 'normal', date: '2025-01-10 10:00:00' },
  { id: 'guangdong', name: '广东省', parentId: 'root', type: 'folder', folderSubType: 'normal', date: '2025-01-12 09:20:00' },
  { id: 'gf_series', name: '高分系列数据', parentId: 'root', type: 'folder', folderSubType: 'normal', date: '2025-02-10 14:00:00' },
  { id: 'sentinel_series', name: 'Sentinel哨兵数据', parentId: 'root', type: 'folder', folderSubType: 'normal', date: '2026-01-02 08:30:00' },
  { id: 'landsat_series', name: 'Landsat陆地卫星', parentId: 'root', type: 'folder', folderSubType: 'normal', date: '2025-02-15 11:20:00' },
  { id: 'preview_folder', name: '支持预览的数据', parentId: 'root', type: 'folder', folderSubType: 'normal', date: '2026-02-18 10:00:00' },
  { id: 'zy_series', name: '资源系列数据', parentId: 'root', type: 'folder', folderSubType: 'public', date: '2025-02-18 16:45:00' },

  // 支持预览的数据文件夹内部
  { 
    id: 'p_txt', name: '系统操作指南.txt', parentId: 'preview_folder', type: 'file', fileType: 'txt', size: '4KB', date: '2026-02-18 10:05:00',
    content: '欢迎使用时空数智工厂 Engine V2.1。\n\n本系统提供完整的自动化时空数据处理链路，包括：\n1. 数据采集与入库\n2. 产线灵活编排\n3. 智能算子解译\n4. 地图服务一键发布\n\n如有疑问请咨询系统管理员。'
  },
  { 
    id: 'p_json', name: '任务配置参数.json', parentId: 'preview_folder', type: 'file', fileType: 'json', size: '2KB', date: '2026-02-18 10:06:00',
    content: '{\n  "taskId": "T20260218-001",\n  "name": "高分一号影像纠偏任务",\n  "parameters": {\n    "resolution": 2.0,\n    "coordinate": "EPSG:4326",\n    "retry": 3\n  },\n  "steps": ["input", "process", "output"]\n}'
  },
  { 
    id: 'p_xml', name: '数据元数据.xml', parentId: 'preview_folder', type: 'file', fileType: 'xml', size: '5KB', date: '2026-02-18 10:07:00',
    content: '<?xml version="1.0" encoding="UTF-8"?>\n<Metadata>\n  <Source>GF-1</Source>\n  <AcquisitionDate>2025-05-12</AcquisitionDate>\n  <Bands>4</Bands>\n  <CoordinateSystem>WGS84</CoordinateSystem>\n  <QualityScore>0.98</QualityScore>\n</Metadata>'
  },
  { 
    id: 'p_png', name: '成果效果图.png', parentId: 'preview_folder', type: 'file', fileType: 'png', size: '2.4MB', date: '2026-02-18 10:08:00',
    content: 'https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'p_jpg', name: '现场取证照片.jpg', parentId: 'preview_folder', type: 'file', fileType: 'jpg', size: '3.1MB', date: '2026-02-18 10:09:00',
    content: 'https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'p_doc', name: '项目周报-2026W07.docx', parentId: 'preview_folder', type: 'file', fileType: 'docx', size: '1.2MB', date: '2026-02-18 10:10:00'
  },
  { 
    id: 'p_xls', name: '算子性能测试数据.xlsx', parentId: 'preview_folder', type: 'file', fileType: 'xlsx', size: '850KB', date: '2026-02-18 10:11:00'
  },

  // 高分系列子目录及文件
  { id: 'gf2_dir', name: 'GF2_数据包', parentId: 'gf_series', type: 'folder', folderSubType: 'normal', date: '2025-02-10 14:05:00' },
  { 
    id: 'gf2_mss', 
    name: 'GF2_PMS1_E114.1_N22.8_20221012_L1A0006817191-MSS1.tif', 
    parentId: 'gf2_dir', 
    type: 'file', 
    fileType: 'tif', 
    size: '1.4GB', 
    date: '2022-10-12 15:30:00',
    satelliteType: 'GF2',
    sensor: '多光谱',
    code: 'MSS1',
    resolution: '3.2',
    publishedServices: [] 
  },
  { 
    id: 'gf2_pan', 
    name: 'GF2_PMS1_E114.1_N22.8_20221012_L1A0006817191-PAN1.tif', 
    parentId: 'gf2_dir', 
    type: 'file', 
    fileType: 'tif', 
    size: '2.1GB', 
    date: '2022-10-12 15:35:00',
    satelliteType: 'GF2',
    sensor: '全色',
    code: 'PAN1',
    resolution: '0.8'
  },
  { 
    id: 'gf1_file', 
    name: 'GF1_PMS2_E114.8_N30.2_20250726_L1A13977521001.tif', 
    parentId: 'gf_series', 
    type: 'file', 
    fileType: 'tif', 
    size: '1.8GB', 
    date: '2025-07-26 10:20:00',
    satelliteType: 'GF1',
    sensor: '多光谱',
    code: 'PMS2',
    resolution: '2/8'
  },

  // 资源三号 ZY3
  { 
    id: 'zy3_file', 
    name: 'ZY302_PMS_E100.4_N37.0_20171127_L1A0000217243.tif', 
    parentId: 'zy_series', 
    type: 'file', 
    fileType: 'tif', 
    size: '1.6GB', 
    date: '2017-11-27 14:15:00',
    satelliteType: 'ZY3',
    sensor: '多光谱',
    code: 'PMS',
    resolution: '2.1/5.8'
  },

  // Sentinel 哨兵系列
  { 
    id: 's2a_safe', 
    name: 'S2A_MSIL2A_20240531T030531_N0510_R075_T50SKB_20240531T085652.SAFE', 
    parentId: 'sentinel_series', 
    type: 'folder', 
    folderSubType: 'normal', 
    date: '2024-05-31 09:00:00',
    satelliteType: 'Sentinel-2',
    sensor: 'MSI',
    code: 'L2A',
    resolution: '10/20/60'
  },
  { 
    id: 's2b_safe', 
    name: 'S2B_MSIL2A_20240513T025529_N0510_R032_T49SGR_20240513T051404.SAFE', 
    parentId: 'sentinel_series', 
    type: 'folder', 
    folderSubType: 'normal', 
    date: '2024-05-13 10:30:00',
    satelliteType: 'Sentinel-2',
    sensor: 'MSI',
    code: 'L2A',
    resolution: '10'
  },
  { 
    id: 's2c_zip', 
    name: 'S2C_MSIL2A_20251007T024621_N0511_R132_T50RMT_20251007T061712.SAFE.zip', 
    parentId: 'sentinel_series', 
    type: 'file', 
    fileType: 'zip', 
    size: '985MB', 
    date: '2025-10-07 08:20:00',
    satelliteType: 'Sentinel-2',
    sensor: 'MSI',
    code: 'L2A',
    resolution: '10'
  },

  // Landsat 陆地卫星系列
  { 
    id: 'lc09_t1', 
    name: 'LC09_L2SP_126038_20250611_20250612_02_T1.tar.gz', 
    parentId: 'landsat_series', 
    type: 'file', 
    fileType: 'tar.gz', 
    size: '1.2GB', 
    date: '2025-06-11 16:40:00',
    satelliteType: 'Landsat-9',
    sensor: 'OLI-2',
    code: 'L2SP',
    resolution: '15/30'
  },
  { 
    id: 'lc09_t2', 
    name: 'LC09_L2SP_126038_20250830_20250831_02_T2.tar.gz', 
    parentId: 'landsat_series', 
    type: 'file', 
    fileType: 'tar.gz', 
    size: '1.1GB', 
    date: '2025-08-30 09:15:00',
    satelliteType: 'Landsat-9',
    sensor: 'OLI-2',
    code: 'L2SP',
    resolution: '30'
  },
  { 
    id: 'lc08_t1', 
    name: 'LC08_L2SP_122038_20250725_20250731_02_T1.tar.gz', 
    parentId: 'landsat_series', 
    type: 'file', 
    fileType: 'tar.gz', 
    size: '1.3GB', 
    date: '2025-07-25 12:00:00',
    satelliteType: 'Landsat-8',
    sensor: 'OLI',
    code: 'L2SP',
    resolution: '15/30'
  },
  { 
    id: 'lc08_t2', 
    name: 'LC08_L2SP_122040_20240417_20240423_02_T2.tar.gz', 
    parentId: 'landsat_series', 
    type: 'file', 
    fileType: 'tar.gz', 
    size: '1.0GB', 
    date: '2024-04-17 11:20:00',
    satelliteType: 'Landsat-8',
    sensor: 'OLI',
    code: 'L2SP',
    resolution: '30'
  },

  // 湖北省历史数据
  { id: 'hb-20240512', name: '2024-05-12', parentId: 'hubei', type: 'folder', folderSubType: 'normal', date: '2024-05-12 08:00:00' },
  { id: 'hb-s2', name: 'Sentinel-2_历史集', parentId: 'hb-20240512', type: 'folder', folderSubType: 'normal', date: '2024-05-12 10:00:00' },
  { id: 'f1', name: 'HB_WUHAN_S2_L2A_20240512.tif', parentId: 'hb-s2', type: 'file', fileType: 'tif', size: '1.2GB', date: '2024-05-12 15:30:00', publishedServices: [] },
  { id: 'f4', name: 'Sentinel2_Archive_Hubei.zip', parentId: 'hb-s2', type: 'file', fileType: 'zip', size: '2.4GB', date: '2024-05-12 16:10:00' },
];

export const MockApi = {
  resource: {
    list: async (): Promise<ResourceItem[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_RESOURCES;
    },
    saveAll: async (data: ResourceItem[]) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Resources saved', data.length);
    }
  },
  
  // 根据配置ID匹配资源
  matchResourcesByConfig: async (parentId: string, configId: string): Promise<ResourceItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const savedConfigs = localStorage.getItem('app_satellite_configs');
    const configs: SatelliteConfig[] = savedConfigs ? JSON.parse(savedConfigs) : [];
    const config = configs.find(c => c.id === configId);

    // 获取当前目录下的所有文件
    const allInFolder = MOCK_RESOURCES.filter(r => r.parentId === parentId || parentId === 'root');
    const files = allInFolder.filter(r => r.type === 'file');

    if (!config) {
        return files; 
    }

    const matchedFiles = files.filter(file => {
        if (!config.regex) {
            // 简单包含逻辑
            return file.name.includes(config.code) || file.name.includes(config.type);
        };
        try {
            const re = new RegExp(config.regex);
            return re.test(file.name);
        } catch {
            return false;
        }
    });

    return matchedFiles; 
  },
  
  // 多规则批量匹配
  matchResourcesByConfigs: async (parentId: string, configIds: string[]): Promise<ResourceItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const savedConfigs = localStorage.getItem('app_satellite_configs');
    const allConfigs: SatelliteConfig[] = savedConfigs ? JSON.parse(savedConfigs) : [];
    const selectedConfigs = allConfigs.filter(c => configIds.includes(c.id));

    // 模拟后端根据路径查找文件的逻辑
    const allFiles = MOCK_RESOURCES.filter(r => r.type === 'file');
    
    const matched: ResourceItem[] = [];

    allFiles.forEach(file => {
        for (const config of selectedConfigs) {
            let isMatch = false;
            if (config.regex) {
                try {
                    const re = new RegExp(config.regex);
                    if (re.test(file.name)) isMatch = true;
                } catch {}
            } else {
                if (file.name.includes(config.code) || (config.type && file.name.includes(config.type))) isMatch = true;
            }

            if (isMatch) {
                matched.push({
                    ...file,
                    satelliteType: config.type,
                    sensor: config.payload,
                    code: config.code,
                    resolution: config.resolution
                });
                break; 
            }
        }
    });

    return matched;
  },

  matchResources: async (path: string, rules: any): Promise<ResourceItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const files = MOCK_RESOURCES.filter(r => r.type === 'file');
    if (rules && rules.regex) {
        try {
            const re = new RegExp(rules.regex);
            return files.filter(f => re.test(f.name));
        } catch (e) {
            return [];
        }
    }
    if (rules && (rules.satellite || rules.sensor)) {
       return files.filter(f => f.name.includes(rules.satellite || '') || f.name.includes(rules.sensor || ''));
    }
    return files;
  }
};
