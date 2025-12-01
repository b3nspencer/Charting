/**
 * Tests for chart builder service
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ChartBuilderService } from './chart-builder.service';

describe('ChartBuilderService', () => {
  let builder: ChartBuilderService;

  beforeEach(() => {
    builder = ChartBuilderService.start();
  });

  describe('Fluent API', () => {
    it('should allow chaining methods', () => {
      const config = builder
        .type('line')
        .dimensions(800, 400)
        .addYAxis({ id: 'y1', position: 'left' })
        .addSeries({
          type: 'line',
          dataKey: 'value',
          color: '#ff0000',
        })
        .enableZoom()
        .enableTooltip()
        .build();

      expect(config.type).toBe('line');
      expect(config.width).toBe(800);
      expect(config.height).toBe(400);
      expect(config.yAxes?.length).toBe(1);
      expect(config.series?.length).toBe(1);
      expect(config.features?.zoom).toBe(true);
      expect(config.features?.tooltip).toBe(true);
    });
  });

  describe('Chart Type', () => {
    it('should set chart type', () => {
      const config = builder.type('bar').build();
      expect(config.type).toBe('bar');
    });
  });

  describe('Dimensions', () => {
    it('should set width and height', () => {
      const config = builder.dimensions(600, 300).build();
      expect(config.width).toBe(600);
      expect(config.height).toBe(300);
    });

    it('should use defaults if not specified', () => {
      const config = builder.build();
      expect(config.width).toBe(800);
      expect(config.height).toBe(400);
    });
  });

  describe('Series', () => {
    it('should add multiple series', () => {
      const config = builder
        .addSeries({
          type: 'line',
          dataKey: 'value1',
          color: '#ff0000',
        })
        .addSeries({
          type: 'bar',
          dataKey: 'value2',
          color: '#00ff00',
        })
        .build();

      expect(config.series?.length).toBe(2);
      expect(config.series?.[0].dataKey).toBe('value1');
      expect(config.series?.[1].dataKey).toBe('value2');
    });
  });

  describe('Features', () => {
    it('should enable multiple features', () => {
      const config = builder
        .enableZoom()
        .enableTooltip()
        .enableLegend()
        .enableBrush()
        .build();

      expect(config.features?.zoom).toBe(true);
      expect(config.features?.tooltip).toBe(true);
      expect(config.features?.legend).toBe(true);
      expect(config.features?.brush).toBe(true);
    });

    it('should disable features', () => {
      const config = builder
        .enableZoom(false)
        .enableTooltip(false)
        .build();

      expect(config.features?.zoom).toBe(false);
      expect(config.features?.tooltip).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset builder state', () => {
      builder
        .type('bar')
        .dimensions(600, 300)
        .addSeries({
          type: 'bar',
          dataKey: 'value',
        });

      builder.reset();
      const config = builder.build();

      expect(config.type).toBe('line');
      expect(config.width).toBe(800);
      expect(config.series).toBeUndefined();
    });
  });
});
