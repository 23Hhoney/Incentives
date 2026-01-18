import { Directive, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';


@Directive({
  selector: '[appCopyPrevent]'
})
export class CopyPreventDirective implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-webkit-user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-moz-user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-ms-user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-o-user-select', 'none');
  }
  
  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent) {
    event.preventDefault();
  }

  /** Disable the right click**/
  // @HostListener('contextmenu', ['$event'])
  // onRightClick(event: MouseEvent): void {
  //   event.preventDefault();
  // }
}
