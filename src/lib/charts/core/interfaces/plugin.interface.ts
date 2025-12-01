/**
 * Plugin system interface with lifecycle hooks
 */

import { IChart } from './chart.interface';

export interface IChartPlugin {
  /**
   * Unique identifier for the plugin
   */
  id: string;

  /**
   * Called before chart initialization
   */
  beforeInit?(chart: IChart): void;

  /**
   * Called after chart initialization
   */
  afterInit?(chart: IChart): void;

  /**
   * Called before chart update
   * Return false to prevent update
   */
  beforeUpdate?(chart: IChart): boolean | void;

  /**
   * Called after chart update
   */
  afterUpdate?(chart: IChart): void;

  /**
   * Called before chart render
   * Return false to prevent render
   */
  beforeRender?(chart: IChart): boolean | void;

  /**
   * Called after chart render
   */
  afterRender?(chart: IChart): void;

  /**
   * Called before chart destruction
   */
  beforeDestroy?(chart: IChart): void;
}
