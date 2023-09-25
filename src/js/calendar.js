import { windowWidth } from "../libs/windows";

export class Calendar {
    instanceUid = 0

    constructor(element, settings) {

        this.defaults = {
            theme: null,
            format: 'mm/dd/yyyy',
            titleFormat: 'MM yyyy',
            eventHeaderFormat: 'MM d, yyyy',
            firstDayOfWeek: 0,
            language: 'en',
            todayHighlight: false,
            sidebarDisplayDefault: true,
            sidebarToggler: true,
            eventDisplayDefault: true,
            eventListToggler: true,
            calendarEvents: null
        }

        this.options = $.extend({}, this.defaults, settings);

        this.initials = {
            default_class: $(element)[0].classList.value,
            validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
            dates: {
                en: {
                    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
                    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    noEventForToday: "No event",
                    noEventForThisDay: "No event"
                },
                km: {
                    days: ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បត្តិ៍", "សុក្រ", "សៅរ៍"],
                    daysShort: ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បត្តិ៍", "សុក្រ", "សៅរ៍"],
                    daysMin: ["អា", "ច", "អ", "ព", "ព្រ", "ស", "ស"],
                    months: ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"],
                    monthsShort: ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"],
                    noEventForToday: "",
                    noEventForThisDay: ""
                }
            }
        };

        this.initials.weekends = {
            sun: this.initials.dates[this.options.language].daysShort[0],
            sat: this.initials.dates[this.options.language].daysShort[6]
        };

        // Format Calendar Events into selected format
        if (this.options.calendarEvents != null) {
            for (var i = 0; i < this.options.calendarEvents.length; i++) {
                // If event doesn't have an id, throw an error message
                if (!this.options.calendarEvents[i].id) {
                    console.log("%c Event named: \"" + this.options.calendarEvents[i].name + "\" doesn't have a unique ID ", "color:white;font-weight:bold;background-color:#e21d1d;");
                }
                if (this.isValidDate(this.options.calendarEvents[i].date)) {
                    this.options.calendarEvents[i].date = this.formatDate(this.options.calendarEvents[i].date, this.options.format);
                }
            }
        }

        // Global variables
        this.startingDay = null;
        this.monthLength = null;

        // CURRENT
        this.$current = {
            month: (isNaN(this.month) || this.month == null) ? new Date().getMonth() : this.month,
            year: (isNaN(this.year) || this.year == null) ? new Date().getFullYear() : this.year,
            date: this.formatDate(this.initials.dates[this.defaults.language].months[new Date().getMonth()] + ' ' + new Date().getDate() + ' ' + new Date().getFullYear(), this.options.format)
        };

        // ACTIVE
        this.$active = {
            month: this.$current.month,
            year: this.$current.year,
            date: this.$current.date,
            event_date: this.$current.date,
            events: []
        };

        // LABELS
        this.$label = {
            days: [],
            months: this.initials.dates[this.defaults.language].months,
            days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        };

        // HTML Markups (template)
        this.$markups = {
            calendarHTML: '',
            mainHTML: '',
            sidebarHTML: '',
            eventHTML: ''
        };

        // HTML DOM elements
        this.$elements = {
            calendarEl: $(element),
            innerEl: null,
            sidebarEl: null,
            eventEl: null,

            sidebarToggler: null,
            eventListToggler: null,

            activeDayEl: null,
            activeMonthEl: null,
            activeYearEl: null
        };

        this.$breakpoints = {
            tablet: 768,
            mobile: 425
        };

        this.formatDate = $.proxy(this.formatDate, this);
        this.selectDate = $.proxy(this.selectDate, this);
        this.selectMonth = $.proxy(this.selectMonth, this);
        this.selectYear = $.proxy(this.selectYear, this);
        // this.selectEvent = $.proxy(this.selectEvent, this);
        this.toggleSidebar = $.proxy(this.toggleSidebar, this);
        this.toggleEventList = $.proxy(this.toggleEventList, this);

        this.instanceUid = this.instanceUid++;
        this.init();
    }

    init = () => {
        const element = this.$elements.calendarEl[0]

        /* when not matching calendar-initialized */ 
        if (!element.classList.contains('calendar-initialized')) {
            element.classList.add('evo-calendar','calendar-initialized')
            /* <tablet|mobile> */ 
            if (windowWidth <= this.$breakpoints.tablet) { 

                /* close sidebar and event list on load */ 
                element.classList.add('sidebar-hide', 'event-hide')
            } else {

                /* set sidebar visibility on load */ 
                if (!this.options.sidebarDisplayDefault) element.classList.add('sidebar-hide')
                /*  set event-hide visibility on load */ 
                if (!this.options.eventDisplayDefault) element.classList.add('event-hide')
            }

            /* set calendar theme */
            if (this.options.theme) this.setTheme(this.options.theme);

            /* start building the calendar components */ 
            this.buildTheBones();
        }
    };
    
    // Destroy plugin
    destroy = () => {
        this.destroyEventListener();
        if (this.$elements.calendarEl) {
            this.$elements.calendarEl.removeClass('calendar-initialized');
            this.$elements.calendarEl.removeClass('evo-calendar');
            this.$elements.calendarEl.removeClass('sidebar-hide');
            this.$elements.calendarEl.removeClass('event-hide');
        }
        this.$elements.calendarEl.empty();
        this.$elements.calendarEl.attr('class', this.initials.default_class);
        $(this.$elements.calendarEl).trigger("destroy", [this])
    }

    // Limit title (...)
    limitTitle = (title, limit) => {

        var newTitle = [];
        limit = limit === undefined ? 18 : limit;
        if ((title).split(' ').join('').length > limit) {
            var t = title.split(' ');
            for (var i=0; i<t.length; i++) {
                if (t[i].length + newTitle.join('').length <= limit) {
                    newTitle.push(t[i])
                }
            }
            return newTitle.join(' ') + '...'
        }
        return title;
    }
            
    // Parse format (date)
    parseFormat = (format) => {

        if (typeof format.toValue === 'function' && typeof format.toDisplay === 'function') return format;
        // IE treats \0 as a string end in inputs (truncating the value),
        // so it's a bad format delimiter, anyway
        const separators    = format.replace(this.initials.validParts, '\0').split('\0')
        const parts         = format.match(this.initials.validParts);

        if (!separators || !separators.length || !parts || parts.length === 0){
            console.log("%c Invalid date format ", "color:white;font-weight:bold;background-color:#e21d1d;");
        }
        return {
            separators: separators, 
            parts: parts
        };
    };
    
    // Format date
    formatDate = (date, format, language) => {

        if (!date) return;
        language = language ? language : this.defaults.language

        if (typeof format === 'string')
            format = this.parseFormat(format);
        if (format.toDisplay)
            return format.toDisplay(date, format, language);

        const ndate = new Date(date);
        const val   = {
            d   : ndate.getDate(),
            D   : this.initials.dates[language].daysShort[ndate.getDay()],
            DD  : this.initials.dates[language].days[ndate.getDay()],
            m   : ndate.getMonth() + 1,
            M   : this.initials.dates[language].monthsShort[ndate.getMonth()],
            MM  : this.initials.dates[language].months[ndate.getMonth()],
            yy  : ndate.getFullYear().toString().substring(2),
            yyyy: ndate.getFullYear(),
            dd  : null,
            mm  : null
        };
        
        val.dd = (val.d < 10 ? '0' : '') + val.d;
        val.mm = (val.m < 10 ? '0' : '') + val.m;

        date    = [];
        const seps = $.extend([], format.separators);
        for (var i = 0, cnt = format.parts.length; i <= cnt; i++){
            if (seps.length)
                date.push(seps.shift());
            date.push(val[format.parts[i]]);
        }
        return date.join('');
    };

    // Get dates between two dates
    getBetweenDates = (dates) => {
        const betweenDates = [];
        for (var x = 0; x < this.monthLength; x++) {
            var active_date = this.formatDate(this.$label.months[this.$active.month] +' '+ (x + 1) +' '+ this.$active.year, this.options.format);
            if (this.isBetweenDates(active_date, dates)) {
                betweenDates.push(active_date);
            }
        }
        return betweenDates;
    };

    // Check if date is between the passed calendar date 
    isBetweenDates = (active_date, dates) => {
        var sd, ed;
        if (dates instanceof Array) {
            sd = new Date(dates[0]);
            ed = new Date(dates[1]);
        } else {
            sd = new Date(dates);
            ed = new Date(dates);
        }
        if (sd <= new Date(active_date) && ed >= new Date(active_date)) {
            return true;
        }
        return false;
    }
    
    //  Check if event has the same event type in the same date
    hasSameDayEventType = (date, type) => {
        let eventLength = 0;
        for (var i = 0; i < this.options.calendarEvents.length; i++) {
            if (this.options.calendarEvents[i].date instanceof Array) {

                var arr = this.getBetweenDates(this.options.calendarEvents[i].date);
                
                for (var x = 0; x < arr.length; x++) {
                    if(date === arr[x] && type === this.options.calendarEvents[i].type) {
                        eventLength++;
                    }
                }
            } 
            else {

                if(date === this.options.calendarEvents[i].date && type === this.options.calendarEvents[i].type) {
                    eventLength++;
                }
            }
        }
        if (eventLength > 0) {
            return true;
        }
        return false;
    }
    
    /**
     *  Set calendar theme
     * 
     * @param {string} themeName 
     */ 
    setTheme = (themeName) => {

        const prevTheme     = this.options.theme;
        this.options.theme  = themeName.toLowerCase().split(' ').join('-');

        if (this.options.theme) $(this.$elements.calendarEl).removeClass(prevTheme);
        if (this.options.theme !== 'default') $(this.$elements.calendarEl).addClass(this.options.theme);
    }

    // Called in every resize
    resize = () => {

        const hasSidebar    = !this.$elements.calendarEl.hasClass('sidebar-hide');
        const hasEvent      = !this.$elements.calendarEl.hasClass('event-hide');

        if (windowWidth <= this.$breakpoints.tablet && windowWidth > this.$breakpoints.mobile) {
            
            if(hasSidebar) this.toggleSidebar();
            if(hasEvent) this.toggleEventList();

            $(window)
                .off('click.evocalendar.evo-' + this.instanceUid)
                .on('click.evocalendar.evo-' + this.instanceUid, $.proxy(this.toggleOutside, this));
        } else if (windowWidth <= this.$breakpoints.mobile) {

            if(hasSidebar) this.toggleSidebar(false);
            if(hasEvent) this.toggleEventList(false);

            $(window).off('click.evocalendar.evo-' + this.instanceUid)
        } else {
            $(window).off('click.evocalendar.evo-' + this.instanceUid);
        }
    }

    // Initialize event listeners
    initEventListener = () => {
        
        // resize
        $(window)
            .off('resize.evocalendar.evo-' + this.instanceUid)
            .on('resize.evocalendar.evo-' + this.instanceUid, $.proxy(this.resize, this));

        // IF sidebarToggler: set event listener: toggleSidebar
        if(this.options.sidebarToggler) {
            this.$elements.sidebarToggler
                .off('click.evocalendar')
                .on('click.evocalendar', this.toggleSidebar);
        }
        
        // IF eventListToggler: set event listener: toggleEventList
        if(this.options.eventListToggler) {
            this.$elements.eventListToggler
                .off('click.evocalendar')
                .on('click.evocalendar', this.toggleEventList);
        }

        // set event listener for each month
        this.$elements.sidebarEl.find('[data-month-val]')
            .off('click.evocalendar')
            .on('click.evocalendar', this.selectMonth);

        // set event listener for year
        this.$elements.sidebarEl.find('[data-year-val]')
            .off('click.evocalendar')
            .on('click.evocalendar', this.selectYear);

        // set event listener for every event listed
        this.$elements.eventEl.find('[data-event-index]')
            .off('click.evocalendar')
            .on('click.evocalendar', this.selectEvent);
    };
    
    // Destroy event listeners
    destroyEventListener = () => {
        
        $(window).off('resize.evocalendar.evo-' + this.instanceUid);
        $(window).off('click.evocalendar.evo-' + this.instanceUid);
        
        // IF sidebarToggler: remove event listener: toggleSidebar
        if(this.options.sidebarToggler) {
            this.$elements.sidebarToggler.off('click.evocalendar');
        }
        
        // IF eventListToggler: remove event listener: toggleEventList
        if(this.options.eventListToggler) {
            this.$elements.eventListToggler.off('click.evocalendar');
        }

        // remove event listener for each day
        this.$elements.innerEl.find('.calendar-day').children().off('click.evocalendar')

        // remove event listener for each month
        this.$elements.sidebarEl.find('[data-month-val]').off('click.evocalendar');

        // remove event listener for year
        this.$elements.sidebarEl.find('[data-year-val]').off('click.evocalendar');

        // remove event listener for every event listed
        this.$elements.eventEl.find('[data-event-index]').off('click.evocalendar');
    };
    
    // Calculate days (incl. monthLength, startingDays based on :firstDayOfWeekName)
    calculateDays = () => {

        this.monthLength = this.$label.days_in_month[this.$active.month]; // find number of days in month
        if (this.$active.month == 1) { // compensate for leap year - february only!
            if((this.$active.year % 4 == 0 && this.$active.year % 100 != 0) || this.$active.year % 400 == 0){
                this.monthLength = 29;
            }
        }
        const nameDays = this.initials.dates[this.options.language].daysShort;
        let weekStart = this.options.firstDayOfWeek;
        
        while (this.$label.days.length < nameDays.length) {
            if (weekStart == nameDays.length) {
                weekStart=0;
            }
            this.$label.days.push(nameDays[weekStart]);
            weekStart++;
        }
        const firstDay = new Date(this.$active.year, this.$active.month).getDay() - weekStart;
        this.startingDay = firstDay < 0 ? (this.$label.days.length + firstDay) : firstDay;
    }

    // Build the bones! (incl. sidebar, inner, events), called once in every initialization
    buildTheBones = () => {
        
        this.calculateDays();
        
        if (!this.$elements.calendarEl.html()) {
            
            let markup      = '';
            let monthlist   = '';
            let datelist    = '';

            this.$label.days.forEach( 
                label => {
                    datelist += 
                    `<td class="${ 
                        (label === this.initials.weekends.sat || label === this.initials.weekends.sun)  
                            ? 'calendar-header-day --weekend'  
                            : 'calendar-header-day'}">${label}
                    </td>`
                }
            )

            this.$label.months.forEach( 
                (label, i ) => {
                    monthlist += `<li class="month" role="button" data-month-val="${i}"> ${
                        this.initials.dates[this.options.language].months[i]
                    }</li>`
                }
            )
            
            markup = `
                <div class="calendar-sidebar">
                    <div class="calendar-year">
                        <button class="icon-button" role="button" data-year-val="prev" title="Previous year">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#ffffff" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        &nbsp;<p></p>&nbsp;
                        <button class="icon-button" role="button" data-year-val="next" title="Next year">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.91003 19.9201L15.43 13.4001C16.2 12.6301 16.2 11.3701 15.43 10.6001L8.91003 4.08008" stroke="#ffffff" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="month-list">
                        <ul class="calendar-months font-head">${monthlist}</ul>
                    </div>
                </div>
                <div class="calendar-inner">
                    <table class="calendar-table">
                        <tr> <th colspan="7" class="current-date"></th> </tr>
                        <tr class="calendar-header font-head"> ${ datelist }</tr>
                    </table>
                </div>
                <div class="calendar-events">
                    <div class="event-header"></div>
                    <div class="event-list"></div>
                </div>
            `;

            this.$elements.calendarEl.html(markup);

            if (!this.$elements.sidebarEl) this.$elements.sidebarEl = $(this.$elements.calendarEl).find('.calendar-sidebar');
            if (!this.$elements.innerEl) this.$elements.innerEl = $(this.$elements.calendarEl).find('.calendar-inner');
            if (!this.$elements.eventEl) this.$elements.eventEl = $(this.$elements.calendarEl).find('.calendar-events');

            if(this.options.sidebarToggler) {
                $(this.$elements.sidebarEl).append(`
                    <button id="sidebarToggler" type="button" class="icon-button">
                        <svg width="17" height="17" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H21" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 12H21" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 18H21" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                `);

                if(!this.$elements.sidebarToggler) this.$elements.sidebarToggler = 
                    $(this.$elements.sidebarEl).find('button#sidebarToggler');
            }

            if(this.options.eventListToggler) {

                $(this.$elements.calendarEl).append(`
                    <button id="eventListToggler" type="button" class="icon-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.91003 19.9201L15.43 13.4001C16.2 12.6301 16.2 11.3701 15.43 10.6001L8.91003 4.08008" stroke="#ffffff" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                `);
                if(!this.$elements.eventListToggler) 
                    this.$elements.eventListToggler = $(this.$elements.calendarEl).find('#eventListToggler');
            }
        }

        this.buildSidebarYear();
        this.buildSidebarMonths();
        this.buildCalendar();
        this.buildEventList();
        this.initEventListener();

        this.resize();
    }

    // Build Event: Event list
    buildEventList = () => {

        let markup          = "";
        let hasEventToday   = false;
        this.$active.events = [];

        // Event date
        const title         = this.formatDate(
            this.$active.date, 
            this.options.eventHeaderFormat, 
            this.options.language
        );

        // Event list
        const eventListEl   = this.$elements.eventEl.find('.event-list');

        const eventAdder    = (event) => {
            hasEventToday = true;
            this.addEventList(event)
        }

        this.$elements.eventEl.find('.event-header').text(title);

        // Clear event list item(s)
        if (eventListEl.children().length > 0) eventListEl.empty();

        if (this.options.calendarEvents) {

            for (var i = 0; i < this.options.calendarEvents.length; i++) {

                if(this.isBetweenDates(this.$active.date, this.options.calendarEvents[i].date)) {
                    eventAdder(this.options.calendarEvents[i])
                }
                else if (this.options.calendarEvents[i].everyYear) {
                    const d = new Date(this.$active.date).getMonth() + 1 + ' ' + new Date(this.$active.date).getDate();
                    const dd = new Date(this.options.calendarEvents[i].date).getMonth() + 1 + ' ' + new Date(this.options.calendarEvents[i].date).getDate();
                    // var dates = [this.formatDate(this.options.calendarEvents[i].date[0], 'mm/dd'), this.formatDate(this.options.calendarEvents[i].date[1], 'mm/dd')];

                    if(d==dd) {
                        eventAdder(this.options.calendarEvents[i])
                    }
                }
            };
        }


        // IF: no event for the selected date
        if(!hasEventToday) {
            markup = '<div class="event-empty">';
            if (this.$active.date === this.$current.date) {
                markup += `<p>${this.initials.dates[this.options.language].noEventForToday}</p>`;
            } else {
                markup += `<p>${this.initials.dates[this.options.language].noEventForThisDay}</p>`;
            }
            markup += '</div>';
        }
        eventListEl.append(markup)
    }

    // Add single event to event list
    addEventList = (eventData) => {
        var markup;
        var eventListEl = this.$elements.eventEl.find('.event-list');
        if (eventListEl.find('[data-event-index]').length === 0) eventListEl.empty();
        this.$active.events.push(eventData);

        markup = 
            `<div class="event-container" role="button" data-event-index="${(eventData.id)}">
                <div class="event-icon">
                    <dot-icon ${eventData.color? `style="background-color:${eventData.color}"`:`class="event-bullet-${eventData.type}"`}></dot-icon>
                </div>
                <div class="event-info">
                    <h1 class="event-title font-head">${this.limitTitle(eventData.name)}</h1>
                    <p class="event-desc font-body">${eventData.description ? eventData.description:''}</p>
                </div>
                ${ eventData.badge 
                    ? `<div class="badge-event" ${ eventData.color 
                        ? `style="border: 1px solid ${eventData.color}; color:${eventData.color}"` 
                        : `class="event-bullet-${eventData.type}" `}>${eventData.badge}</div>` 
                    : ``}
            </div>`;

        eventListEl.append(markup);

        this.$elements.eventEl.find('[data-event-index="'+(eventData.id)+'"]')
            .off('click.evocalendar')
            .on('click.evocalendar', this.selectEvent);
    }

    // Remove single event to event list
    removeEventList = (eventData) => {
        let markup;
        let eventListEl = this.$elements.eventEl.find('.event-list');

        if (eventListEl.find('[data-event-index="'+eventData+'"]').length === 0) return; // event not in active events
        
        eventListEl.find('[data-event-index="'+eventData+'"]').remove();

        if (eventListEl.find('[data-event-index]').length === 0) {
            eventListEl.empty();
            if (this.$active.date === this.$current.date) {
                markup = `<p>${this.initials.dates[this.options.language].noEventForToday}</p>`;
            } else {
                markup = `<p>${this.initials.dates[this.options.language].noEventForThisDay}</p>`;
            }
            eventListEl.append(markup)
        }
    }
    
    // Build Sidebar: Year text
    buildSidebarYear = () => {
        return this.$elements.sidebarEl.find('.calendar-year > p').text(this.$active.year);
    }

    // Build Sidebar: Months list text
    buildSidebarMonths = () => {
        return (
            this.$elements.sidebarEl.find('.calendar-months > [data-month-val]').removeClass('active-month'),
            this.$elements.sidebarEl.find('.calendar-months > [data-month-val="'+this.$active.month+'"]').addClass('active-month')
        )
    }

    // Build Calendar: Title, Days
    buildCalendar = () => {
        this.calculateDays();

        const title = this.formatDate(
            new Date( this.$label.months[this.$active.month] +' 1 '+ this.$active.year ), 
            this.options.titleFormat, this.options.language
        );
        this.$elements.innerEl.find('.calendar-table th').text(title);
        this.$elements.innerEl.find('.calendar-body').remove(); // Clear days
        
        let date    = 1;
        let grid    = '';

        /** this loop is for is weeks (rows) */ 
        for (var i = 0; i < 9; i++) { 
            
            /**
             *  this loop is for is days (column)
             * */ 
            this.$label.days.forEach(( day, j ) => {

                /** when date smaller than total days in month 
                 * and row (i) bigger than 0 
                 * or current culumn (j) >= starting day  
                 * 
                 * @example for (j) >= starting day  
                 *  last month end or out of days : {on 31th, Thu, Sep, 2023}
                 *  so this month should be containue on : {1st, Fri, Sep, 2023}
                 **/ 
                if (date <= this.monthLength && (i > 0 || j >= this.startingDay)) {
                    grid += `<td class="${
                                (day === this.initials.weekends.sat || day === this.initials.weekends.sun) 
                                    ? 'calendar-day --weekend'
                                    : 'calendar-day'
                            }">
                            <div class="day" role="button" data-date-val="${
                                this.formatDate(
                                    this.$label.months[this.$active.month]+' '+date+' '+this.$active.year, this.options.format
                                )
                            }">${date}</div>`
                    date++;
                } else {

                    grid += '<td>';
                }
                grid += '</td>';
            })
            if (date > this.monthLength) {
                /**
                 * stop making rows if we've run out of days
                 * */ 
                break;
            } else {

                grid += `</tr><tr class="calendar-body">`; // add if not
            }
        }

        const calendarBody = `<tr class="calendar-body"> ${grid} </tr>`;
        this.$elements.innerEl.find('.calendar-table').append(calendarBody);

        if(this.options.todayHighlight) {
            this.$elements.innerEl.find(`[data-date-val='${this.$current.date}']`).addClass('calendar-today');
        }
        
        // set event listener for each day
        this.$elements.innerEl.find('.calendar-day').children()
            .off('click.evocalendar')
            .on('click.evocalendar', this.selectDate)

        const selectedDate = this.$elements.innerEl.find("[data-date-val='" + this.$active.date + "']");
        
        if (selectedDate) {
            // Remove active class to all
            this.$elements.innerEl.children().removeClass('calendar-active');
            // Add active class to selected date
            selectedDate.addClass('calendar-active');
        }
        if(this.options.calendarEvents != null) { // For event indicator (dots)
            this.buildEventIndicator();
        }
    };

    // Add event indicator/s (dots)
    addEventIndicator = (event) => {
        let eventDate   = event.date;
        const type      = event.type;
        const appendDot = (date) => {

            const thisDate = this.$elements.innerEl.find(`[data-date-val="${date}"]`);
            if (thisDate.find('span.event-indicator').length === 0) {
                thisDate.append('<span class="event-indicator"></span>');
            }

            if (thisDate.find('span.event-indicator > .type-bullet > .type-'+type).length === 0) {
                let htmlToAppend   = '';
                event.color
                    ? htmlToAppend = `<div class="type-bullet"><div style="background-color:${event.color}"></div></div>`
                    : htmlToAppend = `<div class="type-bullet"><div class="type-${event.type}"></div></div>`
                thisDate.find('.event-indicator').append(htmlToAppend);
            }
        }    
        
        if (eventDate instanceof Array) {
            if (event.everyYear) {
                for (var x=0; x<eventDate.length; x++) {
                    eventDate[x] = this.formatDate(new Date(eventDate[x]).setFullYear(this.$active.year), this.options.format);
                }
            }
            var active_date = this.getBetweenDates(eventDate);
            
            for (var i=0; i<active_date.length; i++) appendDot(active_date[i]);

        } else {
            if (event.everyYear) {
                eventDate = this.formatDate(new Date(eventDate).setFullYear(this.$active.year), this.options.format);
            }
            appendDot(eventDate);
        }
    };

    
    //  Remove event indicator/s (dots)
    removeEventIndicator = (event) => {
        const eventDate = event.date;
        const type      = event.type;

        if (eventDate instanceof Array) {

            var activeDate = this.getBetweenDates(eventDate);
            
            for (var i=0; i<activeDate.length; i++) removeDot(activeDate[i]);

        } else {
            removeDot(eventDate);
        }

        function removeDot(date) {
            // Check if no '.event-indicator', 'cause nothing to remove
            if (this.$elements.innerEl.find('[data-date-val="'+date+'"] span.event-indicator').length === 0) {
                return;
            }

            // // If has no type of event, then delete 
            if (!this.hasSameDayEventType(date, type)) {
                this.$elements.innerEl.find('[data-date-val="'+date+'"] span.event-indicator > .type-bullet > .type-'+type).parent().remove();
            }
        }
    };
    
    /****************
    *    METHODS    *
    ****************/

    // Build event indicator on each date
    buildEventIndicator = () => {
        
        // prevent duplication
        this.$elements.innerEl.find('.calendar-day > day > .event-indicator').empty();
        
        for (var i = 0; i < this.options.calendarEvents.length; i++) {
            this.addEventIndicator(this.options.calendarEvents[i]);
        }
    };

    /**
     * Select Event (not using)
     * 
     * @param {any}         event
     * @param {Function}    callback
     * @returns
     *  */ 
    selectEvent = (event, callback) => {

        if ( typeof callback === "function" ) {
            console.log(event.target); 
        }
    }

    /**
     * Select year
     * 
     * @param {*} event 
     */  
    selectYear = (event) => {

        let element, yearVal;
        const hasSidebar = !this.$elements.calendarEl.hasClass('sidebar-hide');

        if (typeof event === 'string' || typeof event === 'number') {
            if ((parseInt(event)).toString().length === 4) {
                yearVal = parseInt(event);
            }
        } else {
            element = $(event.target).closest('[data-year-val]');
            yearVal = $(element).data('yearVal');
        }

        if(yearVal == "prev") {
            --this.$active.year;
        } else if (yearVal == "next") {
            ++this.$active.year;
        } else if (typeof yearVal === 'number') {
            this.$active.year = yearVal;
        }
        
        if (windowWidth <= this.$breakpoints.mobile) {
            if(hasSidebar) this.toggleSidebar(false);
        }

        this.buildSidebarYear();
        this.buildCalendar();
    };

    // Select month
    selectMonth = function(event) {
        var _THIS = this;
        var windowW = $(window).width();
        var hasSidebar = !_THIS.$elements.calendarEl.hasClass('sidebar-hide');
        
        if (typeof event === 'string' || typeof event === 'number') {
            if (event >= 0 && event <=_THIS.$label.months.length) {
                // if: 0-11
                _THIS.$active.month = (event).toString();
            }
        } else {
            // if month is manually selected
            _THIS.$active.month = $(event.currentTarget).data('monthVal');
        }

        if (windowW <= _THIS.$breakpoints.tablet) {
            if(hasSidebar) _THIS.toggleSidebar(false);
        }
        
        _THIS.buildSidebarMonths();
        _THIS.buildCalendar();
        // EVENT FIRED: selectMonth
        $(_THIS.$elements.calendarEl).trigger("selectMonth", [_THIS.initials.dates[_THIS.options.language].months[_THIS.$active.month], _THIS.$active.month])
    };

    // Select specific date
    selectDate = (event) => {
        
        var oldDate = this.$active.date;
        var date, year, month, activeDayEl, isSameDate;

        if (typeof event === 'string' || typeof event === 'number' || event instanceof Date) {
            date = this.formatDate(new Date(event), this.options.format)
            year = new Date(date).getFullYear();
            month = new Date(date).getMonth();
            
            if (this.$active.year !== year) this.selectYear(year);
            if (this.$active.month !== month) this.selectMonth(month);
            activeDayEl = this.$elements.innerEl.find("[data-date-val='" + date + "']");
        } else {
            activeDayEl = $(event.currentTarget);
            date = activeDayEl.data('dateVal')
        }
        isSameDate = this.$active.date === date;
        // Set new active date
        this.$active.date = date;
        this.$active.eventthisdate = date;
        // Remove active class to all
        this.$elements.innerEl.find('[data-date-val]').removeClass('calendar-active');
        // Add active class to selected date
        activeDayEl.addClass('calendar-active');
        // Build event list if not the same date events built
        if (!isSameDate) this.buildEventList();
        // EVENT FIRED: selectDate
        $(this.$elements.calendarEl).trigger("selectDate", [this.$active.date, oldDate])
    };
    
    // Return active date
    getActiveDate = () => {
        return this.$active.date;
    }
    
    // Return active events
    getActiveEvents = () => {
        return this.$active.events;
    }

    // Hide Sidebar/Event List if clicked outside
    toggleOutside = (event) => {

        const hasSidebar = !this.$elements.calendarEl.hasClass('sidebar-hide');
        const hasEvent = !this.$elements.calendarEl.hasClass('event-hide');
        const isInnerClicked = event.target === this.$elements.innerEl[0];

        if (hasSidebar && isInnerClicked) this.toggleSidebar(false);
        if (hasEvent && isInnerClicked) this.toggleEventList(false);
    }

    // Toggle Sidebar
    toggleSidebar = (event) => {
        
        (event === undefined || event.originalEvent)
            ? $(this.$elements.calendarEl).toggleClass('sidebar-hide')
            : event
                ? $(this.$elements.calendarEl).removeClass('sidebar-hide')
                : $(this.$elements.calendarEl).addClass('sidebar-hide')
        
        if (windowWidth <= this.$breakpoints.tablet && windowWidth > this.$breakpoints.mobile) {
            const hasSidebar = !this.$elements.calendarEl.hasClass('sidebar-hide');
            const hasEvent = !this.$elements.calendarEl.hasClass('event-hide');
            if (hasSidebar && hasEvent) this.toggleEventList();
        }
    };

    // Toggle Event list
    toggleEventList = (event) => {
        
        (event === undefined || event.originalEvent)
            ? $(this.$elements.calendarEl).toggleClass('event-hide')
            : event
                ? $(this.$elements.calendarEl).removeClass('event-hide')
                : $(this.$elements.calendarEl).addClass('event-hide')

        if (windowWidth <= this.$breakpoints.tablet && windowWidth > this.$breakpoints.mobile) {
            const hasEvent = !this.$elements.calendarEl.hasClass('event-hide');
            const hasSidebar = !this.$elements.calendarEl.hasClass('sidebar-hide');
            if (hasEvent && hasSidebar) this.toggleSidebar();
        }
    };

    //  Add Calendar Event(s)
    addCalendarEvent = (arr) => {

        const addEvent = (data) => {

            if(!data.id) {
                console.log("%c Event named: \""+data.name+"\" doesn't have a unique ID ", "color:white;font-weight:bold;background-color:#e21d1d;");
            }

            if (data.date instanceof Array) {

                for (var j=0; j < data.date.length; j++) {
                    if(isDateValid(data.date[j])) {
                        data.date[j] = this.formatDate(new Date(data.date[j]), this.options.format);
                    }
                }

            } else {

                if(isDateValid(data.date)) {
                    data.date = this.formatDate(new Date(data.date), this.options.format);
                }
            }
            
            if (!this.options.calendarEvents) this.options.calendarEvents = [];

            this.options.calendarEvents.push(data);
            // add to date's indicator
            this.addEventIndicator(data);
            
            if (this.$active.event_date === data.date) this.addEventList(data);
            // this.$elements.innerEl.find("[data-date-val='" + data.date + "']")

            const isDateValid = (date) => {

                if(this.isValidDate(date)) {
                    return true;
                } else {
                    console.log("%c Event named: \""+data.name+"\" has invalid date ", "color:white;font-weight:bold;background-color:#e21d1d;");
                }
                return false;
            }
        }

        if (arr instanceof Array) { // Arrays of events
            for(var i=0; i < arr.length; i++) {
                addEvent(arr[i])
            }
        } else if (typeof arr === 'object') { // Single event
            addEvent(arr)
        }
    };

    // Remove Calendar Event(s)
    removeCalendarEvent = (arr) => {

        function deleteEvent(data) {
            // Array index
            var index = this.options.calendarEvents.map(function (event) { return event.id }).indexOf(data);
            
            if (index >= 0) {
                var event = this.options.calendarEvents[index];
                // Remove event from calendar events
                this.options.calendarEvents.splice(index, 1);
                // remove to event list
                this.removeEventList(data);
                // remove event indicator
                this.removeEventIndicator(event);
            } else {
                console.log("%c "+data+": ID not found ", "color:white;font-weight:bold;background-color:#e21d1d;");
            }
        }
        if (arr instanceof Array) { // Arrays of index
            for(var i=0; i < arr.length; i++) {
                deleteEvent(arr[i])
            }
        } else { // Single index
            deleteEvent(arr)
        }
    };

    // Check if date is valid
    isValidDate = function(d){
        return new Date(d) && !isNaN(new Date(d).getTime());
    }
}

export default Calendar