import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appPhoneNumberFormatter]'
})
export class PhoneNumberFormatterDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement;
    let input = inputElement.value.replace(/\D/g, ''); // Remove all non-digit characters
    let formattedValue = '';

    if (input.length > 0) {
      formattedValue = '(' + input.substring(0, 3);
    }
    if (input.length >= 4) {
      formattedValue += ') ' + input.substring(3, 6);
    }
    if (input.length >= 7) {
      formattedValue += '-' + input.substring(6, 10);
    }

    const cursorPosition = inputElement.selectionStart;
    inputElement.value = formattedValue;

    let newCursorPosition = cursorPosition;

    if (cursorPosition <= 3) {
      newCursorPosition += 1;
    } else if (cursorPosition <= 6) {
      newCursorPosition += 3;
    } else if (cursorPosition <= 10) {
      newCursorPosition += 4;
    }

    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
  }
}
