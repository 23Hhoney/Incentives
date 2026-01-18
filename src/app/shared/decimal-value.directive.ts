import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDecimalValidator]',
})
export class DecimalValidatorDirective {
  // Updated regex to allow optional negative sign at the start and up to 2 decimal places
  private regex: RegExp = /^-?\d*\.?\d{0,2}$/; // Updated to allow optional '-' at the start and up to 2 decimal places
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  constructor(private control: NgControl) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow special keys such as navigation and deletion keys
    if (this.specialKeys.includes(event.key)) {
      return;
    }

    const current: string = this.control.control?.value || '';
    const next: string = current + event.key;

    // Allow the minus sign only at the start
    if (event.key === '-' && (current === '' || !current.startsWith('-'))) {
      return; // Allow typing the minus sign at the beginning
    }

    // Prevent the key if it's not valid according to the regex
    if (!this.regex.test(next)) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Ensure the value matches the regex; otherwise, revert to the last valid value
    if (!this.regex.test(value)) {
      const correctedValue = value.match(this.regex)?.[0] || '';
      this.control.control?.setValue(correctedValue, { emitEvent: false });
    }
  }
}
