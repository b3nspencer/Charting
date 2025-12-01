/**
 * Tests for plugin registry service
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { PluginRegistry } from './plugin-registry.service';
import { IChartPlugin, IChart } from '../interfaces';

describe('PluginRegistry', () => {
  let registry: PluginRegistry;
  let mockPlugin: IChartPlugin;
  let mockChart: IChart;

  beforeEach(() => {
    registry = new PluginRegistry();
    mockPlugin = {
      id: 'test-plugin',
      beforeInit: jest.fn(),
      afterInit: jest.fn(),
    };
    mockChart = {
      id: 'chart-1',
      config: { type: 'line' },
      data: [],
      initialize: jest.fn(),
      updateData: jest.fn(),
      updateConfig: jest.fn(),
      render: jest.fn(),
      resize: jest.fn(),
      destroy: jest.fn(),
      getSvgElement: jest.fn(),
    } as any;
  });

  describe('Register Plugin', () => {
    it('should register a plugin', () => {
      registry.register(mockPlugin);
      expect(registry.get('test-plugin')).toBe(mockPlugin);
    });

    it('should throw if plugin with same id is registered', () => {
      registry.register(mockPlugin);
      expect(() => {
        registry.register(mockPlugin);
      }).toThrow();
    });
  });

  describe('Get Plugin', () => {
    it('should return registered plugin', () => {
      registry.register(mockPlugin);
      const plugin = registry.get('test-plugin');
      expect(plugin).toBe(mockPlugin);
    });

    it('should return undefined for unregistered plugin', () => {
      const plugin = registry.get('nonexistent');
      expect(plugin).toBeUndefined();
    });
  });

  describe('Get All Plugins', () => {
    it('should return all registered plugins', () => {
      const plugin2: IChartPlugin = { id: 'plugin-2' };
      registry.register(mockPlugin);
      registry.register(plugin2);

      const all = registry.getAll();
      expect(all.length).toBe(2);
      expect(all).toContain(mockPlugin);
      expect(all).toContain(plugin2);
    });
  });

  describe('Unregister Plugin', () => {
    it('should unregister a plugin', () => {
      registry.register(mockPlugin);
      const result = registry.unregister('test-plugin');
      expect(result).toBe(true);
      expect(registry.get('test-plugin')).toBeUndefined();
    });

    it('should return false if plugin not found', () => {
      const result = registry.unregister('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('Notify Plugins', () => {
    it('should call plugin hooks', () => {
      registry.register(mockPlugin);
      registry.notify('beforeInit', mockChart);
      expect(mockPlugin.beforeInit).toHaveBeenCalledWith(mockChart);
    });

    it('should stop if plugin returns false', () => {
      const plugin1: IChartPlugin = {
        id: 'plugin-1',
        beforeInit: jest.fn(() => false),
      };
      const plugin2: IChartPlugin = {
        id: 'plugin-2',
        beforeInit: jest.fn(),
      };

      registry.register(plugin1);
      registry.register(plugin2);

      const result = registry.notify('beforeInit', mockChart);
      expect(result).toBe(false);
      expect(plugin2.beforeInit).not.toHaveBeenCalled();
    });
  });

  describe('Clear', () => {
    it('should clear all plugins', () => {
      registry.register(mockPlugin);
      registry.clear();
      expect(registry.getAll().length).toBe(0);
    });
  });
});
