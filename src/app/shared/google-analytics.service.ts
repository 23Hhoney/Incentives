import { HttpClient } from "@angular/common/http";
import { Injectable, NgZone, Renderer2, RendererFactory2 } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class GoogleAnalyticsService {
    private gaInitialized = false;
    private renderer: Renderer2;
    constructor(private http: HttpClient, private router: Router,private zone: NgZone,
      rendererFactory: RendererFactory2
    ) {
        // this.zone.run(() => {
        //     this.router.events.pipe(filter(event => event instanceof NavigationEnd))
        //     .subscribe((event: NavigationEnd) => {
               
        //         this.trackEvent(event.id.toString(), event.urlAfterRedirects);
            
        //     });
        // });
    }

    loadGoogleAnalytics(trackingId: string,action: string ='', category: string='') {
        if (this.gaInitialized) return;
    
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
        script.onload = () => {
          (window as any).dataLayer = (window as any).dataLayer || [];
          function gtag(...args: any[]) {
            (window as any).dataLayer.push(args);
          }
          (window as any).gtag = gtag;
    
          gtag('js', new Date());
          gtag('config', trackingId);
          this.gaInitialized = true;
        //   this.trackEvent(action,category);
        };
        document.head.appendChild(script);
        
      }
    
      trackEvent(action: string, category: string, label: string = '', value: number = 0) {
        console.log('trackEvent ' + this.gaInitialized)
        if (!this.gaInitialized) return;
        (window as any).gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }
  
      static loadGoogleAnalytics(trackingID: string): void {

        let gaScript = document.createElement('script');
        gaScript.setAttribute('async', 'true');
        gaScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${ trackingID }`);
    
        let gaScript2 = document.createElement('script');
        gaScript2.innerText = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date());gtag(\'config\', \'${ trackingID }\');`;
    
        
        document.documentElement.firstChild.appendChild(gaScript);
        document.documentElement.firstChild.appendChild(gaScript2);
      }
  
  }