import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({
    providedIn: 'root'
  })
  export class NotificationService {
  
    constructor(private toastrService: ToastrService) { }
  
    successTopRight (message: string, title?: string) {
      this.toastrService.success(message, title);
    }
    successTopLeft (message: string, title?: string) {
      this.toastrService.success(message, title, {
        positionClass: 'toast-top-left'
      });
    }
    successBottomLeft (message: string, title?: string) {
      this.toastrService.success(message, title, {
        positionClass: 'toast-bottom-left'
      });
    }
    successBottomRight (message: string, title?: string) {
      this.toastrService.success(message, title, {
        positionClass: 'toast-bottom-right'
      });
    }
    errorTopRight (message: string, title?: string) {
      this.toastrService.error(message, title);
    }
    errorTopLeft (message: string, title?: string) {
      this.toastrService.error(message, title, {
        positionClass: 'toast-top-left'
      });
    }
    errorBottomLeft (message: string, title?: string) {
      this.toastrService.error(message, title, {
        positionClass: 'toast-bottom-left'
      });
    }
    errorBottomRight (message: string, title?: string) {
      this.toastrService.error(message, title, {
        positionClass: 'toast-bottom-right'
      });
    }
    warningTopRight (message: string, title?: string) {
      this.toastrService.warning(message, title);
    }
    warningTopRightWithImage(message: string, title?: string, imageUrl?: string) {
      const html = '<img class=\"warinig-instruct\" src=\'' + imageUrl + '\'/>' +
       '<span class=\"warning-span\">' + message + '</span>';
      this.toastrService.warning(html, title, {
        tapToDismiss: true,
        enableHtml: true,
        timeOut: 7000
      });
    }
    warningTopRightHtmlView(message: string, title?: string, imageUrl?: string) {
      const html = '<span class=\"warning-span-texto\">' + message + '</span>';
      this.toastrService.warning(html, title, {
        tapToDismiss: true,
        enableHtml: true,
        timeOut: 7000
      });
    }
    warningTopLeft (message: string, title?: string) {
      this.toastrService.warning(message, title, {
        positionClass: 'toast-top-left'
      });
    }
    warningBottomLeft (message: string, title?: string) {
      this.toastrService.warning(message, title, {
        positionClass: 'toast-bottom-left'
      });
    }
    warningBottomRight (message: string, title?: string) {
      this.toastrService.warning(message, title, {
        positionClass: 'toast-bottom-right'
      });
    }
    infoTopRight (message: string, title?: string) {
      this.toastrService.info(message, title);
    }
    infoTopLeft (message: string, title?: string) {
      this.toastrService.info(message, title, {
        positionClass: 'toast-top-left'
      });
    }
    infoBottomLeft (message: string, title?: string) {
      this.toastrService.info(message, title, {
        positionClass: 'toast-bottom-left'
      });
    }
    infoBottomRight (message: string, title?: string) {
      this.toastrService.info(message, title, {
        positionClass: 'toast-bottom-right'
      });
    }
    warningTopRightHtmlView1(message: string, title?: string, imageUrl?: string) {
      const html = '<span class=\"warning-span-texto1\">' + message + '</span>';
      this.toastrService.warning(html, title, {
        tapToDismiss: true,
        enableHtml: true,
        timeOut: 7000
      });
    }
    warningTopRightHtmlView2(message: string, title?: string, imageUrl?: string) {
     const html = '<span>' + message + '</span>';
      this.toastrService.warning(html, title, {
        tapToDismiss: true,
        enableHtml: true,
        timeOut: 7000
      });
    }
  }
  