const express = require('express')
const bodyParser = require('body-parser');
const getRawBody = require('raw-body')
const crypto = require('crypto')
const secretKey = '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'
var request = require('request');
const app = express()


app.use(bodyParser.json({ verify: verify_webhook_request }));
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.post('/webhooks/order/create', async (req, res) => {
  console.log('🎉 We got an order!')
  if(req.custom_shopify_verified){
      console.log('verify')
  }else{
    console.log('not verify')
  }
  
  // const theData = req.body;
  // console.log('data',theData);
  //createOrder();
  // We'll compare the hmac to our own hash
  // const hmac = req.get('X-Shopify-Hmac-Sha256')
  // console.log('hmac', hmac);
  // // Use raw-body to get the body (buffer)
  // const body = await getRawBody(req)

  // console.log('body', body);
  // Create a hash using the body and our key
  // const hash = crypto
  //   .createHmac('sha256', secretKey)
  //   .update(body, 'utf8', 'hex')
  //   .digest('base64')

  // console.log('hash', hash);
  // // Compare our hash to Shopify's hash
  // if (hash === hmac) {
  //   // It's a match! All good
  //   console.log('Phew, it came from Shopify!')
  //   res.sendStatus(200)
  // } else {
  //   // No match! This request didn't originate from Shopify
  //   console.log('Danger! Not from Shopify!')
  //   res.sendStatus(403)
  // }

  //res.sendStatus(200)
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))


function createOrder(data) {

  let payload = {
    username: 'TestTest',
    password:'Test#!',
    ordernumber: 1,
    shipto: 'John',
    shipstreet: 'Street 2 near berlin road ',
    shipaddress: 'r-33 testing address',
    shipcity: 'Berlin',
    postcode: '5677',
    countrycode: 'PK',
    email : 'test@yopmail.com',
    servicecode: 'A',
    productcode:'[2331:5]',
  }

  console.log('calling api')
  request.post('http://warehouse.dpost.be/api/warehouse/apirequest/requestData', function (error, response, payload) {
    if (!error && response.statusCode == 200) {
        console.log('sucss',response);
        // console.log('error',error) // Print the google web page.
     }
})

}



function verify_webhook(hmac, rawBody) {
  // Retrieving the key
  const key = 'a918ea34b4d95f724245db87eaf96db11ecdfaf7a4f0b78510961a87bc230e78';
  /* Compare the computed HMAC digest based on the shared secret 
   * and the request contents
  */
  const hash = crypto
        .createHmac('sha256', key)
        .update(rawBody, 'utf8', 'hex')
        .digest('base64');
  return(hmac === hash);
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