var express = require('express');
var router = express.Router();

const stripe = require('stripe')('sk_test_51HQ84jAXaqH2oTbzs6WzzYrmyFALxjsUc5LMZ9qUO5U0xbIrLCQ1IlcDw8HszRZZGLQCkmLkPhXX6U85gAbTlps000GwYlnt4c');

var dataBike = [
  {name:"Lasista", url:"/images/Manolo1.jpeg", price:329},
  {name:"Gerontius", url:"/images/Manolo2.jpeg", price:287},
  {name:"Espanta", url:"/images/Manolo3.jpeg", price:325},
  {name:"Paloma", url:"/images/Manolo4.jpeg", price:477},
  {name:"Bikulu", url:"/images/Manolo5.jpeg", price:501},
  {name:"Zaira", url:"/images/Manolo6.jpeg", price:346},
]


/* GET home page. */
router.get('/', function(req, res, next) {

  if(req.session.dataCardBike == undefined){
    req.session.dataCardBike = []
  }
  
  res.render('index', {dataBike:dataBike});
});

router.get('/shop', function(req, res, next) {

  var alreadyExist = false;

  for(var i = 0; i< req.session.dataCardBike.length; i++){
    if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront){
      req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
      alreadyExist = true;
    }
  }

  if(alreadyExist == false){
    req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: req.query.bikePriceFromFront,
      quantity: 1
    })
  }


  res.render('shop', {dataCardBike:req.session.dataCardBike});
});

router.get('/delete-shop', function(req, res, next){
  
  req.session.dataCardBike.splice(req.query.position,1)

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

router.post('/update-shop', function(req, res, next){
  
  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

router.post('/create-checkout-session', async (req, res) => {
  
  var stripeItems = [];

  for(var i=0;i<req.session.dataCardBike.length;i++){
    stripeItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardBike[i].name,
        },
        unit_amount: req.session.dataCardBike[i].price * 100,
      },
      quantity: req.session.dataCardBike[i].quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: stripeItems,
    mode: "payment",
    success_url: "http://localhost:3000/confirm",
    cancel_url: "http://localhost:3000/",
  });

  res.json({ id: session.id });
});

router.get('/confirm', function(req, res, next){
  res.render('confirm')
})

module.exports = router;
