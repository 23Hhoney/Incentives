import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { CalendarEventDB } from 'app/main/contracts/Calendar/calendar.CalendarEvent.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { CalendarEventModel } from 'app/main/apps/calendar/event.model';
const calendarPickerObj = new ReplaySubject < CalendarEventDB >(0);
const calendarEventBackRes = new ReplaySubject < string >(0);
const calendarEventModel = new ReplaySubject < CalendarEventModel>(0);

@Injectable()
export class CalendarPickerViewService {

    constructor(private http: HttpClient) { }

    setCalendarPickerObj(calendarPickerEvent: CalendarEventDB): void {
        calendarPickerObj.next(calendarPickerEvent);
    }
    
    getCalendarPickerObj(): Observable<CalendarEventDB> {
        return calendarPickerObj.asObservable();
    }

    setCalendarEventBackRes(res: string): void {
        calendarEventBackRes.next(res);
    }
    
    getCalendarEventBackRes(): Observable<string> {
        return calendarEventBackRes.asObservable();
    }

    setCalendarEventModel(res: CalendarEventModel): void {
        calendarEventModel.next(res);
    }
    
    getCalendarEventModel(): Observable<CalendarEventModel> {
        return calendarEventModel.asObservable();
    }

    getLocaiton(orgId): Observable<any> {
        // , {params: {eventType: type}}
        const uri = environment.dbhost + '/api/v1/getsAllLocations/' + orgId;
        return this.http.get(uri);
    }

}
