import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from '../components/cartProduct.js';
import utils from '../utils.js';

class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    //thisCart.add();
    //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element; 

    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
    thisCart.dom.form = element.querySelector(select.cart.form);
    thisCart.dom.phone = element.querySelector(select.cart.phone);
    thisCart.dom.adress = element.querySelector(select.cart.adress);
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault;
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      adress: thisCart.dom.adress,
      phone: thisCart.dom.phone,
      totalPrice: thisCart.dom.totalPrice,
      subtotalPrice: thisCart.dom.subtotalPrice,
      totalNumber: thisCart.dom.totalNumber,
      deliveryFee: thisCart.dom.deliveryFee,
      products: []
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
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
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);
      });
  }

  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  update(){
    const thisCart = this;
    thisCart.deliveryFee = 20;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for (const product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    if (thisCart.totalNumber === 0){
      thisCart.deliveryFee = 0;
      thisCart.totalPrice = 0;
    } else {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }

    for (let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
  }

  remove(removedProduct){
    const thisCart = this;
    const indexRemove = thisCart.products.indexOf(removedProduct);
    thisCart.products.splice(indexRemove, 1);
    removedProduct.dom.wrapper.remove();
    //console.log(removedProduct.dom.wrapper);
    thisCart.update();
  }
}

export default Cart;
