# SmartERP Calendar

## Exmaple

Import on `resource/js/app.js`
```js
import { SmartCalendar } from "@smarterp/calendar"

export default {
    ...
    SmartCalendar
}
```

Then with internal script 

### Simple Javascript
```js
document.addEventListener('DOMContentLoaded', ()=> {
    const element = document.querySelectorAll('#evoCalendar')
    smartCalendar(
        element,
        options
    );
})

```

### Simple JQuery
```js
$(document).ready(function() {
    $('#evoCalendar').smartCalendar(options);
})
```

### Vanilla JS
```js
document.addEventListener('DOMContentLoaded', ()=> {
    const element = document.querySelectorAll('#evoCalendar')
    new SmartCalendar( element, options);
})
```

## Uage Option 

```js
const options = {
    language: 'en', // km
    sidebarDisplayDefault: false,
    calendarEvents: [
        {
            id: '1',
            name: "King Father's Commemoration Day",
            date: "October/15/2023",
            description: "(King Father's Commemoration Day)",
            type: "event",
            everyYear: true,
            color: "red"
        },
        {
            id: '3',
            name: "ថ្ងៃដាក់បិណ្ឌ",
            date: ["september/30/2023", "October/12/2023"],
            description: "ថ្ងៃដាក់បិណ្ឌ",
            type: "event",
            everyYear: true,
            color: "green"
        },
    ]
}
```