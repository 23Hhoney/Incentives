
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {Configuration} from './config'
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
   private config: Configuration;
   constructor(private http:HttpClient) {}
  
   load(url: string) {
   return new Promise<void>((resolve) => {
      this.http.get(url)
        .subscribe((config:any) => {
         
          this.config = config;
          resolve();
        });
    });
  }

  getConfiguration(): Configuration {
   
    return this.config;
  }
}

export function ConfigLoader(configService: ConfigService) {  
  console.log('check',environment.configFile)
    return () => configService.load(environment.configFile); 
    
}
