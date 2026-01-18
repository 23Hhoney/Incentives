import { InjectionToken } from '@angular/core';
import { GoogleTagManagerConfig } from './google-tag-manager-config';
import * as i0 from "@angular/core";
export declare const GoogleTagManagerConfigService: InjectionToken<GoogleTagManagerConfig>;
export declare class GoogleTagManagerConfiguration {
    private _googleTagManagerConfig;
    constructor(googleTagManagerConfig?: GoogleTagManagerConfig);
    set(googleTagManagerConfig: GoogleTagManagerConfig): void;
    get(): GoogleTagManagerConfig;
    static ɵfac: i0.ɵɵFactoryDeclaration<GoogleTagManagerConfiguration, [{ optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GoogleTagManagerConfiguration>;
}
