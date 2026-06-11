export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const generateColorScheme = (primaryColor: string, name: string) => {
  const rgb = hexToRgb(primaryColor);
  if (!rgb) return null;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const secondary: string[] = [];
  for (let i = 0; i < 3; i++) {
    const newL = Math.max(10, Math.min(90, hsl.l + 20 - i * 15));
    const newS = Math.max(10, hsl.s - i * 15);
    const secRgb = hslToRgb(hsl.h, newS, newL);
    secondary.push(rgbToHex(secRgb.r, secRgb.g, secRgb.b));
  }

  const contrast: string[] = [];
  const contrastHue1 = (hsl.h + 180) % 360;
  const contrastHue2 = (hsl.h + 135) % 360;
  
  const conRgb1 = hslToRgb(contrastHue1, hsl.s, 35);
  const conRgb2 = hslToRgb(contrastHue2, 50, 30);
  contrast.push(rgbToHex(conRgb1.r, conRgb1.g, conRgb1.b));
  contrast.push(rgbToHex(conRgb2.r, conRgb2.g, conRgb2.b));

  return {
    id: `cs_${Date.now()}`,
    name,
    primary: primaryColor,
    secondary,
    contrast,
  };
};

export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const isAccessible = (textColor: string, bgColor: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
  const ratio = getContrastRatio(textColor, bgColor);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};

export const lightenColor = (color: string, percent: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const amount = Math.round(2.55 * percent);
  return rgbToHex(
    rgb.r + amount,
    rgb.g + amount,
    rgb.b + amount
  );
};

export const darkenColor = (color: string, percent: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const amount = Math.round(2.55 * percent);
  return rgbToHex(
    rgb.r - amount,
    rgb.g - amount,
    rgb.b - amount
  );
};

export const getComplementaryColor = (color: string): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const compHue = (hsl.h + 180) % 360;
  const compRgb = hslToRgb(compHue, hsl.s, hsl.l);
  return rgbToHex(compRgb.r, compRgb.g, compRgb.b);
};

export const getAnalogousColors = (color: string, count: number = 3): string[] => {
  const rgb = hexToRgb(color);
  if (!rgb) return [color];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors: string[] = [];
  const step = 30;

  for (let i = 0; i < count; i++) {
    const hue = (hsl.h + step * (i - Math.floor(count / 2)) + 360) % 360;
    const analogRgb = hslToRgb(hue, hsl.s, hsl.l);
    colors.push(rgbToHex(analogRgb.r, analogRgb.g, analogRgb.b));
  }

  return colors;
};

export const extractDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('#8B2323');
        return;
      }

      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      resolve(rgbToHex(r, g, b));
    };
    img.onerror = () => resolve('#8B2323');
    img.src = imageUrl;
  });
};
