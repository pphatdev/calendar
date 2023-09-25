export class Calendar {
    constructor(element: any, settings: any);
    instanceUid: number;
    defaults: {
        theme: null;
        format: string;
        titleFormat: string;
        eventHeaderFormat: string;
        firstDayOfWeek: number;
        language: string;
        todayHighlight: boolean;
        sidebarDisplayDefault: boolean;
        sidebarToggler: boolean;
        eventDisplayDefault: boolean;
        eventListToggler: boolean;
        calendarEvents: null;
    };
    options: any;
    initials: {
        default_class: any;
        validParts: RegExp;
        dates: {
            en: {
                days: string[];
                daysShort: string[];
                daysMin: string[];
                months: string[];
                monthsShort: string[];
                noEventForToday: string;
                noEventForThisDay: string;
            };
            km: {
                days: string[];
                daysShort: string[];
                daysMin: string[];
                months: string[];
                monthsShort: string[];
                noEventForToday: string;
                noEventForThisDay: string;
            };
        };
    };
    startingDay: number | null;
    monthLength: number | null;
    $current: {
        month: any;
        year: any;
        date: any;
    };
    $active: {
        month: any;
        year: any;
        date: any;
        event_date: any;
        events: never[];
    };
    $label: {
        days: never[];
        months: string[];
        days_in_month: number[];
    };
    $markups: {
        calendarHTML: string;
        mainHTML: string;
        sidebarHTML: string;
        eventHTML: string;
    };
    $elements: {
        calendarEl: any;
        innerEl: null;
        sidebarEl: null;
        eventEl: null;
        sidebarToggler: null;
        eventListToggler: null;
        activeDayEl: null;
        activeMonthEl: null;
        activeYearEl: null;
    };
    $breakpoints: {
        tablet: number;
        mobile: number;
    };
    formatDate: (date: any, format: any, language: any) => any;
    selectDate: (event: any) => void;
    selectMonth: (event: any) => void;
    /**
     * Select year
     *
     * @param {*} event
     */
    selectYear: (event: any) => void;
    toggleSidebar: (event: any) => void;
    toggleEventList: (event: any) => void;
    init: () => void;
    destroy: () => void;
    limitTitle: (title: any, limit: any) => any;
    parseFormat: (format: any) => any;
    getBetweenDates: (dates: any) => any[];
    isBetweenDates: (active_date: any, dates: any) => boolean;
    hasSameDayEventType: (date: any, type: any) => boolean;
    /**
     *  Set calendar theme
     *
     * @param {string} themeName
     */
    setTheme: (themeName: string) => void;
    resize: () => void;
    initEventListener: () => void;
    destroyEventListener: () => void;
    calculateDays: () => void;
    buildTheBones: () => void;
    buildEventList: () => void;
    addEventList: (eventData: any) => void;
    removeEventList: (eventData: any) => void;
    buildSidebarYear: () => any;
    buildSidebarMonths: () => any;
    buildCalendar: () => void;
    addEventIndicator: (event: any) => void;
    removeEventIndicator: (event: any) => void;
    /****************
    *    METHODS    *
    ****************/
    buildEventIndicator: () => void;
    /**
     * Select Event (not using)
     *
     * @param {any}         event
     * @param {Function}    callback
     * @returns
     *  */
    selectEvent: (event: any, callback: Function) => void;
    getActiveDate: () => any;
    getActiveEvents: () => never[];
    toggleOutside: (event: any) => void;
    addCalendarEvent: (arr: any) => void;
    removeCalendarEvent: (arr: any) => void;
    isValidDate: (d: any) => boolean;
}
export default Calendar;
