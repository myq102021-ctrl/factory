
import React from 'react';

export type ProductionLineType = '数据采集产线' | '数据处理产线' | '数据治理产线' | '其他';

export interface ProductionLine {
  id: string;
  name: string;
  code: string;
  version: string;
  type: ProductionLineType | string;
  createTime: string;
  status: '启用' | '停用' | '不可用' | '正式' | '草稿';
  creator?: string;
  updateTime?: string;
  description?: string;
  canvasData?: {
    nodes: any[];
    connections: Connection[];
  };
}

// 映射项定义
export interface ParamMapping {
  id: string;
  sourceParam: string;
  targetParam: string;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  data?: {
    mappings: ParamMapping[];
  };
}

export interface Algorithm {
  id: string;
  name: string;
  image: string;
  status: '已提交' | '审核中' | '草稿';
  tags: string[];
  description: string;
  author: string;
  authorAvatar: string;
  date: string;
}

export enum TabOption {
  LIST = 'list',
  DRAFT = 'draft'
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  isOpen?: boolean;
}

export interface PublishedService {
  id: string;
  name: string;
  url: string;
  type: string;
  visible: boolean;
  createTime: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  parentId: string | null;
  type: 'folder' | 'file';
  folderSubType?: 'normal' | 'linked' | 'public';
  fileType?: 'tif' | 'zip' | 'tar.gz' | 'xml' | 'jpg' | 'jpeg' | 'png' | 'safe' | 'html' | 'json' | 'pdf' | 'txt' | 'doc' | 'docx' | 'xls' | 'xlsx';
  size?: string;
  date: string;
  isLinked?: boolean;
  publishedServices?: PublishedService[];
  // Extended fields for matching results
  satelliteType?: string;
  sensor?: string;
  code?: string;
  resolution?: string;
  // Mock content for preview
  content?: string;
}

export interface SatelliteConfig {
  id: string;
  name: string;
  type: string;
  payload: string;
  code: string;
  resolution: string;
  regex?: string;
}

export interface AlgoConfigParam {
  label: string;
  description: string;
  required: boolean;
  type: 'text' | 'file' | 'select' | 'range' | 'date';
  options?: string[];
  defaultValue?: any;
}
