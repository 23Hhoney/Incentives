// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    tentantcode:"flatworld",
    production: false,
    // apiUrl: 'http://144.91.65.218:8175/',
    //apiUrl: 'http://172.191.225.236:8080/',
     apiUrl: 'https://incentive.flatworldinfotech.com/', // Use proxy instead in development
   // apiUrl: '/', // Proxy will forward to https://incentive.flatworldinfotech.com/
    configFile: 'assets/config/app-config.json',
    clientId: '658302669558-0tvvga5g6rjc47m2glv3abm5jpfu84dp.apps.googleusercontent.com',
    deployAdmin : true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
