/**
 * Tests for chart serialization service
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ChartSerializationService } from './chart-serialization.service';
import { ChartConfig } from '../interfaces';

describe('ChartSerializationService', () => {
  let service: ChartSerializationService;

  beforeEach(() => {
    service = new ChartSerializationService();
  });

  describe('Serialization', () => {
    it('should serialize a chart config to JSON', () => {
      const config: ChartConfig = {
        type: 'line',
        width: 800,
        height: 400,
      };

      const json = service.serialize(config);
      expect(typeof json).toBe('string');
      expect(json).toContain('"type":"line"');
    });

    it('should include version in serialized config', () => {
      const config: ChartConfig = {
        type: 'bar',
      };

      const json = service.serialize(config);
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('1.0.0');
    });

    it('should preserve all config properties', () => {
      const config: ChartConfig = {
        type: 'scatter',
        width: 600,
        height: 300,
        series: [
          {
            type: 'scatter',
            dataKey: 'value',
            color: '#ff0000',
          },
        ],
      };

      const json = service.serialize(config);
      const parsed = JSON.parse(json);
      expect(parsed.type).toBe('scatter');
      expect(parsed.dimensions.width).toBe(600);
      expect(parsed.dimensions.height).toBe(300);
    });
  });

  describe('Deserialization', () => {
    it('should deserialize JSON to chart config', () => {
      const json = JSON.stringify({
        version: '1.0.0',
        type: 'line',
        dimensions: { width: 800, height: 400 },
        series: [],
        axes: [],
        features: {},
      });

      const config = service.deserialize(json);
      expect(config.type).toBe('line');
      expect(config.width).toBe(800);
      expect(config.height).toBe(400);
    });

    it('should throw on invalid JSON', () => {
      expect(() => {
        service.deserialize('invalid json');
      }).toThrow();
    });

    it('should handle missing version gracefully', () => {
      const json = JSON.stringify({
        type: 'bar',
        dimensions: { width: 600, height: 300 },
      });

      const config = service.deserialize(json);
      expect(config.type).toBe('bar');
    });
  });

  describe('Round-trip Serialization', () => {
    it('should preserve config through serialize-deserialize cycle', () => {
      const original: ChartConfig = {
        type: 'area',
        width: 1000,
        height: 500,
        data: [
          {
            id: '1',
            timestamp: new Date('2024-01-01'),
            value: 100,
          },
        ],
      };

      const json = service.serialize(original);
      const deserialized = service.deserialize(json);

      expect(deserialized.type).toBe(original.type);
      expect(deserialized.width).toBe(original.width);
      expect(deserialized.height).toBe(original.height);
    });
  });
});
