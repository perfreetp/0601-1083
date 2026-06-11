import type { ProofreadResult, ProofreadReport } from '@/types';

const forbiddenWords = [
  '国宝级', '顶级', '最高级', '第一', '唯一', '最佳', '最强', '史无前例',
  '绝无仅有', '顶级工艺', '极致', '完美', '终极', '巅峰', '独家',
  '国家级', '世界级', '全球领先', '行业领先', '领导者', '领袖',
  '首选', '王牌', '冠军', '极品', '至尊', '神器'
];

const correctMuseums = [
  '故宫博物院', '中国国家博物馆', '上海博物馆', '陕西历史博物馆',
  '南京博物院', '河南博物院', '浙江博物馆', '湖北博物馆',
  '辽宁博物馆', '湖南博物馆', '四川博物院', '河南博物馆'
];

const historicalFigures = [
  '秦始皇', '汉武帝', '唐太宗', '武则天', '唐玄宗', '宋太祖',
  '成吉思汗', '明太祖', '康熙', '雍正', '乾隆', '李白', '杜甫',
  '白居易', '苏轼', '辛弃疾', '李清照', '王羲之', '颜真卿',
  '柳公权', '欧阳询', '张择端', '郑板桥', '唐伯虎'
];

const dynasties: { name: string; start: number; end: number }[] = [
  { name: '夏', start: -2070, end: -1600 },
  { name: '商', start: -1600, end: -1046 },
  { name: '周', start: -1046, end: -256 },
  { name: '西周', start: -1046, end: -771 },
  { name: '东周', start: -770, end: -256 },
  { name: '春秋', start: -770, end: -476 },
  { name: '战国', start: -475, end: -221 },
  { name: '秦', start: -221, end: -207 },
  { name: '汉', start: -206, end: 220 },
  { name: '西汉', start: -206, end: 8 },
  { name: '东汉', start: 25, end: 220 },
  { name: '三国', start: 220, end: 280 },
  { name: '晋', start: 265, end: 420 },
  { name: '西晋', start: 265, end: 316 },
  { name: '东晋', start: 317, end: 420 },
  { name: '南北朝', start: 420, end: 589 },
  { name: '隋', start: 581, end: 618 },
  { name: '唐', start: 618, end: 907 },
  { name: '五代十国', start: 907, end: 960 },
  { name: '宋', start: 960, end: 1279 },
  { name: '北宋', start: 960, end: 1127 },
  { name: '南宋', start: 1127, end: 1279 },
  { name: '元', start: 1271, end: 1368 },
  { name: '明', start: 1368, end: 1644 },
  { name: '清', start: 1644, end: 1912 },
  { name: '中华民国', start: 1912, end: 1949 },
  { name: '中华人民共和国', start: 1949, end: new Date().getFullYear() }
];

const eraPatterns = [
  /(?:[唐宋元明清][左右]?代?)/g,
  /(?:春秋|战国|三国|魏晋|南北朝|五代十国)/g,
  /(?:公元前?\s*\d+\s*年?)/g,
  /(?:公元\s*\d+\s*年?)/g,
  /(?:\d+\s*世纪)/g
];

const generateId = () => `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const checkForbiddenWords = (text: string): ProofreadResult[] => {
  const results: ProofreadResult[] = [];
  
  forbiddenWords.forEach(word => {
    const regex = new RegExp(word, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        id: generateId(),
        type: 'forbidden',
        text: word,
        position: { start: match.index, end: match.index + word.length },
        suggestion: '建议使用更客观的描述，如"著名"、"珍贵"、"重要"等',
        description: `"${word}"为广告法禁用的极限词或不当表述`,
        severity: 'error'
      });
    }
  });
  
  return results;
};

export const checkMuseumNames = (text: string): ProofreadResult[] => {
  const results: ProofreadResult[] = [];
  
  correctMuseums.forEach(museum => {
    const regex = new RegExp(museum, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        id: generateId(),
        type: 'museum',
        text: museum,
        position: { start: match.index, end: match.index + museum.length },
        suggestion: `${museum}（正确）`,
        description: `馆名"${museum}"校验通过，名称使用规范`,
        severity: 'info'
      });
    }
  });
  
  const commonMistakes: { [key: string]: string } = {
    '故宫': '故宫博物院',
    '故宫博物馆': '故宫博物院',
    '国博': '中国国家博物馆',
    '国家博物馆': '中国国家博物馆',
    '上博': '上海博物馆',
    '陕博': '陕西历史博物馆',
    '南博': '南京博物院'
  };
  
  Object.entries(commonMistakes).forEach(([mistake, correct]) => {
    if (text.includes(mistake) && !text.includes(correct)) {
      const regex = new RegExp(mistake, 'g');
      let match;
      while ((match = regex.exec(text)) !== null) {
        results.push({
          id: generateId(),
          type: 'museum',
          text: mistake,
          position: { start: match.index, end: match.index + mistake.length },
          suggestion: `建议修改为"${correct}"`,
          description: `博物馆名称应使用全称，避免简称`,
          severity: 'warning'
        });
      }
    }
  });
  
  return results;
};

export const checkHistoricalFigures = (text: string): ProofreadResult[] => {
  const results: ProofreadResult[] = [];
  
  historicalFigures.forEach(figure => {
    const regex = new RegExp(figure, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        id: generateId(),
        type: 'person',
        text: figure,
        position: { start: match.index, end: match.index + figure.length },
        suggestion: `${figure}（正确）`,
        description: `历史人物"${figure}"名称校验通过`,
        severity: 'info'
      });
    }
  });
  
  return results;
};

export const checkEras = (text: string): ProofreadResult[] => {
  const results: ProofreadResult[] = [];
  
  dynasties.forEach(dynasty => {
    const regex = new RegExp(`${dynasty.name}(?:年间)?`, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const yearRange = dynasty.start < 0 
        ? `公元前${Math.abs(dynasty.start)}-公元前${Math.abs(dynasty.end)}年`
        : `${dynasty.start}-${dynasty.end}年`;
      
      results.push({
        id: generateId(),
        type: 'era',
        text: match[0],
        position: { start: match.index, end: match.index + match[0].length },
        suggestion: `${match[0]}（${yearRange}）`,
        description: `建议补充具体年份范围，使信息更准确`,
        severity: 'info'
      });
    }
  });
  
  return results;
};

export const proofreadText = (text: string): ProofreadReport => {
  const allResults: ProofreadResult[] = [
    ...checkForbiddenWords(text),
    ...checkMuseumNames(text),
    ...checkHistoricalFigures(text),
    ...checkEras(text)
  ];
  
  allResults.sort((a, b) => a.position.start - b.position.start);
  
  const uniqueResults = allResults.filter((result, index, self) =>
    index === self.findIndex(r => 
      r.type === result.type && 
      r.position.start === result.position.start
    )
  );
  
  return {
    id: `report_${Date.now()}`,
    content: text,
    results: uniqueResults,
    checkedAt: new Date().toISOString(),
    totalIssues: uniqueResults.filter(r => r.severity !== 'info').length
  };
};

export const applySuggestion = (text: string, result: ProofreadResult): string => {
  const suggestion = result.suggestion.replace(/（正确）/, '');
  
  if (result.severity === 'info' && result.suggestion.includes('（正确）')) {
    return text;
  }
  
  if (result.type === 'era' && result.suggestion.includes('（')) {
    const before = text.substring(0, result.position.end);
    const after = text.substring(result.position.end);
    const yearPart = result.suggestion.match(/（(.+?)）/)?.[1] || '';
    return `${before}（${yearPart}）${after}`;
  }
  
  const before = text.substring(0, result.position.start);
  const after = text.substring(result.position.end);
  return `${before}${suggestion}${after}`;
};

export const fixAllIssues = (text: string, report: ProofreadReport): string => {
  let fixedText = text;
  let offset = 0;
  
  const issuesToFix = report.results.filter(r => r.severity !== 'info');
  
  issuesToFix.forEach(result => {
    const adjustedStart = result.position.start + offset;
    const adjustedEnd = result.position.end + offset;
    
    const suggestion = result.suggestion.replace(/建议修改为"/, '').replace(/"$/, '');
    const cleanSuggestion = suggestion.replace(/（.+?）/, '').trim();
    
    const before = fixedText.substring(0, adjustedStart);
    const after = fixedText.substring(adjustedEnd);
    
    fixedText = `${before}${cleanSuggestion}${after}`;
    offset += cleanSuggestion.length - (result.position.end - result.position.start);
  });
  
  return fixedText;
};

export const getStatistics = (report: ProofreadReport) => {
  const errors = report.results.filter(r => r.severity === 'error').length;
  const warnings = report.results.filter(r => r.severity === 'warning').length;
  const infos = report.results.filter(r => r.severity === 'info').length;
  
  const byType = {
    forbidden: report.results.filter(r => r.type === 'forbidden').length,
    museum: report.results.filter(r => r.type === 'museum').length,
    person: report.results.filter(r => r.type === 'person').length,
    era: report.results.filter(r => r.type === 'era').length
  };
  
  return { errors, warnings, infos, byType };
};
