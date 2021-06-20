const throng = require('throng');
const Queue = require("bull");
const models = require('./models');
// const basketController = require('./controllers/BasketController');
// const productController = require('./controllers/ProductController');
// const sizeQuantityController = require('./controllers/SizeQuantityController');
// const orderController = require('./controllers/OrderController');
// const checkoutController = require('./controllers/CheckoutController');
const hbs = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const nodeMailer = require('nodemailer');
const config = require('./config/config.json');
const moment = require('moment');
const sequelize = require('sequelize');
const ical = require('node-ical');

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const env = process.env.NODE_ENV || "development";
const urlPrefix = env == 'development' ? 'http://localhost:2000' : config.website;
// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
const workers = process.env.WEB_CONCURRENCY || 2;

// The maxium number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 50;

// var smtpTransport = nodeMailer.createTransport({
//     host:config.mailServer_host,
//     port:587,
//     secure:false,
//     auth:{
//       user:config.mailServer_email,
//       pass:config.mailServer_password
//     }
// });

const compile = async function(templateName, data)
{
  const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
  const html = await fs.readFile(filePath,'utf-8');
  return hbs.compile(html)(data);
}

hbs.registerHelper('dateFormat', (value,format)=>{
  console.log('formatting', value, format);
  return moment(value).format(format);
});

const start = function() {
    // Connect to the named work queue
    let workerQueue = new Queue('worker', REDIS_URL );
  
  workerQueue.process(maxJobsPerWorker, async (job) => {

    if(job.data.process == 'syncCalendarsTask')
    {
        await syncCalendarsTask();
    }
//     else if(job.data.process == 'checkoutSessionCleanUpTask')
//     {
//         await checkoutSessionStockCleanUpTask();
//     }
//     else if(job.data.process == 'sendPurchaseInvoice')
//     {
//         await sendPurchaseInvoice(job.data.purchaseBasketId);
//     }
//     else if(job.data.process == 'registrationEmail')
//     {
//         await sendRegistrationEmail(job.data.email);
//     }
//     else if(job.data.process == 'clearCookiesAfterTimeout')
//     {
//         await clearCookiesAfterTimeout();
//     }
//     else if(job.data.process == 'closeAccountEmail')
//     {
//         await closeAccountEmail(job.data.email);
//     }
//     else if(job.data.process == 'resetEmail')
//     {
//         await sendResetEmail(job.data.email);
//     }
  })
}

// async function checkoutPurchasWindow(orderId,basketItemIds,paymentTypeId)
// {
//      // what am i trying to achieve
//         // im trying to make sure that in the instance a user is in a checkout and in between the server and worker
//         // are restarted, we want to make sure that if the task that sets the timer for 15 minutes wasnt completed or, 
//         // to rerun the task for 15 minutes if the result for whether the session is still open is true, otherwise if the session is closed
//         // and the nothing was captured we restock the basket items, otherwise we do nothing

//     await forEachCheckoutSessionStockBasketItem(basketItemIds, orderId, paymentTypeId, createCheckoutSessionStock);
// }

// async function forEachCheckoutSessionStockBasketItem(array, orderId, paymentTypeId,callback)
// {
//     var date = Date.now();
//     for(var i = 0; i < array.length; i++)
//     {
//         await callback(array[i], orderId,paymentTypeId,date);
//     }
// }

// async function createCheckoutSessionStock(basketItemId,orderId,paymentTypeId,date)
// {
//     // console.log(basketItemId);
//     // console.log(orderId);
//     // console.log(paymentTypeId);
//     // console.log(date);
//     var checkoutSessionStock = await models.checkoutSessionStock.create({
//         createdDttm:date,
//         orderId:orderId,
//         basketItemFk:basketItemId,
//         paymentTypeFk:paymentTypeId,
//         deleteFl:false,
//         versionNo:1
//     });

//     // var basketItem = await basketController.getBasketItemById(basketItemId);
//     // need to do something to add/edit product page to prevent duplicate colors being set for a product

//     // getproductDetailsForBasketItemById
//     var productDetails = await productController.getProductDetailsForBasketItemById(basketItemId);
//                         // should only ever be on value
//     var size = productDetails.size;
//     var basketQuantity = productDetails.basketQuantity;
//     console.log('size ' + size);
//     if(size == null)
//     {
//         // means we just need quantity
//         await productController.minusQuantityOfProductDetailsById(productDetails.id,basketQuantity);

//     }
//     else
//     {
//         // need to update
//         await sizeQuantityController.minusSizeQuantityByIdAndSize(productDetails.sizeQuantityFk,size,basketQuantity);
//     }
                   
//     console.log('Starting 15 minutes countdown for checkout session with id ' + checkoutSessionStock.id);
//     setTimeout(function() {
//         set15MinuteWindowToCompletePurchase(checkoutSessionStock.id);
//     }, 15*60000);

// }


// async function sendPurchaseInvoice(purchaseBasketId)
// {
//     var basketItems = await orderController.getOrderById(purchaseBasketId);

//     await basketController.forEachBasketItemGetColor(basketItems);
//     var basketItem = basketItems[0];
    
    
//     var color = basketItem.color == null ? 'N/A' : basketItem.color;
//     var size = basketItem.color == null ? 'N/A' : basketItem.size;
//     var displayAddressLine2 = (basketItem.addressLine2 == null || basketItem.addressLine2 == '') ? false : true;
//     var data = {basketItems:basketItems, orderNumber:basketItem.orderNumber,
//       addressLine1:basketItem.addressLine1,addressLine1:basketItem.addressLine1,
//       city:basketItem.city,postCode:basketItem.postCode,country:basketItem.country,
//       purchaseDttm:basketItem.purchaseDttm,email:basketItem.email,subTotal:basketItem.subTotal,
//       delivery:basketItem.delivery,deliveryCost:basketItem.deliveryCost,total:basketItem.total,
//       fullName:basketItem.fullName,size:size,color:color,
//     displayAddressLine2:displayAddressLine2};

//     const content = await compile('purchaseEmail', data);

//     var mailOptions = {
//         from:config.mailServer_email,
//         to: basketItems[0].email,
//         subject:'Reggae Masters - Purchase Successful',
//         html: content
//         }
    
//     smtpTransport.sendMail(mailOptions,function(errors,res){
        
//         // createEmail('Noticed No Purchase After Sign Up',errors,account.id);
//         console.log(errors);
//         console.log(res);
//         mailOptions['to'] = config.mailServer_email;
//         smtpTransport.sendMail(mailOptions,function(errors,res){
//             console.log(errors);
//             console.log(res);
//         })
        
//     })
// }

// async function sendRegistrationEmail(email)
// {
//     const content = await compile('registerEmail', {});
//     var mailOptions = {
//         from:config.mailServer_email,
//         to: email,
//         subject:'Reggae Masters - Thank you for Registering',
//         html: content
//         }
    
//     smtpTransport.sendMail(mailOptions,function(errors,res){
        
//         // createEmail('Noticed No Purchase After Sign Up',errors,account.id);
//         console.log(errors);
//         console.log(res);
//         mailOptions['to'] = config.mailServer_email;
//         smtpTransport.sendMail(mailOptions,function(errors,res){
//             console.log(errors);
//             console.log(res);
//         })
//     })
// }

// async function set15MinuteWindowToCompletePurchase(checkoutSessionStockId)
// {
//     console.log('15 minute window is over for session id ' + checkoutSessionStockId)
//     await checkoutController.cancelCheckOutSessionById(checkoutSessionStockId);
// }


// async function checkoutSessionStockCleanUpTask() 
// {
//     var date = Date.now();
//     var minutes = 15;
//     var createdDttm = new Date(date - (minutes * 60000));
//     var checkoutSessionStockToBeCleanedUp = await models.sequelize.query('select * from checkoutSessionStocks ' + 
//                         ' where createdDttm < :createdDttm ', {replacements:{createdDttm:createdDttm},type:models.sequelize.QueryTypes.SELECT});
    
//     console.log('Running Clean Up CheckoutSessionStock Task:  ' + checkoutSessionStockToBeCleanedUp.length + ' to clean up');
//     for( var i = 0; i < checkoutSessionStockToBeCleanedUp.length; i++)
//     {
//         var checkoutSessionStock = checkoutSessionStockToBeCleanedUp[i];
//         await checkoutController.cancelCheckOutSessionById(checkoutSessionStock.id);
//     }
// }

// async function clearCookiesAfterTimeout()
// {
//     var query = ' select c.id from cookiePermissions c ' + 
//                 ' inner join accounts a on c.accountFk = a.id ' + 
//                 ' where c.createdDttm < date_add(curdate(), interval - 7 day) ' + 
//                 ' and a.dummyFl = true ';
    
//     var deleteIds = await models.sequelize.query(query,{type:models.sequelize.QueryTypes.SELECT});

//     await models.cookiePermission.destroy({
//         where :{
//             id:deleteIds
//         }
//     });
// }

// async function closeAccountEmail(email)
// {
//     const content = await compile('cancelAccountEmail', {});
//     var mailOptions = {
//         from:config.mailServer_email,
//         to: email,
//         subject:'Reggae Masters - Sorry to see you leave',
//         html: content
//         }
    
//     smtpTransport.sendMail(mailOptions,function(errors,res){
        
//         // createEmail('Noticed No Purchase After Sign Up',errors,account.id);
//         console.log(errors);
//         console.log(res);
//         mailOptions['to'] = config.mailServer_email;
//         smtpTransport.sendMail(mailOptions,function(errors,res){
//             console.log(errors);
//             console.log(res);
//         })
        
//     })
// }

// async function sendResetEmail(email)
// {
//     console.log(email);
//    var resetEmail = await models.resetEmail.findOne({
//         where:{
//           email:email,
//           deleteFl:false
//         }
//     });

//     var now = Date.now();
//     var hourLater = now + 60*60*1000;
//     var link = urlPrefix + '/resetPassword?email='+email;
//     var data = {now:now,hourLater:hourLater,link:link};

//     if(resetEmail == null)
//     {
//         await models.resetEmail.create({
//             fromDttm:now,
//             toDttm:hourLater,
//             email:email,
//             usedFl:false,
//             deleteFl:false,
//             versionNo:1
//         });
//     }
//     else
//     {
//         await resetEmail.update({
//             fromDttm:now,
//             toDttm:hourLater,
//             usedFl:false,
//             versionNo:sequelize.literal('versionNo + 1')
//         })
//     }
    
//     const content = await compile('resetEmail', data);
//     var mailOptions = {
//         from:config.mailServer_email,
//         to: email,
//         subject:'Reggae Masters - Reset your Email',
//         html: content
//         }
    
//     smtpTransport.sendMail(mailOptions,function(errors,res){
        
//         // createEmail('Noticed No Purchase After Sign Up',errors,account.id);
//         console.log(errors);
//         console.log(res);
//     })
// }

async function syncCalendarsTask()
{
    var propertySyncs = await models.propertySync.findAll({
        where:{
            deleteFl:false
        }
    });

    for( var i = 0; i < propertySyncs.length; i++ )
    {
        var propertySync = propertySyncs[i];
        await processCalendarSync(propertySync);
    }
}

async function processCalendarSync(propertySync)
{
    var url = propertySync.dataValues.url;
    var webEvents = await ical.async.fromURL(url);
    var propertyFk = propertySync.propertyFk;

    for (const webEvent of Object.values(webEvents))
    {
        if(webEvent.type != "VEVENT")
            continue;
        var start = webEvent.start;
        var end = webEvent.end;

        start = moment(start).utcOffset(0);
        start.set({hour:0,minute:0,second:0,millisecond:0});
        start.toISOString();
        start.format();


        end = moment(end).utcOffset(0);
        end.set({hour:0,minute:0,second:0,millisecond:0});
        end.toISOString();
        end.format();

        var summary = webEvent.summary;
        var status;
        if(summary == 'Reserved')
        {
            status = 'Successful';
        }
        else if(summary == 'Airbnb (Not available)')
        {
            status = 'Unavailable'
        }
        else
        {
            status = 'Unknown';
        }

        var booking = await models.booking.findOne({
            where:{
                propertyFk:propertyFk,
                fromDt:start,
                toDt:end,
                status:status,
                deleteFl:false
            }
        });

        if(booking == null)
        {
            await models.booking.create({
                propertyFk:propertyFk,
                accountFk:0,
                fromDt:start,
                toDt:end,
                bookingDttm:new Date(),
                guests:0,
                nights:0,
                cost:0,
                status:status,
                propertySyncFk:propertySync.id,
                deleteFl:false,
                versionNo:1
            })
        }
    }
}
throng({ workers, start });