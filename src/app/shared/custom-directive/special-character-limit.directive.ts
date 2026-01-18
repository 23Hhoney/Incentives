import { Directive, ElementRef, HostListener } from '@angular/core';


@Directive({
  selector: '[appSpecialCharacterLimit]'
})
export class SpecialCharacterLimitDirective {

  private regex: RegExp = new RegExp(/^[a-zA-Z0-9 ]*$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log('in directive')
    // Allow special keys like Backspace, Tab, End, Home, Arrow keys, etc.
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);

    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}