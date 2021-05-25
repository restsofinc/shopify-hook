const express = require('express')
const bodyParser = require('body-parser');
const getRawBody = require('raw-body');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');
const qs = require('qs')
const app = express()
const url = 'http://repalog.logicwarehouse.net/api/warehouse/apirequest/requestData';


app.use(bodyParser.json({ verify: verify_webhook_request }));
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.get('/', function (req, res) {
  createOrder();
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/test', (req, res) => {
  res.status(200).send('Welcome to plugin');
})

app.post('/webhooks/order/create', async (req, res) => {
  console.log('🎉 We got an order!')
  if (req.custom_shopify_verified) {
    console.log('verify')
     const data = req.body;
     console.log('data',data);

    let order = {};
     order.ordernumber = data.order_number;
    if (data.hasOwnProperty("shipping_address")) {
      order.username = 'TestTest',
      order.password = 'Test#!',
      order.shipto = data.shipping_address.name;
      order.shipaddress = data.shipping_address.address1;
      order.shipstreet = data.shipping_address.address1;
      order.shipcity = data.shipping_address.city;
      order.postcode = data.shipping_address.zip;
      order.countrycode = data.shipping_address.country_code;
    }
    if(data.hasOwnProperty("line_items")){
      let productCode = data['line_items'][0].product_id;
      let quantity = data['line_items'][0].quantity;
      let keys = `${productCode}:${quantity}`;
      order.productcode = [keys];
    }
     order.email = data.email;
     order.servicecode = 'A';

    console.log('order',order);
    createOrder(order);

  } else {
    console.log('not verify')
  }

})

app.listen(process.env.PORT || 4000, () => console.log('Example app listening on port 4000!'))


 function createOrder(data) {

  // let payload = {
  //   username: 'TestTest',
  //   password: 'Test#!',
  //   ordernumber: 1,
  //   shipto: 'John',
  //   shipstreet: 'Street 2 near berlin road ',
  //   shipaddress: 'r-33 testing address',
  //   shipcity: 'Berlin',
  //   postcode: '5677',
  //   countrycode: 'PK',
  //   email: 'test@yopmail.com',
  //   servicecode: 'A'
  //   // productcode:'[2331:5]',
  // }

  const options = {
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' }
  };

  axios.post(url, qs.stringify(data), options)
    .then((response) => {
      console.log('response',response);
      return response;
    }, (error) => {
      console.log('error', error);
    });

}



function verify_webhook(hmac, rawBody) {
  // Retrieving the key
  const key = '3f38052e9fb684815de722c28b633809fc1e11e11124c86d41794229a09f8f4c';
  /* Compare the computed HMAC digest based on the shared secret 
   * and the request contents
  */
  const hash = crypto
    .createHmac('sha256', key)
    .update(rawBody, 'utf8', 'hex')
    .digest('base64');
  return (hmac === hash);
}


function verify_webhook_request(req, res, buf, encoding) {
  if (buf && buf.length) {
    const rawBody = buf.toString(encoding || 'utf8');
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    req.custom_shopify_verified = verify_webhook(hmac, rawBody);
  } else {
    req.custom_shopify_verified = false;
  }
}
