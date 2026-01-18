import { EventColor, EventAction } from 'calendar-utils';
import { SelectedData } from '../applicable-select/applicable-select-contract';

export interface CalendarPickerEvent<MetaType = any> {
    id?: string | number;
    start: Date;
    end?: Date;
    title: string;
    color?: EventColor;
    actions?: EventAction[];
    // allDay?: boolean;
    restricted?: boolean;
    notifyEmployee?: boolean;
    noOfDayNotification?: number;
    cssClass?: string;
    resizable?: {
        beforeStart?: boolean;
        afterEnd?: boolean;
    };
    draggable?: boolean;
    meta?: MetaType;
    calendarEventId?: number;

    // event related data
    giftRequire?: boolean;
    bannerRequire?: boolean;
    infraRequire?: boolean;
    manpowerRequire?: boolean;
    pampletsRequire?: boolean;
    refreshmentRequire?: boolean;
    venueRequire?: boolean;
    otherRequire?: boolean;
    otherRequirement?: string;
    applicableFor?: SelectedData;
}

export enum PageEnums {
    HOLIDAY = 'holiday',
    EVENT = 'event'
}

export enum CalendarEventEnums {
    HOLIDAY = 'Holiday',
    EVENT = 'Event'
}

export interface DateTime {
    date: string;
    time: string;
}
