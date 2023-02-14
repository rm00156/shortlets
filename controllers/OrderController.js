const models = require('../models');
const moment = require('moment');
const propertyController = require('../controllers/PropertyController');
const bookingController = require('../controllers/BookingController');
const config = require('../config/config.json');
const env = process.env.NODE_ENV || "development";

var stripe = require('stripe')('sk_test_oocjKxN1BASDuQytDpSoGxuq00eLIkMdHA');
const endpointSecret = 'whsec_fnn7C1Dq14S8Sw3bg4wwh8nHEt85rbOn';
const sequelize = require('sequelize');

exports.placeOrder = async function (req, res) {
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
        where: {
            id: propertyId
        }
    });

    var totalCost = (parseFloat(property.pricePerDay) * dayDiff).toFixed(2);

    res.render('placeOrder', {
        user: req.user, property: property, fromDay: fromDay, fromNumber: fromNumber, fromYear: fromYear, fromMonth: fromMonth,
        toDay: toDay, toNumber: toNumber, toYear: toYear, toMonth: toMonth, dayDiff, totalCost: totalCost, guests: guests, fromDate: originalFromDate, toDate: originalToDate
    });
}

exports.checkout = async function (req, res) {
    var fromDate = new Date(req.body.fromDate);
    var toDate = new Date(req.body.toDate);
    var guests = req.body.guests;
    var propertyId = req.body.propertyId;
    var totalCost = req.body.totalCost;
    var nights = req.body.nights;
    var url = req.body.url;

    // var momentFromDate = moment(fromDate).utcOffset(0);
    // momentFromDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    // momentFromDate.toISOString();
    // momentFromDate.format();


    // var momentToDate = moment(toDate).utcOffset(0);
    // momentToDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    // momentToDate.toISOString();
    // momentToDate.format();

    // console.log(fromDate);
    // console.log(toDate);
    // console.log(guests);
    // console.log(propertyId);
    // console.log(totalCost);
    // console.log(nights);
    // console.log(url);
    // if(!url.includes('localhost'))
    // {
    //     url = 'https://' + url;
    // }
    var property = await models.property.findOne({
        where: {
            id: propertyId
        }
    });

    console.log(totalCost);

    var lineItems = new Array();
    lineItems.push({ name: property.name, amount: ((parseFloat(totalCost)).toFixed(2) * 100), currency: 'gbp', quantity: 1 });

    url = env == process.env.url;

    var confirmationCode = await generateNewConfirmationCode();

    var booking = await models.booking.create({
        accountFk: req.user.id,
        propertyFk: propertyId,
        fromDt: fromDate,
        toDt: toDate,
        guests: guests,
        nights: nights,
        cost: totalCost,
        status: 'Pending',
        bookingDttm: Date.now(),
        confirmationCode:confirmationCode,
        deleteFl: false,
        versionNo: 1
    });

    console.log(booking);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        customer_email: req.user.email,
        client_reference_id: booking.id,
        success_url: url + '/purchaseSuccessful?guests=' + guests + '&propertyId=' + property.id + '&nights=' + nights + '&totalCost=' + totalCost +
            '&fromDate=' + fromDate + '&toDate=' + toDate + '&booking=' + booking.id,
        cancel_url: url + '/placeOrder',
    });

    await bookingController.updateBookingPaymentProcessorId(session.payment_intent, booking.id);
    console.log(session);

    res.json({ session: session });
}

exports.purchaseSuccessful = async function (req, res) {
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
        where: {
            id: propertyId
        }
    });
    res.render('purchaseSuccessful', {
        user: req.user, guests: guests, property: property, dayDiff: nights, totalCost: totalCost,
        fromDay: fromDay, fromNumber: fromNumber, fromMonth: fromMonth, fromYear: fromYear,
        toDay: toDay, toYear: toYear, toNumber: toNumber, toMonth: toMonth, booking: booking
    });
}

exports.stripeSessionCompleted = async function (req, res) {
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
        status: 'Successful',
        versionNo: sequelize.literal('versionNo + 1')
    }, {
            where: {
                id: session.client_reference_id
            }
        });
    //   var purchaseBasket = await paymentController.getPurchaseBasketById(session.client_reference_id);
    //   await paymentController.completePurchase(purchaseBasket.id);
    //   await workerQueue.add({process:'sendPurchaseInvoice',purchaseBasketId:purchaseBasket.id});
    res.json({ received: true });

}

async function generateNewConfirmationCode() {

    var result = 'HYDE-';
    var characters = '23456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    var booking = await models.booking.findOne({
        where:{
            confirmationCode:result
        }
    });

    if(booking == null)
        return result;
    
    return await generateNewConfirmationCode();
}

exports.refund = async function(req,res)
{
    var bookingId = req.body.bookingId;
    var refundType = req.body.refundType;
    var refundAmount = req.body.refundAmount;

    var booking = await bookingController.getBookingById(bookingId);

    var errorMessage = 'There was an issue with attempting to make a refund. Either try again or login into your stripe account for more details'
    var result = await refundStripePayment(booking,refundAmount);
        
    if(result.err)
        return res.json({err:errorMessage});
    
    var refundType = await models.refundType.findOne({
        where:{
            id:refundType
        }
    });

    await createRefund(booking, refundAmount, refundType.id);
    return res.json({});
}

async function createRefund(booking,amount,refundTypeId)
{
    await models.refund.create({
        refundTypeFk:refundTypeId,
        createdDttm:Date.now(),
        amount:amount,
        bookingFk:booking.id,
        deleteFl:false,
        versionNo:1
    });
}


exports.getYourInvoice = async function(req,res)
{
    var bookingId = req.query.bookingId;

    var booking = await bookingController.getBookingForCustomer(bookingId,req.user);
    
    res.render('yourInvoice',{user:req.user,booking:booking});

}

async function refundStripePayment(booking,refundAmount)
{
  refundAmount = parseFloat(refundAmount) * 100;
  return await stripe.refunds.create({
    payment_intent: booking.paymentProcessorOrderId,
    amount:refundAmount
  }).then(()=> {
    
      return {};
  }).catch(err=>{
    console.log(err);
    
    return {err:err};
  })
}

