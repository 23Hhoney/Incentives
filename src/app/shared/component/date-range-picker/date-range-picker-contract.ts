export interface PresetItem {
    presetLabel: string;
    range: Range;
}
 
export interface Range {
    fromDate: Date;
    toDate: Date;
}
 
export interface CalendarOverlayConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    shouldCloseOnBackdropClick?: boolean;
}
 
export interface NgxDrpOptions {
    presets: Array<PresetItem>;
    format: string;
    range: Range;
    excludeWeekends?: boolean;
    locale?: string;
    fromMinMax?: Range;
    toMinMax?: Range;
    applyLabel?: string;
    cancelLabel?: string;
    animation?: boolean;
    calendarOverlayConfig?: CalendarOverlayConfig;
    placeholder?: string;
    startDatePrefix?: string;
    endDatePrefix?: string;
}

export const DateFormatCustom = {
    DATE: 'DD MMM YYYY',
    DATE_PIPE: 'dd MMM yyyy',
    DATE_PIPE_W_DASH: 'dd-MMM-yyyy',
    DATE_TIME: 'DD MMM YYYY hh:mm A',
    DATE_TIME_PIPE: 'dd MMM yyyy hh:mm A',
    DATE_TIME_PIPE_TIME: 'h:mm a',
    DATE_TRACKER: 'yyyy-MM-dd'
};

export const DatePickerFormat = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD MMM YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

export const DayNames = {
    SUNDAY: 'Sunday',
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday'
};
