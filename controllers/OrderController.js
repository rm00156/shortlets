const models = require('../models');
const moment = require('moment');
const propertyController = require('../controllers/PropertyController');
const config = require('../config/config.json');
const env = process.env.NODE_ENV || "development";

var stripe = require('stripe')('sk_test_oocjKxN1BASDuQytDpSoGxuq00eLIkMdHA');
const endpointSecret = 'whsec_fnn7C1Dq14S8Sw3bg4wwh8nHEt85rbOn';
const sequelize = require('sequelize');

exports.placeOrder = async function(req,res)
{
    var propertyId = req.query.propertyId;
    var originalFromDate = (req.query.fromDate);
    var originalToDate = (req.query.toDate);
    var guests = req.query.guests;

    var fromDate = new Date(originalFromDate);
    var toDate = new Date(originalToDate);
    var fromDay = moment(fromDate).format('ddd');
    var fromNumber = moment(fromDate).format('Do');
    var fromMonth = moment(fromDate).format('MMM');
    var fromYear = moment(fromDate).format('YYYY');

    var toDay = moment(toDate).format('ddd');
    var toNumber = moment(toDate).format('Do');
    var toYear = moment(toDate).format('YYYY');
    var toMonth = moment(toDate).format('MMM');

    var dayDiff = await propertyController.dateDiff(fromDate, toDate);
    var property = await models.property.findOne({
        where:{
            id:propertyId
        }
    });

    var totalCost = (parseFloat(property.pricePerDay) * dayDiff).toFixed(2);

    res.render('placeOrder', {user:req.user,property:property,fromDay:fromDay,fromNumber:fromNumber,fromYear:fromYear,fromMonth:fromMonth,
                            toDay:toDay,toNumber:toNumber,toYear:toYear,toMonth:toMonth, dayDiff, totalCost:totalCost, guests:guests, fromDate:originalFromDate, toDate:originalToDate});
}

exports.checkout = async function(req,res)
{
    var fromDate = req.body.fromDate;
    var toDate = req.body.toDate;
    var guests = req.body.guests;
    var propertyId = req.body.propertyId;
    var totalCost = req.body.totalCost;
    var nights = req.body.nights;
    var url = req.body.url;

    if(!url.includes('localhost')
    {
        url = 'https://' + url;
    }
    var property = await models.property.findOne({
        where:{
            id:propertyId
        }
    });

    var lineItems = new Array();
    lineItems.push({name:property.name,amount:parseFloat(totalCost)*100,currency:'gbp',quantity:1});
    
    url = env == 'development' ? config.testUrl : config.prodUrl;

    var booking = await models.booking.create({
        accountFk:req.user.id,
        propertyFk:propertyId,
        fromDt:new Date(fromDate),
        toDt: new Date(toDate),
        guests:guests,
        nights:nights,
        cost:totalCost,
        status:'Pending',
        bookingDttm: Date.now(),
        deleteFl:false,
        versionNo:1
    })
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        customer_email:req.user.email,
         client_reference_id:booking.id,
        success_url: url + '/purchaseSuccessful?guests=' + guests +'&propertyId=' + property.id + '&nights=' + nights + '&totalCost=' + totalCost +
                '&fromDate=' + fromDate + '&toDate=' + toDate +'&booking=' + booking.id,
        cancel_url: url +'/placeOrder',
      });

      res.json({session:session});
}

exports.purchaseSuccessful = async function(req,res)
{
    var booking = req.query.booking;
    var guests = req.query.guests;
    var propertyId = req.query.propertyId;
    var nights = req.query.nights;
    var totalCost = req.query.totalCost;
    var originalFromDate = req.query.fromDate;
    var originalToDate = req.query.toDate;

    var fromDate = new Date(originalFromDate);
    var toDate = new Date(originalToDate);
    var fromDay = moment(fromDate).format('ddd');
    var fromNumber = moment(fromDate).format('Do');
    var fromMonth = moment(fromDate).format('MMM');
    var fromYear = moment(fromDate).format('YYYY');

    var toDay = moment(toDate).format('ddd');
    var toNumber = moment(toDate).format('Do');
    var toYear = moment(toDate).format('YYYY');
    var toMonth = moment(toDate).format('MMM');

    var property = await models.property.findOne({
        where:{
            id:propertyId
        }
    });
    res.render('purchaseSuccessful',{user:req.user,guests:guests,property:property,dayDiff:nights,totalCost:totalCost,
                        fromDay:fromDay,fromNumber:fromNumber, fromMonth:fromMonth,fromYear:fromYear,
                        toDay:toDay,toYear:toYear,toNumber:toNumber,toMonth:toMonth,booking:booking});
}

exports.stripeSessionCompleted = async function(req,res)
{
  const sig = req.headers['stripe-signature'];

  var event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
      console.log(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;
  await models.booking.update({
      status:'Successful',
      versionNo:sequelize.literal('versionNo + 1')
  },{
      where:{
          id:session.client_reference_id
      }
  });
//   var purchaseBasket = await paymentController.getPurchaseBasketById(session.client_reference_id);
//   await paymentController.completePurchase(purchaseBasket.id);
//   await workerQueue.add({process:'sendPurchaseInvoice',purchaseBasketId:purchaseBasket.id});
  res.json({received: true});

}