import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<Event>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onPointerDown(event: Event) {
    const target = event.target as Node | null;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.clickOutside.emit(event);
    }
  }
}
