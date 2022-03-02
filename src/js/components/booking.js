/* global Handlebars, dataSource */
/* eslint-disable-line no-unused-vars */

import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.tableSelected;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getDate();
  }

  getDate(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);


    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    console.log('params', params);

    const urls = {
      bookings:       settings.db.url + '/' + settings.db.bookings +
                                        '?' + params.bookings.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.events +
                                        '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.events +
                                        '?' + params.eventsRepeat.join('&'),
    };
    console.log('url', urls);
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent,eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent,eventsRepeat){
    const thisBooking = this;
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    thisBooking.booked = {};

    for(let payload of eventsRepeat){
      if(payload.repeat === 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), payload.hour, payload.duration, payload.table);
        }
      }
    }

    for(let payload of eventsCurrent){
      thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
    }

    for(let payload of bookings){
      thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
    }

    console.log(thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] === 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] === 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
    //  console.log('hour', hour);

  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] === 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'
    ){
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tablesAll = document.querySelector(select.booking.floor);
    thisBooking.dom.table = document.querySelector(select.booking.table);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tableSelected = document.querySelector(classNames.booking.tableSelected);
    thisBooking.dom.tableBooked = document.querySelector(classNames.booking.tableBooked);
    thisBooking.dom.duration = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.people = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.adress = document.querySelector(select.booking.adress);
    thisBooking.dom.orderButton = document.querySelector(select.booking.button);
    thisBooking.dom.starters = document.querySelectorAll(select.booking.starters);


  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('click', function(event){
      //console.log('people clicked')
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function(event){
      //console.log('hours clicked')
    });
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.initTables(event);
    });
    thisBooking.dom.tablesAll.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.initTables(event);
    });
    thisBooking.dom.orderButton.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendOrder();
    });
  }

  initTables(event){
    const thisBooking = this;
    const clickedElement = event.target;

    if (clickedElement.classList.contains('table')
    && !clickedElement.classList.contains('booked')
    && !clickedElement.classList.contains(classNames.booking.tableSelected)){
      clickedElement.classList.add(classNames.booking.tableSelected);
      const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
      thisBooking.tableSelected = tableId;
      console.log('click');
      console.log('id', tableId);
    } else {
      clickedElement.classList.remove(classNames.booking.tableSelected);
    }

    for(let table of thisBooking.dom.tables){
      if(table !== clickedElement){
        table.classList.remove(classNames.booking.tableSelected);
      }
    }

    if(clickedElement.classList.contains(classNames.booking.tableBooked)){
      alert('Table is booked!');
    }
  }

  sendOrder(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.dom.datePicker.value,
      hour: thisBooking.dom.hourPicker.value,
      table: thisBooking.tableSelected,
      duration: thisBooking.dom.duration.value,
      ppl: thisBooking.dom.people.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      adress: thisBooking.dom.adress.value,
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(){
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      });

    console.log('thisBooking.booked', thisBooking.booked);
  }
}
export default Booking;
