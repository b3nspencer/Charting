/**
 * LTTB (Largest-Triangle-Three-Buckets) downsampling algorithm
 * Reduces large datasets while preserving visual shape
 */

import { DataPoint } from '../interfaces';

/**
 * Downsample data using LTTB algorithm
 * @param data Original data points
 * @param targetPointCount Target number of points after downsampling
 * @returns Downsampled data preserving visual characteristics
 */
export function lttbDownsample(
  data: DataPoint[],
  targetPointCount: number
): DataPoint[] {
  if (data.length <= targetPointCount) {
    return data;
  }

  const bucketSize = (data.length - 2) / (targetPointCount - 2);
  const downsampled: DataPoint[] = [data[0]]; // Always keep first point

  for (let i = 0; i < targetPointCount - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    let avgX = 0;
    let avgY = 0;

    for (let j = avgRangeStart; j < avgRangeEnd && j < data.length; j++) {
      avgX += getX(data[j]) / avgRangeLength;
      avgY += data[j].value / avgRangeLength;
    }

    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

    const pointAX = getX(downsampled[downsampled.length - 1]);
    const pointAY = downsampled[downsampled.length - 1].value;

    let maxArea = -1;
    let maxAreaPoint: DataPoint | null = null;

    for (let j = rangeStart; j < rangeEnd && j < data.length; j++) {
      const area = calculateTriangleArea(
        pointAX,
        pointAY,
        getX(data[j]),
        data[j].value,
        avgX,
        avgY
      );

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
      }
    }

    if (maxAreaPoint !== null) {
      downsampled.push(maxAreaPoint);
    }
  }

  downsampled.push(data[data.length - 1]); // Always keep last point

  return downsampled;
}

/**
 * Get X coordinate value from data point
 */
function getX(point: DataPoint): number {
  if (point.timestamp) {
    return point.timestamp.getTime();
  }
  return 0;
}

/**
 * Calculate area of triangle formed by three points
 */
function calculateTriangleArea(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): number {
  return Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);
}

/**
 * Downsample data using simple averaging
 * Less sophisticated but faster than LTTB
 */
export function averageDownsample(
  data: DataPoint[],
  targetPointCount: number
): DataPoint[] {
  if (data.length <= targetPointCount) {
    return data;
  }

  const bucketSize = Math.ceil(data.length / targetPointCount);
  const downsampled: DataPoint[] = [];

  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, Math.min(i + bucketSize, data.length));
    const avgValue =
      bucket.reduce((sum, d) => sum + d.value, 0) / bucket.length;

    // Use first point as representative
    downsampled.push({
      ...bucket[0],
      value: avgValue,
    });
  }

  return downsampled;
}

/**
 * Downsample data using decimation (every nth point)
 */
export function decimationDownsample(
  data: DataPoint[],
  targetPointCount: number
): DataPoint[] {
  if (data.length <= targetPointCount) {
    return data;
  }

  const step = Math.ceil(data.length / targetPointCount);
  const downsampled: DataPoint[] = [];

  for (let i = 0; i < data.length; i += step) {
    downsampled.push(data[i]);
  }

  return downsampled;
}
