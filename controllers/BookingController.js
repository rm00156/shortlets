const models = require('../models');
const propertyController = require('../controllers/PropertyController');
const fetch = require('node-fetch');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const Queue = require('bull');
const workerQueue = new Queue('worker', REDIS_URL );
const ical = require('node-ical');

exports.getBookings = async function (req, res) {
    
    var bookingNumber = req.query.bookingNumber;
    var bookedFromDt = req.query.bookedFromDt;
    var bookedToDt = req.query.bookedToDt;
    var checkinFromDt = req.query.checkinFromDt;
    var checkinToDt = req.query.checkinToDt;
    var checkoutFromDt = req.query.checkoutFromDt;
    var checkinToDt = req.query.checkoutToDt;
    var status = req.query.status;

    // var query = ' select pb.id,DATE_FORMAT(pb.purchaseDttm, "%Y-%m-%d %H:%i:%s") as purchaseDttm, pt.type, b.accountFk as accountId, pb.total, pb.orderNumber from purchaseBaskets pb ' +
    //     ' inner join basketItems b on b.purchaseBasketFk = pb.id ' +
    //     ' inner join paymentTypes pt on pb.paymentTypeFk = pt.id ' +
    //     ' where pb.status = :completed ' +
    //     ' and b.id = (select id from basketItems where purchaseBasketFk = pb.id LIMIT 1) '
    // ' and pb.orderNumber like :orderNumber ';
    var query = ' select b.id,b.cost , DATE_FORMAT(b.bookingDttm,"%Y-%m-%d %H:%i:%s") as bookingDttm, DATE_FORMAT(b.fromDt,"%Y-%m-%d %H:%i:%s") as checkinDt,DATE_FORMAT(b.toDt,"%Y-%m-%d %H:%i:%s") as checkoutDt, a.name as customerName, p.name as propertyName from bookings b ' + 
        ' inner join accounts a on b.accountFk = a.id ' + 
        ' inner join properties p on b.propertyFk = p.id ' + 
        ' where b.deleteFl = false ' + 
        ' and b.id like :bookingNumber ' + 
        ' and b.status != :pending ';

    if (bookedFromDt != '')
        query = query + ' and b.bookingDttm >= :bookedFromDt';

    if (bookedToDt != '')
        query = query + ' and b.bookingDttm <= :bookedToDt';

    if (checkinFromDt != '')
        query = query + ' and b.fromDt >= :checkinFromDt';

    if (checkinToDt != '')
        query = query + ' and b.fromDt <= :checkinToDt';
    
    if (checkoutFromDt != '')
        query = query + ' and b.toDt >= :checkoutFromDt';

    if (checkoutToDt != '')
        query = query + ' and b.toDt <= :checkoutToDt';

    if(status != 0)
    {
        query = query + ' and b.status = :status';
        status = status == 1 ? 'Successful' : 'Cancelled'
    }

    var bookings = await models.sequelize.query(query,
        {
            replacements: {
                status: status,
                pending: 'Pending',
                bookedToDt: bookedToDt,
                bookedFromDt:bookedFromDt,
                checkinFromDt:checkinFromDt,
                checkinToDt:checkinToDt,
                checkoutFromDt:checkoutFromDt,
                checkoutToDt:checkoutToDt,
                bookingNumber: '%' + bookingNumber + '%'
            },
            type: models.sequelize.QueryTypes.SELECT
        });
        
    res.json({ result: bookings });
    
}

exports.getBookingHistoryForAccountById = async function(id)
{
    // return await models.sequelize.query('select pb.total, DATE_FORMAT(pb.purchaseDttm, "%Y-%m-%d %H:%i:%s") as purchaseDttm, pb.orderNumber, pb.id from purchaseBaskets pb ' + 
    // ' inner join basketItems b on b.purchaseBasketFk = pb.id ' +
    // ' where pb.status = :completed ' + 
    // ' and b.accountFk = :id ' + 
    // ' and b.id = (select id from basketItems where purchaseBasketFk = pb.id LIMIT 1)' +
    // ' order by pb.purchaseDttm desc',{replacements:{completed:"Completed",id:id},
    // type:models.sequelize.QueryTypes.SELECT});

    return await models.sequelize.query('select b.cost, p.displayImage1, p.name as propertyName, DATE_FORMAT(b.bookingDttm, "%a %b %D %Y") as bookingDttm, b.id from bookings b ' + 
            ' inner join accounts a on b.accountFk = a.id ' + 
            ' inner join properties p on b.propertyFk = p.id ' +
            ' where (b.status = :success or b.status = :cancel) ' + 
            ' and a.id = :id ' +
            ' order by b.bookingDttm desc ',{replacements:{id:id,success:'Successful',cancel:'Cancelled'},type:models.sequelize.QueryTypes.SELECT});
}

exports.getCustomerBooking = async function(req,res)
{
    var bookingId = req.query.id;

    var booking = await models.sequelize.query('select b.cost, p.displayImage1,p.displayImage2,p.displayImage3, p.displayImage4, p.name as propertyName,' + 
    ' DATE_FORMAT(b.bookingDttm, "%Y-%m-%d %H:%i:%s") as bookingDttm,DATE_FORMAT(b.fromDt, "%a %b %D %Y") as formatFromDt, DATE_FORMAT(b.toDt, "%a %b %D %Y") as formatToDt,b.fromDt,b.toDt, b.id as bookingId, ' + 
    ' DATE_FORMAT(b.fromDt, "%W") as fromDay,  DATE_FORMAT(b.fromDt, "%b") as fromMonth,  DATE_FORMAT(b.fromDt, "%D") as fromDate, ' +
    ' DATE_FORMAT(b.toDt, "%W") as toDay,  DATE_FORMAT(b.toDt, "%b") as toMonth,  DATE_FORMAT(b.toDt, "%D") as toDate, ' +
    ' addr.addressLine1, addr.addressLine2, t.name as town, c.name as cityName, addr.postCode ' +
    ' from bookings b ' + 
            ' inner join accounts a on b.accountFk = a.id ' + 
            ' inner join properties p on b.propertyFk = p.id ' +
            ' inner join addresses addr on addr.propertyFk = p.id ' +
            ' inner join cities c on addr.cityFk = c.id ' + 
            ' inner join towns t on addr.townFk = t.id ' +
            ' where (b.status = :success or b.status = :cancel) ' + 
            ' and a.id = :accountId ' + 
            ' and b.id = :bookingId ' +
            ' order by b.bookingDttm desc ',{replacements:{
                success:'Successful',
                cancel:'Cancelled',
                bookingId:bookingId,
                accountId:req.user.id},type:models.sequelize.QueryTypes.SELECT});
    booking = booking[0];

    if(booking == null)
       return res.redirect('/bookingHistory');

    var fromDt = new Date(booking.fromDt);
    var toDt = new Date(booking.toDt);
    const body = await fetch("https://api.postcodes.io/postcodes/" + booking.postCode).then(result => result.json());
    var longitude = body.result.longitude;
    var latitude = body.result.latitude;
    var dayDiff = await propertyController.dateDiff(fromDt, toDt);

    var bookingDttm = new Date(booking.bookingDttm);

    var noCanellations = bookingDttm.setDate(bookingDttm.getDate() + 2)
    var cancel = Date.now() < noCanellations;

    return res.render('customerBooking', {user:req.user,dayDiff:dayDiff,cancel:cancel, booking:booking,latitude:latitude,longitude:longitude});
}

exports.getAdminCustomerBooking = async function(req,res)
{
    var bookingId = req.query.id;

    var booking = await models.sequelize.query('select b.cost, p.displayImage1,p.displayImage2,p.displayImage3, p.displayImage4, p.name as propertyName,' + 
    ' DATE_FORMAT(b.bookingDttm, "%Y-%m-%d %H:%i:%s") as bookingDttm,DATE_FORMAT(b.fromDt, "%a %b %D %Y") as formatFromDt, DATE_FORMAT(b.toDt, "%a %b %D %Y") as formatToDt,b.fromDt,b.toDt, b.id as bookingId, ' + 
    ' DATE_FORMAT(b.fromDt, "%W") as fromDay,  DATE_FORMAT(b.fromDt, "%b") as fromMonth,  DATE_FORMAT(b.fromDt, "%D") as fromDate, ' +
    ' DATE_FORMAT(b.toDt, "%W") as toDay,  DATE_FORMAT(b.toDt, "%b") as toMonth,  DATE_FORMAT(b.toDt, "%D") as toDate, ' +
    ' addr.addressLine1, addr.addressLine2, t.name as town, c.name as cityName, addr.postCode ' +
    ' from bookings b ' + 
            ' inner join accounts a on b.accountFk = a.id ' + 
            ' inner join properties p on b.propertyFk = p.id ' +
            ' inner join addresses addr on addr.propertyFk = p.id ' +
            ' inner join cities c on addr.cityFk = c.id ' + 
            ' inner join towns t on addr.townFk = t.id ' +
            ' where (b.status = :success or b.status = :cancel) ' + 
            // ' and a.id = :accountId ' + 
            ' and b.id = :bookingId ' +
            ' order by b.bookingDttm desc ',{replacements:{
                success:'Successful',
                cancel:'Cancelled',
                bookingId:bookingId},type:models.sequelize.QueryTypes.SELECT});
    booking = booking[0];

    if(booking == null)
       return res.redirect('/bookingHistory');

    var fromDt = new Date(booking.fromDt);
    var toDt = new Date(booking.toDt);
    const body = await fetch("https://api.postcodes.io/postcodes/" + booking.postCode).then(result => result.json());
    var longitude = body.result.longitude;
    var latitude = body.result.latitude;
    var dayDiff = await propertyController.dateDiff(fromDt, toDt);
    console.log(dayDiff);

    return res.render('adminCustomerBooking', {user:req.user,dayDiff:dayDiff, booking:booking,latitude:latitude,longitude:longitude});
}

exports.syncCalendars = async function(req,res)
{
    await workerQueue.add({process:'syncCalendarsTask'});

    // find all propertySyncs
    // each property sync create bookings if doesnt already exist
}

// async function processCalendarSync(propertySync)
// {
//     var url = propertySync.dataValues.url;
//     var webEvents = await ical.async.fromURL(url);
//     var propertyFk = propertySync.propertyFk;

//     for (const webEvent of Object.values(webEvents))
//     {
//         if(webEvent.type != "VEVENT")
//             continue;
//         var start = webEvent.start;
//         var end = webEvent.end;
//         var summary = webEvent.summary;
//         var status;
//         if(summary == 'Reserved')
//         {
//             status = 'Successful';
//         }
//         else if(summary == 'Airbnb (Not available)')
//         {
//             status = 'Unavailable'
//         }
//         else
//         {
//             status = 'Unknown';
//         }

//         var booking = await models.booking.findOne({
//             where:{
//                 propertyFk:propertyFk,
//                 fromDt:start,
//                 toDt:end,
//                 status:status,
//                 deleteFl:false
//             }
//         });

//         if(booking == null)
//         {
//             await models.booking.create({
//                 propertyFk:propertyFk,
//                 accountFk:0,
//                 fromDt:start,
//                 toDt:end,
//                 bookingDttm:new Date(),
//                 guests:0,
//                 nights:0,
//                 cost:0,
//                 status:status,
//                 propertySyncFk:propertySync.id,
//                 deleteFl:false,
//                 versionNo:1
//             })
//         }
//     }
    
        
    // for(var i = 0; i < webEvents.length; i++)
    // {
    //     var webEvent = webEvents[i];

    //     var start = webEvent.start;
    //     var end = webEvent.end;
    //     var summary = webEvent.summary;

    //     if(summary == 'Reserved')
    //     {
    //         var booking = await models.booking.findOne({
    //             where:{
    //                 propertyFk:propertyFk,
    //                 fromDt:start,
    //                 toDt:end,
    //                 status:'Successful',
    //                 deleteFl:false
    //             }
    //         });

    //         if(booking == null)
    //         {
    //             await models.booking.create({
    //                 propertyFk:propertyFk,
    //                 accountFk:0,
    //                 fromDt:start,
    //                 toDt:end,
    //                 bookingDttm:new Date(),
    //                 guests:0,
    //                 nights:0,
    //                 cost:0,
    //                 status:'Successful',
    //                 propertySyncFk:propertySync.id,
    //                 deleteFl:false,
    //                 versionNo:1
    //             })
    //         }
    //     }
    //     else if(summary == 'Airbnb (Not available)')
    //     {

    //     }
    //     console.log(webEvents[i]);
    // }
// }