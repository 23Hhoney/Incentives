import { ElementRef } from '@angular/core';
import { NumberOnlyLimitDirective } from './number-only-limit.directive';

describe('NumberOnlyLimitDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = {} as ElementRef;
    const directive = new NumberOnlyLimitDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
