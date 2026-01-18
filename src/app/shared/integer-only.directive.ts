import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
selector: '[appIntegerOnly]'
})
export class IntegerOnlyDirective {

private regex: RegExp = new RegExp(/^\d+$/);
private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight'];

constructor(private el: ElementRef) { }

@HostListener('keydown', ['$event'])
onKeyDown(event: KeyboardEvent) {
// Allow special keys like Backspace, Tab, End, Home, Arrow keys, etc.
if (this.specialKeys.indexOf(event.key) !== -1) {
return;
}

// Prevent default action if the key is not a digit
if (!event.key.match(/^\d$/)) {
event.preventDefault();
}
}

@HostListener('input', ['$event'])
onInput(event: Event) {
const input = this.el.nativeElement.value;
// Remove any non-digit characters
this.el.nativeElement.value = input.replace(/[^0-9]/g, '');
}
}