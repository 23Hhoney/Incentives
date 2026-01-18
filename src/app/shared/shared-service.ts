import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SharedService
{

    constructor(private _httpClient: HttpClient)
    {
    }
    
    private static readonly _loggedInDetails = new BehaviorSubject<LoggedInSessionContract>(null);
    private static readonly _permissionModules = new BehaviorSubject<any>(null);
    private static readonly _pointsModule = new BehaviorSubject<any>(null);
    private static readonly _profilePicture = new BehaviorSubject<any>(null);
    private static readonly _userName = new BehaviorSubject<any>(null);
    private static readonly _isPointLocked = new BehaviorSubject<any>(null);
    private static readonly _notificationCount = new BehaviorSubject<any>(null);

    readonly _loggedInDetails$ = SharedService._loggedInDetails.asObservable();
    readonly _permissionModules$ = SharedService._permissionModules.asObservable();
    readonly _pointsModule$ = SharedService._pointsModule.asObservable();
    readonly _profilePicture$ = SharedService._profilePicture.asObservable();
    readonly _userName$ = SharedService._userName.asObservable();
    readonly _isPointLocked$ = SharedService._isPointLocked.asObservable();
    readonly _notificationCount$ = SharedService._notificationCount.asObservable();

    public setLoggedInObject(val: LoggedInSessionContract) {
        window.sessionStorage.setItem('loggedInUserObject', JSON.stringify(val));
        SharedService._loggedInDetails.next(val);
    }
    
    public setModulePermission(userModulePermissions) {
        const enabledModuleIds = userModulePermissions
            .map(permission => permission.moduleId);
    
        const role = window.sessionStorage.getItem('role');
        if (role === 'Super Admin') {
            sessionStorage.setItem('Modules', JSON.stringify(enabledModuleIds));
        } else {
            const filteredModuleIds = enabledModuleIds.filter(
                moduleId => moduleId !== 'proc' && moduleId !== 'ordm'
            );
            sessionStorage.setItem('Modules', JSON.stringify(filteredModuleIds));
        }
    }
    
    public setModuleSettingsPermission(userModulesSettingData) {
        // Ensure userModulesSettingData is an array
        if (Array.isArray(userModulesSettingData)) {
            const moduleSettingsMap = userModulesSettingData.reduce((acc, module) => {
                if (module && module.moduleName) {
                    acc[module.moduleName] = {
                        isEnabled: module.isEnabled,
                        moduleId: module.moduleId,
                        routerLink: module.routerLink
                    };
                }
                return acc;
            }, {});
            sessionStorage.setItem('ModuleSettingsPermissions', JSON.stringify(moduleSettingsMap));
        }
    }
    public setTotalPoints(points) {
        window.sessionStorage.setItem('Points', JSON.stringify(points))
        SharedService._pointsModule.next(JSON.stringify(points));
    }

    public setProfilePicture(profilePicture) {
        window.sessionStorage.setItem('ProfilePicture', profilePicture)
        SharedService._profilePicture.next(profilePicture);
    }

    public setUserName(name) {
        window.sessionStorage.setItem('name', name);
        SharedService._userName.next(name);
    }

    public setIsPointLocked(isPointLocked) {
        window.sessionStorage.setItem('isPointLocked', isPointLocked);
        SharedService._isPointLocked.next(isPointLocked);
    }

    public setNotificationCount(count) {
        window.sessionStorage.setItem('notificationCount', count);
        SharedService._notificationCount.next(count);
    }
    
}

export class LoggedInSessionContract {
    accessToken:any;
    firstName:any;
    iat:any;
    lastName:any;
    role:any;
    id:any;
    showIncentiveAdmin:any;
    showLemsAdmin:any;
    showLMSAdmin:any
}