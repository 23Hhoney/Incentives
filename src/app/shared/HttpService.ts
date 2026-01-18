
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ConfigService } from "./configuration/config-service";
import { environment } from "environments/environment";

@Injectable({ providedIn: 'root' })
export class HttpService {

  constructor(private _httpClient: HttpClient,
    private _configService: ConfigService) {
  }

  public post(url, paramObj): Observable<any> {
    url = environment.apiUrl + url;
    const headerObject = new HttpHeaders(this.getHeaderObject(url));
    return this._httpClient.post(url, paramObj, { headers: headerObject });
  }

  public postWithOutToken(url, paramObj): Observable<any> {
    url = environment.apiUrl + url;
    const headerObject = new HttpHeaders(this.getHeaderObject(url));
    return this._httpClient.post(url, paramObj, { headers: headerObject });
  }
  public postWithHttpOptions(url, paramObj, httpOptions): Observable<any> {
    url = environment.apiUrl + url;

    const headerObject = new HttpHeaders(this.getHeaderObject(url));
    httpOptions = {
      'responseType': 'arraybuffer' as 'json',
      headers: headerObject
    };
    return this._httpClient.post(url, paramObj, httpOptions);
  }
  public getFile(url: string): Observable<any> {
    url = environment.apiUrl + url;

    const headerObject = new HttpHeaders(this.getHeaderObject(url));
    let httpOptions = {
      'responseType': 'arraybuffer' as 'json',
      headers: headerObject
    };
    return this._httpClient.get(url, httpOptions);
  }

  public postFile(url, paramObj): Observable<any> {

    url = environment.apiUrl + url;
    const headerObject = new HttpHeaders(this.getHeaderObject(url));
    let httpOptions = {
      'responseType': 'arraybuffer' as 'json',
      headers: headerObject
    };
    return this._httpClient.post(url, paramObj,httpOptions);
  }


  public get(url: string): Observable<any> {
    url = environment.apiUrl + url;

    const headerObject = new HttpHeaders(this.getHeaderObject(url));
    return this._httpClient.get(url, { headers: headerObject });
  }

  public getWithOutAuthorize(url: string): Observable<any> {
    url = environment.apiUrl + url;
    const headerObject = new HttpHeaders(this.getHeaderObject(url));
    return this._httpClient.get(url, { headers: headerObject });
  }

  // prepares the request header based on application type
  getHeaderObject(path: any): string | { [name: string]: string | string[]; } {
    let headerObject = null;

    headerObject = {
      'Authorization': `Bearer ${window.sessionStorage.getItem('accessToken')}`,
      'tenant-code': environment.tentantcode
    };
    return headerObject;
  }



}