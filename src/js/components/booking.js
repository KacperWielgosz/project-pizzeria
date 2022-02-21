/* global Handlebars, dataSource */
/* eslint-disable-line no-unused-vars */

import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.peopleAmount.addEventListener('click', function(event){
      //console.log('people clicked')
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function(event){
      //console.log('hours clicked')
    });
  }
}
export default Booking;
