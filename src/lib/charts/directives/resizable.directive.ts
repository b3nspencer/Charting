/**
 * Resizable directive for responsive chart sizing
 */

import { Directive, ElementRef, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[appResizable]',
  standalone: true,
})
export class ResizableDirective implements OnInit, OnDestroy {
  @Output() resized = new EventEmitter<{ width: number; height: number }>();

  private resizeObserver: ResizeObserver | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    if (!window.ResizeObserver) {
      console.warn('ResizeObserver is not supported in this browser');
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      const element = this.elementRef.nativeElement;
      this.resized.emit({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
    });

    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
