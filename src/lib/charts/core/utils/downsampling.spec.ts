/**
 * Tests for downsampling algorithms
 */

import { describe, it, expect } from '@jest/globals';
import { lttbDownsample, averageDownsample, decimationDownsample } from './downsampling';
import { DataPoint } from '../interfaces';

describe('Downsampling Algorithms', () => {
  const generateTestData = (count: number): DataPoint[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `point-${i}`,
      timestamp: new Date(Date.now() - (count - i) * 1000),
      value: Math.sin(i / 10) * 50 + 50,
    }));
  };

  describe('LTTB Downsampling', () => {
    it('should return all points if data length is less than target', () => {
      const data = generateTestData(10);
      const result = lttbDownsample(data, 20);
      expect(result.length).toBe(10);
    });

    it('should downsample to target count', () => {
      const data = generateTestData(1000);
      const result = lttbDownsample(data, 100);
      expect(result.length).toBe(100);
    });

    it('should preserve first and last points', () => {
      const data = generateTestData(500);
      const result = lttbDownsample(data, 50);
      expect(result[0].id).toBe(data[0].id);
      expect(result[result.length - 1].id).toBe(data[data.length - 1].id);
    });
  });

  describe('Average Downsampling', () => {
    it('should return all points if data length is less than target', () => {
      const data = generateTestData(10);
      const result = averageDownsample(data, 20);
      expect(result.length).toBe(10);
    });

    it('should downsample to approximately target count', () => {
      const data = generateTestData(1000);
      const result = averageDownsample(data, 100);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Decimation Downsampling', () => {
    it('should return all points if data length is less than target', () => {
      const data = generateTestData(10);
      const result = decimationDownsample(data, 20);
      expect(result.length).toBe(10);
    });

    it('should downsample by keeping every nth point', () => {
      const data = generateTestData(1000);
      const result = decimationDownsample(data, 100);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });
});
