/**
 * Theme system for chart styling
 */

export interface ChartTheme {
  id: string;
  name: string;
  colors: {
    primary: string[];
    background: string;
    text: string;
    border: string;
    gridLines: string;
  };
  fonts: {
    family: string;
    size: number;
    weight: number;
  };
}

/**
 * Default light theme
 */
export const LightTheme: ChartTheme = {
  id: 'light',
  name: 'Light',
  colors: {
    primary: [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
    ],
    background: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
    gridLines: '#f0f0f0',
  },
  fonts: {
    family: 'system-ui, -apple-system, sans-serif',
    size: 12,
    weight: 400,
  },
};

/**
 * Dark theme
 */
export const DarkTheme: ChartTheme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    primary: [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
    ],
    background: '#1e1e1e',
    text: '#ffffff',
    border: '#404040',
    gridLines: '#333333',
  },
  fonts: {
    family: 'system-ui, -apple-system, sans-serif',
    size: 12,
    weight: 400,
  },
};

/**
 * High contrast theme
 */
export const HighContrastTheme: ChartTheme = {
  id: 'high-contrast',
  name: 'High Contrast',
  colors: {
    primary: [
      '#000000',
      '#FFFF00',
      '#00FFFF',
      '#FF0000',
      '#00FF00',
      '#FF00FF',
      '#0000FF',
      '#FFFFFF',
      '#808000',
      '#008080',
    ],
    background: '#ffffff',
    text: '#000000',
    border: '#000000',
    gridLines: '#cccccc',
  },
  fonts: {
    family: 'system-ui, -apple-system, sans-serif',
    size: 14,
    weight: 600,
  },
};

/**
 * Theme registry
 */
export const ThemeRegistry = new Map<string, ChartTheme>([
  [LightTheme.id, LightTheme],
  [DarkTheme.id, DarkTheme],
  [HighContrastTheme.id, HighContrastTheme],
]);

/**
 * Get a theme by ID
 */
export function getTheme(id: string): ChartTheme {
  return ThemeRegistry.get(id) || LightTheme;
}

/**
 * Get all available themes
 */
export function getAllThemes(): ChartTheme[] {
  return Array.from(ThemeRegistry.values());
}

/**
 * Register a custom theme
 */
export function registerTheme(theme: ChartTheme): void {
  ThemeRegistry.set(theme.id, theme);
}
