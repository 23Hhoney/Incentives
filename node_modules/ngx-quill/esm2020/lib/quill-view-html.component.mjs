import { DomSanitizer } from '@angular/platform-browser';
import { Component, Inject, Input, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./quill.service";
import * as i2 from "@angular/common";
import * as i3 from "@angular/platform-browser";
export class QuillViewHTMLComponent {
    constructor(sanitizer, service) {
        this.sanitizer = sanitizer;
        this.service = service;
        this.content = '';
        this.innerHTML = '';
        this.themeClass = 'ql-snow';
    }
    ngOnChanges(changes) {
        if (changes.theme) {
            const theme = changes.theme.currentValue || (this.service.config.theme ? this.service.config.theme : 'snow');
            this.themeClass = `ql-${theme} ngx-quill-view-html`;
        }
        else if (!this.theme) {
            const theme = this.service.config.theme ? this.service.config.theme : 'snow';
            this.themeClass = `ql-${theme} ngx-quill-view-html`;
        }
        if (changes.content) {
            const content = changes.content.currentValue;
            const sanitize = [true, false].includes(this.sanitize) ? this.sanitize : (this.service.config.sanitize || false);
            this.innerHTML = sanitize ? content : this.sanitizer.bypassSecurityTrustHtml(content);
        }
    }
}
QuillViewHTMLComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillViewHTMLComponent, deps: [{ token: DomSanitizer }, { token: i1.QuillService }], target: i0.ɵɵFactoryTarget.Component });
QuillViewHTMLComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.0.0", type: QuillViewHTMLComponent, selector: "quill-view-html", inputs: { content: "content", theme: "theme", sanitize: "sanitize" }, usesOnChanges: true, ngImport: i0, template: `
  <div class="ql-container" [ngClass]="themeClass">
    <div class="ql-editor" [innerHTML]="innerHTML">
    </div>
  </div>
`, isInline: true, styles: [".ql-container.ngx-quill-view-html{border:0}\n"], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillViewHTMLComponent, decorators: [{
            type: Component,
            args: [{ encapsulation: ViewEncapsulation.None, selector: 'quill-view-html', template: `
  <div class="ql-container" [ngClass]="themeClass">
    <div class="ql-editor" [innerHTML]="innerHTML">
    </div>
  </div>
`, styles: [".ql-container.ngx-quill-view-html{border:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i3.DomSanitizer, decorators: [{
                    type: Inject,
                    args: [DomSanitizer]
                }] }, { type: i1.QuillService }]; }, propDecorators: { content: [{
                type: Input
            }], theme: [{
                type: Input
            }], sanitize: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpbGwtdmlldy1odG1sLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1xdWlsbC9zcmMvbGliL3F1aWxsLXZpZXctaHRtbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBWSxNQUFNLDJCQUEyQixDQUFBO0FBR2xFLE9BQU8sRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFHTCxpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUE7Ozs7O0FBaUJ0QixNQUFNLE9BQU8sc0JBQXNCO0lBUWpDLFlBQ2dDLFNBQXVCLEVBQzNDLE9BQXFCO1FBREQsY0FBUyxHQUFULFNBQVMsQ0FBYztRQUMzQyxZQUFPLEdBQVAsT0FBTyxDQUFjO1FBVHhCLFlBQU8sR0FBRyxFQUFFLENBQUE7UUFJckIsY0FBUyxHQUFhLEVBQUUsQ0FBQTtRQUN4QixlQUFVLEdBQUcsU0FBUyxDQUFBO0lBS25CLENBQUM7SUFFSixXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQ2pCLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzVHLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxLQUFLLHNCQUFzQixDQUFBO1NBQ3BEO2FBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQTtZQUM1RSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sS0FBSyxzQkFBc0IsQ0FBQTtTQUNwRDtRQUNELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNuQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQTtZQUM1QyxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQTtZQUVoSCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQ3RGO0lBQ0gsQ0FBQzs7bUhBM0JVLHNCQUFzQixrQkFTdkIsWUFBWTt1R0FUWCxzQkFBc0Isa0pBUHZCOzs7OztDQUtYOzJGQUVZLHNCQUFzQjtrQkFmbEMsU0FBUztvQ0FDTyxpQkFBaUIsQ0FBQyxJQUFJLFlBQzNCLGlCQUFpQixZQU1qQjs7Ozs7Q0FLWDs7MEJBV0ksTUFBTTsyQkFBQyxZQUFZO3VFQVJiLE9BQU87c0JBQWYsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERvbVNhbml0aXplciwgU2FmZUh0bWwgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJ1xuaW1wb3J0IHsgUXVpbGxTZXJ2aWNlIH0gZnJvbSAnLi9xdWlsbC5zZXJ2aWNlJ1xuXG5pbXBvcnQge1xuICBDb21wb25lbnQsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSdcblxuQENvbXBvbmVudCh7XG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIHNlbGVjdG9yOiAncXVpbGwtdmlldy1odG1sJyxcbiAgc3R5bGVzOiBbYFxuLnFsLWNvbnRhaW5lci5uZ3gtcXVpbGwtdmlldy1odG1sIHtcbiAgYm9yZGVyOiAwO1xufVxuYF0sXG4gIHRlbXBsYXRlOiBgXG4gIDxkaXYgY2xhc3M9XCJxbC1jb250YWluZXJcIiBbbmdDbGFzc109XCJ0aGVtZUNsYXNzXCI+XG4gICAgPGRpdiBjbGFzcz1cInFsLWVkaXRvclwiIFtpbm5lckhUTUxdPVwiaW5uZXJIVE1MXCI+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuYFxufSlcbmV4cG9ydCBjbGFzcyBRdWlsbFZpZXdIVE1MQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgQElucHV0KCkgY29udGVudCA9ICcnXG4gIEBJbnB1dCgpIHRoZW1lPzogc3RyaW5nXG4gIEBJbnB1dCgpIHNhbml0aXplPzogYm9vbGVhblxuXG4gIGlubmVySFRNTDogU2FmZUh0bWwgPSAnJ1xuICB0aGVtZUNsYXNzID0gJ3FsLXNub3cnXG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChEb21TYW5pdGl6ZXIpIHByaXZhdGUgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXIsXG4gICAgcHJvdGVjdGVkIHNlcnZpY2U6IFF1aWxsU2VydmljZVxuICApIHt9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzLnRoZW1lKSB7XG4gICAgICBjb25zdCB0aGVtZSA9IGNoYW5nZXMudGhlbWUuY3VycmVudFZhbHVlIHx8ICh0aGlzLnNlcnZpY2UuY29uZmlnLnRoZW1lID8gdGhpcy5zZXJ2aWNlLmNvbmZpZy50aGVtZSA6ICdzbm93JylcbiAgICAgIHRoaXMudGhlbWVDbGFzcyA9IGBxbC0ke3RoZW1lfSBuZ3gtcXVpbGwtdmlldy1odG1sYFxuICAgIH0gZWxzZSBpZiAoIXRoaXMudGhlbWUpIHtcbiAgICAgIGNvbnN0IHRoZW1lID0gdGhpcy5zZXJ2aWNlLmNvbmZpZy50aGVtZSA/IHRoaXMuc2VydmljZS5jb25maWcudGhlbWUgOiAnc25vdydcbiAgICAgIHRoaXMudGhlbWVDbGFzcyA9IGBxbC0ke3RoZW1lfSBuZ3gtcXVpbGwtdmlldy1odG1sYFxuICAgIH1cbiAgICBpZiAoY2hhbmdlcy5jb250ZW50KSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gY2hhbmdlcy5jb250ZW50LmN1cnJlbnRWYWx1ZVxuICAgICAgY29uc3Qgc2FuaXRpemUgPSBbdHJ1ZSwgZmFsc2VdLmluY2x1ZGVzKHRoaXMuc2FuaXRpemUpID8gdGhpcy5zYW5pdGl6ZSA6ICh0aGlzLnNlcnZpY2UuY29uZmlnLnNhbml0aXplIHx8IGZhbHNlKVxuXG4gICAgICB0aGlzLmlubmVySFRNTCA9IHNhbml0aXplID8gY29udGVudCA6IHRoaXMuc2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RIdG1sKGNvbnRlbnQpXG4gICAgfVxuICB9XG59XG4iXX0=