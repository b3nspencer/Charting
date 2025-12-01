/**
 * Theme service for managing chart themes
 */

import { Injectable, signal } from '@angular/core';
import { ChartTheme, getTheme } from './theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly currentTheme = signal<ChartTheme>(getTheme('light'));

  /**
   * Set the current theme
   */
  setTheme(themeId: string): void {
    const theme = getTheme(themeId);
    this.currentTheme.set(theme);
  }

  /**
   * Get current theme
   */
  getTheme(): ChartTheme {
    return this.currentTheme();
  }

  /**
   * Apply theme to element
   */
  applyThemeToElement(element: HTMLElement): void {
    const theme = this.currentTheme();
    element.style.backgroundColor = theme.colors.background;
    element.style.color = theme.colors.text;
    element.style.fontFamily = theme.fonts.family;
    element.style.fontSize = theme.fonts.size + 'px';
    element.style.fontWeight = theme.fonts.weight.toString();
  }
}
