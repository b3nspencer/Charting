/**
 * Configuration serialization service with versioning support
 */

import { Injectable } from '@angular/core';
import { ChartConfig } from '../interfaces';

interface SerializedConfig {
  version: string;
  type: string;
  dimensions: { width: number; height: number };
  series: any[];
  axes: any[];
  features: any;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ChartSerializationService {
  private readonly VERSION = '1.0.0';
  private readonly migrations: Map<string, (config: any) => SerializedConfig> =
    new Map();

  /**
   * Serialize chart configuration to JSON string
   */
  serialize(config: ChartConfig): string {
    const serialized: SerializedConfig = {
      version: this.VERSION,
      type: config.type || 'line',
      dimensions: {
        width: config.width || 800,
        height: config.height || 400,
      },
      series: config.series || [],
      axes: config.yAxes || [],
      features: config.features || {},
      ...config,
    };

    return JSON.stringify(serialized);
  }

  /**
   * Deserialize chart configuration from JSON string
   */
  deserialize(json: string): ChartConfig {
    try {
      const parsed = JSON.parse(json);

      if (this.needsMigration(parsed.version)) {
        return this.migrate(parsed);
      }

      return this.buildConfig(parsed);
    } catch (error) {
      throw new Error(`Failed to deserialize chart configuration: ${error}`);
    }
  }

  /**
   * Register a migration function for a version
   */
  registerMigration(
    fromVersion: string,
    toVersion: string,
    migrationFn: (config: any) => SerializedConfig
  ): void {
    this.migrations.set(fromVersion, migrationFn);
  }

  /**
   * Check if configuration needs migration
   */
  private needsMigration(version?: string): boolean {
    if (!version) return true;
    return version !== this.VERSION;
  }

  /**
   * Apply migrations to older configurations
   */
  private migrate(config: any): ChartConfig {
    let current = config;

    // Apply migrations in order
    while (
      current.version &&
      current.version !== this.VERSION
    ) {
      const migration = this.migrations.get(current.version);
      if (migration) {
        current = migration(current);
      } else {
        // No migration found, assume forward compatible
        break;
      }
    }

    return this.buildConfig(current);
  }

  /**
   * Build ChartConfig from serialized data
   */
  private buildConfig(data: any): ChartConfig {
    return {
      type: data.type || 'line',
      width: data.dimensions?.width || data.width || 800,
      height: data.dimensions?.height || data.height || 400,
      margin: data.margin,
      data: data.data,
      yAxes: data.axes || data.yAxes,
      series: data.series,
      features: data.features,
      ...data,
    };
  }
}
