import type { Project, Material, DesignVersion, ColorScheme, Layout, User, ProofreadReport } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: '张设计',
    role: 'designer',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20female%20designer%20professional%20headshot&image_size=square'
  },
  {
    id: 'u2',
    name: '李审核',
    role: 'reviewer',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20male%20curator%20professional%20headshot&image_size=square'
  },
  {
    id: 'u3',
    name: '王管理',
    role: 'admin',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20female%20manager%20professional%20headshot&image_size=square'
  }
];

export const mockColorSchemes: ColorScheme[] = [
  {
    id: 'cs1',
    name: '朱砂古韵',
    primary: '#8B2323',
    secondary: ['#D4A574', '#E8D5B7', '#F5F0E6'],
    contrast: ['#1F4E5F', '#2C3E50']
  },
  {
    id: 'cs2',
    name: '青花瓷韵',
    primary: '#1F4E5F',
    secondary: ['#5B9AA8', '#A8D5E0', '#F0F8FA'],
    contrast: ['#8B2323', '#D4A574']
  },
  {
    id: 'cs3',
    name: '金碧辉煌',
    primary: '#C9A227',
    secondary: ['#E8D5A3', '#F5EEDC', '#FFFDF7'],
    contrast: ['#8B2323', '#2C3E50']
  },
  {
    id: 'cs4',
    name: '水墨丹青',
    primary: '#2C3E50',
    secondary: ['#7F8C8D', '#BDC3C7', '#ECF0F1'],
    contrast: ['#8B2323', '#C9A227']
  }
];

export const mockMaterials: Material[] = [
  {
    id: 'm1',
    type: 'exhibit',
    name: '青花缠枝莲纹瓶',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20blue%20and%20white%20porcelain%20vase%20qing%20dynasty%20traditional%20art&image_size=square_hd',
    description: '清代乾隆年间官窑青花瓷瓶，缠枝莲纹样精美',
    tags: ['瓷器', '清代', '青花', '国宝级'],
    createdAt: '2026-01-15T10:30:00Z'
  },
  {
    id: 'm2',
    type: 'exhibit',
    name: '鎏金铜佛像',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20gilded%20bronze%20buddha%20statue%20tang%20dynasty%20artifact&image_size=square_hd',
    description: '唐代鎏金铜佛像，工艺精湛，保存完好',
    tags: ['佛像', '唐代', '金器', '一级文物'],
    createdAt: '2026-01-15T10:35:00Z'
  },
  {
    id: 'm3',
    type: 'pattern',
    name: '祥云纹',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20cloud%20pattern%20auspicious%20decorative%20motif&image_size=square_hd',
    description: '传统祥云纹样，象征吉祥如意',
    tags: ['纹样', '祥云', '传统'],
    createdAt: '2026-01-15T10:40:00Z'
  },
  {
    id: 'm4',
    type: 'pattern',
    name: '回纹边框',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20meander%20border%20pattern%20geometric%20design&image_size=square_hd',
    description: '传统回纹边框，寓意连绵不断',
    tags: ['纹样', '回纹', '边框'],
    createdAt: '2026-01-15T10:45:00Z'
  },
  {
    id: 'm5',
    type: 'copy',
    name: '展品介绍文案',
    content: '青花缠枝莲纹瓶，清乾隆年间官窑精品。瓶身通体绘缠枝莲纹，青花发色纯正，层次分明。此瓶高约38厘米，口径12厘米，底径14厘米，是清代青花瓷中的代表之作。',
    description: '展品官方介绍文案',
    tags: ['文案', '介绍', '官方'],
    createdAt: '2026-01-15T10:50:00Z'
  },
  {
    id: 'm6',
    type: 'copy',
    name: '品牌 slogan',
    content: '承千年文脉，藏一世匠心',
    description: '文创品牌宣传语',
    tags: ['文案', 'slogan', '品牌'],
    createdAt: '2026-01-15T10:55:00Z'
  },
  {
    id: 'm7',
    type: 'auth',
    name: '故宫博物院授权书',
    content: '授权范围：文创产品开发、线上线下销售、宣传推广。授权期限：2026年1月1日至2028年12月31日。授权品类：纪念品包装、文具、饰品、家居用品。',
    description: '故宫博物院官方授权文件',
    tags: ['授权', '故宫', '官方'],
    authScope: ['纪念品包装', '文具', '饰品', '家居用品'],
    createdAt: '2026-01-15T11:00:00Z'
  }
];

const createMockLayouts = (style: string): Layout[] => {
  const basePreview = (type: string) => 
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${style} style ${type} packaging design for museum cultural product elegant traditional`)}&image_size=landscape_4_3`;

  return [
    {
      id: 'l1',
      type: 'box',
      name: '产品包装盒',
      size: { width: 200, height: 150, unit: 'mm' },
      previewUrl: basePreview('gift box'),
      elements: [
        { id: 'e1', type: 'image', x: 50, y: 20, width: 100, height: 100, content: 'exhibit' },
        { id: 'e2', type: 'text', x: 20, y: 130, width: 160, height: 15, content: '产品名称' },
        { id: 'e3', type: 'pattern', x: 0, y: 0, width: 200, height: 150, content: 'border' }
      ]
    },
    {
      id: 'l2',
      type: 'tag',
      name: '吊牌',
      size: { width: 60, height: 100, unit: 'mm' },
      previewUrl: basePreview('hang tag'),
      elements: [
        { id: 'e1', type: 'shape', x: 25, y: 5, width: 10, height: 10, content: 'hole' },
        { id: 'e2', type: 'image', x: 10, y: 20, width: 40, height: 40, content: 'logo' },
        { id: 'e3', type: 'text', x: 5, y: 65, width: 50, height: 30, content: 'price' }
      ]
    },
    {
      id: 'l3',
      type: 'sticker',
      name: '装饰贴纸',
      size: { width: 80, height: 80, unit: 'mm' },
      previewUrl: basePreview('sticker'),
      elements: [
        { id: 'e1', type: 'pattern', x: 0, y: 0, width: 80, height: 80, content: 'pattern' },
        { id: 'e2', type: 'text', x: 10, y: 35, width: 60, height: 20, content: 'brand' }
      ]
    },
    {
      id: 'l4',
      type: 'bag',
      name: '手提袋',
      size: { width: 300, height: 400, unit: 'mm' },
      previewUrl: basePreview('shopping bag'),
      elements: [
        { id: 'e1', type: 'shape', x: 100, y: 10, width: 100, height: 30, content: 'handle' },
        { id: 'e2', type: 'image', x: 75, y: 100, width: 150, height: 150, content: 'exhibit' },
        { id: 'e3', type: 'text', x: 50, y: 270, width: 200, height: 80, content: 'description' }
      ]
    },
    {
      id: 'l5',
      type: 'card',
      name: '说明卡',
      size: { width: 120, height: 180, unit: 'mm' },
      previewUrl: basePreview('information card'),
      elements: [
        { id: 'e1', type: 'text', x: 10, y: 10, width: 100, height: 30, content: 'title' },
        { id: 'e2', type: 'image', x: 20, y: 50, width: 80, height: 60, content: 'exhibit' },
        { id: 'e3', type: 'text', x: 10, y: 120, width: 100, height: 50, content: 'description' }
      ]
    }
  ];
};

export const mockVersions: DesignVersion[] = [
  {
    id: 'v1',
    version: 1,
    style: 'elegant',
    layouts: createMockLayouts('elegant'),
    colorScheme: mockColorSchemes[0],
    createdAt: '2026-01-16T09:00:00Z',
    creator: '张设计',
    description: '初始版本，典雅风格设计'
  },
  {
    id: 'v2',
    version: 2,
    style: 'elegant',
    layouts: createMockLayouts('elegant'),
    colorScheme: mockColorSchemes[1],
    createdAt: '2026-01-17T14:30:00Z',
    creator: '张设计',
    description: '调整配色方案为青花瓷韵'
  },
  {
    id: 'v3',
    version: 3,
    style: 'festive',
    layouts: createMockLayouts('festive'),
    colorScheme: mockColorSchemes[2],
    createdAt: '2026-01-18T11:20:00Z',
    creator: '张设计',
    description: '尝试节庆风格，为春节特别版做准备'
  }
];

export const mockProject: Project = {
  id: 'p1',
  name: '青花瓷系列文创包装设计',
  museumName: '故宫博物院',
  status: 'reviewing',
  progress: 65,
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-01-18T16:45:00Z',
  currentStyle: 'elegant',
  colorScheme: mockColorSchemes[0],
  materials: mockMaterials,
  versions: mockVersions,
  reviews: [
    {
      id: 'r1',
      versionId: 'v1',
      score: 75,
      status: 'rejected',
      createdAt: '2026-01-16T15:00:00Z',
      reviewer: '李审核',
      comments: [
        {
          id: 'c1',
          author: '李审核',
          content: '包装盒上的展品图像素不够清晰，建议使用高清原图',
          position: { x: 50, y: 30 },
          createdAt: '2026-01-16T15:05:00Z',
          resolved: true
        },
        {
          id: 'c2',
          author: '李审核',
          content: '整体色调偏暗，建议提高亮度',
          position: { x: 20, y: 80 },
          createdAt: '2026-01-16T15:10:00Z',
          resolved: true
        }
      ]
    },
    {
      id: 'r2',
      versionId: 'v2',
      score: 88,
      status: 'pending',
      createdAt: '2026-01-18T10:00:00Z',
      reviewer: '李审核',
      comments: [
        {
          id: 'c3',
          author: '李审核',
          content: '配色方案改进很大，青花色调很有韵味',
          createdAt: '2026-01-18T10:05:00Z',
          resolved: false
        }
      ]
    }
  ],
  exportConfig: {
    formats: ['PNG', 'PDF', 'AI'],
    namingRule: '{museum}_{style}_{layout}_{date}',
    includeSpec: true,
    includePreview: true,
    dpi: 300
  },
  description: '为故宫博物院青花瓷系列文创产品设计全套包装方案，包括包装盒、吊牌、贴纸、手提袋和说明卡。设计风格要求典雅、富有文化底蕴，同时符合现代审美。'
};

export const mockProjects: Project[] = [
  mockProject,
  {
    id: 'p2',
    name: '佛像系列钥匙扣包装',
    museumName: '陕西历史博物馆',
    status: 'draft',
    progress: 30,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-12T16:45:00Z',
    currentStyle: 'minimal',
    colorScheme: mockColorSchemes[3],
    materials: mockMaterials.filter(m => m.tags.some(t => t.includes('佛像'))),
    versions: [mockVersions[0]],
    reviews: [],
    exportConfig: {
      formats: ['PNG', 'PDF'],
      namingRule: '{museum}_{layout}_{date}',
      includeSpec: true,
      includePreview: true,
      dpi: 300
    }
  },
  {
    id: 'p3',
    name: '春节限定文创礼盒',
    museumName: '上海博物馆',
    status: 'designing',
    progress: 45,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-15T16:45:00Z',
    currentStyle: 'festive',
    colorScheme: mockColorSchemes[2],
    materials: mockMaterials.slice(2, 6),
    versions: mockVersions.slice(0, 2),
    reviews: [],
    exportConfig: {
      formats: ['PNG', 'PDF', 'AI', 'PSD'],
      namingRule: '{museum}_festive_{layout}_{date}',
      includeSpec: true,
      includePreview: true,
      dpi: 300
    }
  },
  {
    id: 'p4',
    name: '儿童教育系列文具包装',
    museumName: '中国国家博物馆',
    status: 'completed',
    progress: 100,
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-01-10T16:45:00Z',
    currentStyle: 'playful',
    colorScheme: mockColorSchemes[1],
    materials: mockMaterials,
    versions: mockVersions,
    reviews: [
      {
        id: 'r3',
        versionId: 'v3',
        score: 92,
        status: 'approved',
        createdAt: '2026-01-10T10:00:00Z',
        reviewer: '李审核',
        comments: [
          {
            id: 'c4',
            author: '李审核',
            content: '设计活泼有趣，非常适合儿童产品',
            createdAt: '2026-01-10T10:05:00Z',
            resolved: true
          }
        ]
      }
    ],
    exportConfig: {
      formats: ['PNG', 'PDF'],
      namingRule: '{museum}_kids_{layout}_{date}',
      includeSpec: true,
      includePreview: true,
      dpi: 300
    }
  }
];

export const mockProofreadReport: ProofreadReport = {
  id: 'pr1',
  content: '青花缠枝莲纹瓶，清乾隆年间官窑精品。瓶身通体绘缠枝莲纹，青花发色纯正，层次分明。此瓶高约38厘米，口径12厘米，底径14厘米，是清代青花瓷中的代表之作。承千年文脉，藏一世匠心。故宫博物院出品。',
  results: [
    {
      id: 'res1',
      type: 'era',
      text: '清乾隆年间',
      position: { start: 8, end: 14 },
      suggestion: '清乾隆年间（公元1736-1795年）',
      description: '建议补充具体年份范围，使信息更准确',
      severity: 'info'
    },
    {
      id: 'res2',
      type: 'museum',
      text: '故宫博物院',
      position: { start: 78, end: 84 },
      suggestion: '故宫博物院（正确）',
      description: '馆名校验通过，名称使用规范',
      severity: 'info'
    },
    {
      id: 'res3',
      type: 'person',
      text: '乾隆',
      position: { start: 10, end: 12 },
      suggestion: '乾隆（正确）',
      description: '历史人物名称校验通过',
      severity: 'info'
    },
    {
      id: 'res4',
      type: 'forbidden',
      text: '国宝级',
      position: { start: 45, end: 48 },
      suggestion: '建议修改为"国家一级文物"',
      description: '"国宝级"为广告法禁用极限词',
      severity: 'error'
    }
  ],
  checkedAt: '2026-01-18T15:30:00Z',
  totalIssues: 4
};

export const styleOptions = [
  { id: 'elegant', name: '典雅', description: '温润雅致，传承经典', icon: 'Crown', color: '#8B2323' },
  { id: 'playful', name: '童趣', description: '活泼可爱，充满趣味', icon: 'Sparkles', color: '#E8A87C' },
  { id: 'festive', name: '节庆', description: '喜庆热烈，寓意吉祥', icon: 'PartyPopper', color: '#C92A2A' },
  { id: 'minimal', name: '极简', description: '简约现代，去繁就简', icon: 'Minus', color: '#2C3E50' }
];

export const layoutOptions = [
  { id: 'box', name: '盒套', description: '产品外包装盒', icon: 'Package', size: '200×150mm' },
  { id: 'tag', name: '吊牌', description: '产品挂签', icon: 'Tag', size: '60×100mm' },
  { id: 'sticker', name: '贴纸', description: '装饰贴纸', icon: 'Sticker', size: '80×80mm' },
  { id: 'bag', name: '手提袋', description: '购物手提袋', icon: 'ShoppingBag', size: '300×400mm' },
  { id: 'card', name: '说明卡', description: '产品说明卡片', icon: 'FileText', size: '120×180mm' }
];
