import $ from './jquery.js';
import { Calendar } from "./calendar.js";
/**
 * Calling Calendar as Function and Support JQuery Syntax,
 * Convert Class to Function
 *
 * @param {HTMLElement} this
 * @param {IArguments} arguments
 *
 * @example $(elements).smartCalendar(options)
 */
$.fn.smartCalendar = function () {
    Array.from(this).map(element => {
        if (typeof arguments[0] == 'object' || typeof arguments[0] == 'undefined') {
            return new Calendar(element, arguments[0]);
        }
        else {
            console.log('option must be object');
        }
    });
};
/**
 * Calling Calendar as Function,
 * Convert Class to Function

 *
 * @example smartCalendar(elements, options)
 */
export const smartCalendar = (elements, options = {}) => {
    Array.from(elements).map(element => {
        if (typeof options == 'object' || typeof options == 'undefined') {
            return new Calendar(element, options);
        }
        else {
            console.log('option must be object');
        }
    });
};
/**
 * Calling Calendar as Function,
 * Convert Class to Function

 *
 * @example smartCalendar(elements, options)
 */
export const calendar = (elements, options = {}) => {
    Array.from(elements).map(element => {
        if (typeof options == 'object' || typeof options == 'undefined') {
            return new Calendar(element, options);
        }
        else {
            console.log('option must be object');
        }
    });
};
/**
 * Calling Calendar as Class
 *
 * @constructor {HTMLElement} elements
 * @constructor {Object} options
 *
 *
 * @example new Calendar(elements, options)
 */
export const SmartCalendar = Calendar;
if (typeof window !== "undefined") {
    window.smartCalendar = smartCalendar;
    window.calendar = calendar;
    window.SmartCalendar = SmartCalendar;
}
