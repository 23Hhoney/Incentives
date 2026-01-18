import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QuillEditorComponent } from './quill-editor.component';
import { QUILL_CONFIG_TOKEN } from './quill-editor.interfaces';
import { QuillViewHTMLComponent } from './quill-view-html.component';
import { QuillViewComponent } from './quill-view.component';
import * as i0 from "@angular/core";
export class QuillModule {
    static forRoot(config) {
        return {
            ngModule: QuillModule,
            providers: [
                {
                    provide: QUILL_CONFIG_TOKEN,
                    useValue: config
                }
            ]
        };
    }
}
QuillModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
QuillModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.0.0", ngImport: i0, type: QuillModule, declarations: [QuillEditorComponent,
        QuillViewComponent,
        QuillViewHTMLComponent], imports: [CommonModule], exports: [QuillEditorComponent, QuillViewComponent, QuillViewHTMLComponent] });
QuillModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillModule, imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0", ngImport: i0, type: QuillModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        QuillEditorComponent,
                        QuillViewComponent,
                        QuillViewHTMLComponent
                    ],
                    exports: [QuillEditorComponent, QuillViewComponent, QuillViewHTMLComponent],
                    imports: [CommonModule],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpbGwubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXF1aWxsL3NyYy9saWIvcXVpbGwubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM5QyxPQUFPLEVBQXVCLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUU3RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQWUsTUFBTSwyQkFBMkIsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTs7QUFXM0QsTUFBTSxPQUFPLFdBQVc7SUFDdEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFvQjtRQUNqQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLFdBQVc7WUFDckIsU0FBUyxFQUFFO2dCQUNUO29CQUNFLE9BQU8sRUFBRSxrQkFBa0I7b0JBQzNCLFFBQVEsRUFBRSxNQUFNO2lCQUNqQjthQUNGO1NBQ0YsQ0FBQTtJQUNILENBQUM7O3dHQVhVLFdBQVc7eUdBQVgsV0FBVyxpQkFQcEIsb0JBQW9CO1FBQ3BCLGtCQUFrQjtRQUNsQixzQkFBc0IsYUFHZCxZQUFZLGFBRFosb0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCO3lHQUcvRCxXQUFXLFlBRlosWUFBWTsyRkFFWCxXQUFXO2tCQVR2QixRQUFRO21CQUFDO29CQUNSLFlBQVksRUFBRTt3QkFDWixvQkFBb0I7d0JBQ3BCLGtCQUFrQjt3QkFDbEIsc0JBQXNCO3FCQUN2QjtvQkFDRCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxzQkFBc0IsQ0FBQztvQkFDM0UsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2lCQUN4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbidcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSdcblxuaW1wb3J0IHsgUXVpbGxFZGl0b3JDb21wb25lbnQgfSBmcm9tICcuL3F1aWxsLWVkaXRvci5jb21wb25lbnQnXG5pbXBvcnQgeyBRVUlMTF9DT05GSUdfVE9LRU4sIFF1aWxsQ29uZmlnIH0gZnJvbSAnLi9xdWlsbC1lZGl0b3IuaW50ZXJmYWNlcydcbmltcG9ydCB7IFF1aWxsVmlld0hUTUxDb21wb25lbnQgfSBmcm9tICcuL3F1aWxsLXZpZXctaHRtbC5jb21wb25lbnQnXG5pbXBvcnQgeyBRdWlsbFZpZXdDb21wb25lbnQgfSBmcm9tICcuL3F1aWxsLXZpZXcuY29tcG9uZW50J1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBRdWlsbEVkaXRvckNvbXBvbmVudCxcbiAgICBRdWlsbFZpZXdDb21wb25lbnQsXG4gICAgUXVpbGxWaWV3SFRNTENvbXBvbmVudFxuICBdLFxuICBleHBvcnRzOiBbUXVpbGxFZGl0b3JDb21wb25lbnQsIFF1aWxsVmlld0NvbXBvbmVudCwgUXVpbGxWaWV3SFRNTENvbXBvbmVudF0sXG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxufSlcbmV4cG9ydCBjbGFzcyBRdWlsbE1vZHVsZSB7XG4gIHN0YXRpYyBmb3JSb290KGNvbmZpZz86IFF1aWxsQ29uZmlnKTogTW9kdWxlV2l0aFByb3ZpZGVyczxRdWlsbE1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogUXVpbGxNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6IFFVSUxMX0NPTkZJR19UT0tFTixcbiAgICAgICAgICB1c2VWYWx1ZTogY29uZmlnXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG4gIH1cbn1cbiJdfQ==