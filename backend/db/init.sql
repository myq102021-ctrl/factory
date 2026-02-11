
-- =============================================
-- 1. Database Schema Design (MySQL Compatible)
-- =============================================

CREATE DATABASE IF NOT EXISTS spacetime_factory;
USE spacetime_factory;

-- 1.1 Algorithm Definitions (算子定义表)
-- Stores the metadata and parameter templates for all nodes
CREATE TABLE IF NOT EXISTS algorithm_defs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'Category: Input, Process, Intelligent, Output',
    icon_key VARCHAR(50) COMMENT 'Maps to frontend Lucide icon names',
    description TEXT,
    params_template JSON COMMENT 'Configuration for UI rendering (forms)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Pipelines (产线记录表)
-- Stores the header information for lists (Draft vs Formal)
CREATE TABLE IF NOT EXISTS pipelines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    version VARCHAR(50),
    type VARCHAR(50),
    status TINYINT DEFAULT 0 COMMENT '0: Draft (草稿), 1: Formal (正式/启用), 2: Stopped (停用)',
    creator VARCHAR(50) DEFAULT 'System Admin',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1.3 Pipeline Layouts (画布拓扑表)
-- Stores the JSON graph: nodes (with instance values), edges, coordinates
CREATE TABLE IF NOT EXISTS pipeline_layouts (
    pipeline_id VARCHAR(50) PRIMARY KEY,
    canvas_json JSON NOT NULL,
    FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
);

-- 1.4 Data Resources (数据资源库)
-- Metadata for raw files used in "Cloud Data Input" matching
CREATE TABLE IF NOT EXISTS data_resources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(50) DEFAULT 'root',
    type VARCHAR(20) DEFAULT 'file' COMMENT 'file or folder',
    file_type VARCHAR(20),
    satellite_type VARCHAR(50),
    sensor VARCHAR(50),
    resolution DOUBLE,
    acq_time DATETIME,
    file_path VARCHAR(500),
    size_str VARCHAR(20)
);

-- 1.5 Page Tips (功能说明配置)
CREATE TABLE IF NOT EXISTS page_tips (
    route_key VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100),
    content TEXT
);

-- =============================================
-- 2. Seed Data (Initialization)
-- =============================================

-- 2.1 Insert Algorithms (Preserving all 12+ types + Cloud Input)
INSERT INTO algorithm_defs (id, name, category, icon_key, description, params_template) VALUES
('algo_001', '数据采集', '输入节点', 'Database', '从多源卫星、无人机或IoT设备获取原始时空数据。', '[{"label":"数据来源","type":"select","options":["欧空局"],"required":true},{"label":"采集起始日期","type":"date","required":true}]'),
('algo_002', '云盘数据输入', '输入节点', 'Cloud', '直接引用云盘中已有的数据资源，支持正则匹配筛选。', '[{"label":"输入路径","type":"path_selector","required":true},{"label":"匹配规则","type":"rule_config","required":false}]'),
('algo_003', '波段合成', '处理节点', 'Zap', '将不同波段的影像进行合并，生成多光谱影像产品。', '[{"label":"波段范围","type":"text","required":true,"hint":"示例: 3,2,1"},{"label":"输出坐标系","type":"select","options":["EPSG:4326","EPSG:4490"],"required":false}]'),
('algo_004', '影像镶嵌', '处理节点', 'Layers', '将多幅相邻影像拼接成大范围的无缝影像图。', '[{"label":"输出坐标系","type":"select","options":["EPSG:4326","EPSG:4490"],"required":true}]'),
('algo_005', '影像裁剪', '处理节点', 'Layout', '根据矢量边界或坐标范围对影像进行精确裁剪。', '[{"label":"裁剪矢量","type":"file","required":true}]'),
('algo_006', '农业撂荒监测', '智能解译节点', 'ScanLine', '基于多时相遥感影像自动识别耕地撂荒区域。', '[{"label":"撂荒阈值","type":"range","default":0.5}]'),
('algo_007', '水稻种植分布', '智能解译节点', 'Wheat', '利用深度学习模型提取区域内水稻种植的空间分布。', '[{"label":"5月影像","type":"file","required":true},{"label":"8月影像","type":"file","required":true}]'),
('algo_008', '油菜种植分布', '智能解译节点', 'Sprout', '高精度识别油菜种植区域。', '[{"label":"3月影像","type":"file","required":true}]'),
('algo_009', '水稻作物长势监测', '智能解译节点', 'Activity', '通过植被指数分析水稻不同生长期健康状况。', '[]'),
('algo_010', '油菜作物长势监测', '智能解译节点', 'Activity', '监测油菜生长关键期的营养与水分状态。', '[]'),
('algo_011', '服务发布', '输出节点', 'Share2', '将处理完成的数据产品发布为标准OGC地图服务。', '[{"label":"服务名称","type":"text","required":true}]');

-- 2.2 Insert Page Tips
INSERT INTO page_tips (route_key, title, content) VALUES
('list', '产线列表', '点击列表行可查看底部对应产线的详细流程图。产线列表用于统一管理已设计完成的产线。'),
('draft', '草稿箱', '草稿箱保存了您尚未提交的产线设计，您可以随时通过“继续设计”按钮进入画布完善流程。'),
('design', '产线设计', '拖拽左侧算子到画布中，通过连线定义数据流向。点击节点可配置具体参数。');

-- 2.3 Insert Mock Data Resources (For Matching)
INSERT INTO data_resources (id, name, type, satellite_type, sensor, resolution, file_path) VALUES
('res_001', 'GF1_PMS_E113.2_N23.1_20250101_L1A.tiff', 'file', 'GF1', 'PMS', 2.0, '/data/input/GF1/2025'),
('res_002', 'GF1_MSS_E113.2_N23.1_20250101_L1A.tiff', 'file', 'GF1', 'MSS', 8.0, '/data/input/GF1/2025'),
('res_003', 'S2A_MSIL2A_20250102_T50RQT.zip', 'file', 'Sentinel-2', 'MSI', 10.0, '/data/input/S2/2025');
