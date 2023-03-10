const models = require('../models');
const propertyController = require('../controllers/PropertyController');
const fetch = require('node-fetch');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const Queue = require('bull');
const workerQueue = new Queue('worker', REDIS_URL );
const ical = require('node-ical');
const moment = require('moment');
const sequelize = require('sequelize');

exports.getBookings = async function (req, res) {
    
    var bookingNumber = req.query.bookingNumber;
    var bookedFromDt = req.query.bookedFromDt;
    var bookedToDt = req.query.bookedToDt;
    var checkinFromDt = req.query.checkinFromDt;
    var checkinToDt = req.query.checkinToDt;
    var checkoutFromDt = req.query.checkoutFromDt;
    var checkinToDt = req.query.checkoutToDt;
    // var status = req.query.status;

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

    // if(status != 0)
    // {
    //     query = query + ' and b.status = :status';
    //     status = status == 1 ? 'Successful' : 'Cancelled'
    // }

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

    var booking = await getBookingForCustomer(bookingId,req.user.id);

    if(booking == null)
       return res.redirect('/bookingHistory');

    var fromDt = new Date(booking.fromDt);
    var toDt = new Date(booking.toDt);
    const body = await fetch("https://api.postcodes.io/postcodes/" + booking.postCode).then(result => result.json());
    var longitude = body.result.longitude;
    var latitude = body.result.latitude;
    var dayDiff = await propertyController.dateDiff(fromDt, toDt);

    const bookingDttm = new Date(booking.bookingDttm);
    bookingDttm.setUTCHours(24);

    var cancellationDate = bookingDttm;
    cancellationDate = (moment(cancellationDate).add(2,'day')).toDate();
    var bookingFromDttm = (moment(fromDt).add(15,'hour')).toDate();
    bookingFromDttm.setUTCHours(24);
    console.log(bookingFromDttm)
    // console.log(noCanellations);
    var now = Date.now();
    var cancel = now < cancellationDate && now < bookingFromDttm && booking.deleteFl == false;
    var propertyAmenities = await propertyController.getPropertyAmenitiesForPropertyId(booking.propertyId);
    var refunds = await getRefundsForBookingId(bookingId);
    return res.render('customerBooking', {user:req.user,propertyAmenities:propertyAmenities, dayDiff:dayDiff,cancel:cancel, 
        booking:booking,latitude:latitude,longitude:longitude,refunds:refunds});
}

async function getBookingForCustomer(bookingId,user)
{
    var query = 'select b.cost, p.displayImage1,p.displayImage2,p.displayImage3, p.displayImage4,p.displayImage5,p.displayImage6,p.displayImage7,p.displayImage8, p.name as propertyName,' + 
    ' DATE_FORMAT(b.bookingDttm, "%Y-%m-%d %H:%i:%s") as bookingDttm,DATE_FORMAT(b.fromDt, "%a %b %D %Y") as formatFromDt, DATE_FORMAT(b.toDt, "%a %b %D %Y") as formatToDt,b.fromDt,b.toDt, b.id as bookingId, ' + 
    ' DATE_FORMAT(b.fromDt, "%W") as fromDay,  DATE_FORMAT(b.fromDt, "%b") as fromMonth,  DATE_FORMAT(b.fromDt, "%D") as fromDate, ' +
    ' DATE_FORMAT(b.toDt, "%W") as toDay,  DATE_FORMAT(b.toDt, "%b") as toMonth,  DATE_FORMAT(b.toDt, "%D") as toDate, a.name as customerName, ' +
    ' addr.addressLine1, addr.addressLine2, t.name as town, c.name as cityName, addr.postCode, p.id as propertyId,b.confirmationCode,b.guests, b.deleteFl ' +
    ' from bookings b ' + 
            ' inner join accounts a on b.accountFk = a.id ' + 
            ' inner join properties p on b.propertyFk = p.id ' +
            ' inner join addresses addr on addr.propertyFk = p.id ' +
            ' inner join cities c on addr.cityFk = c.id ' + 
            ' inner join towns t on addr.townFk = t.id ' +
            ' where (b.status = :success or b.status = :cancel) ' + 
            ' and b.id = :bookingId ';

    if(user.accountTypeFk == 2)
        query = query + ' and a.id = :accountId ';

    query = query +  ' order by b.bookingDttm desc ';


    var booking = await models.sequelize.query(query,{replacements:{
                success:'Successful',
                cancel:'Cancelled',
                bookingId:bookingId,
                accountId:user.id},type:models.sequelize.QueryTypes.SELECT});
    return booking[0];
}

exports.getBookingForCustomer = async function(bookingId,user)
{
    return await getBookingForCustomer(bookingId,user);
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

    // await syncCalendarsTask();
}


function convertDateToUTC(date) { 
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())); 
}

exports.cancelBooking = async function(req,res)
{
    var bookingId = req.body.bookingId;
    var cancelledDttm = Date.now();
    cancelledDttm.setUTCHours(24);
    await models.booking.update({
        deleteFl:true,
        cancelledDttm:cancelledDttm,
        versionNo:sequelize.literal('versionNo + 1')
    },{
        where:{
            id:bookingId
        }
    });

    res.json({});
}

exports.updateBookingPaymentProcessorId = async function (paymentIntent, bookingId)
{
    await models.booking.update({
        paymentProcessorOrderId:paymentIntent,
        versionNo:sequelize.literal('versionNo + 1')
    },{
        where:{
            id:bookingId
        }
    });
}

exports.getBookingById = async function(id)
{
    return await getBookingById(id);
}

async function getBookingById(id)
{
    return await models.booking.findOne({
        where:{
            id:id
        }
    })
}

async function displayRefundButtonForBookingId(id)
{
    var booking = getBookingById(id);
    var refundsTotal = await getRefundTotalForBookingId(id);

    var total = parseFloat(booking.cost) - parseFloat(refundsTotal);
    total = total.toFixed(2);

    return (total != 0.00);
}

async function getRefundTotalForBookingId(id)
{
    var amount = await models.sequelize.query('select sum(amount) as amount from refunds r ' +
    ' where r.bookingFk = :bookingId ',
    {replacements:{bookingId:id},type:models.sequelize.QueryTypes.SELECT});
    return amount[0].amount;
}

exports.getBooking = async function (req, res) {
    var bookingId = req.query.id;

    var booking = await models.sequelize.query('select b.cost, p.displayImage1,p.displayImage2,p.displayImage3, p.displayImage4, p.name as propertyName,' +
        ' DATE_FORMAT(b.bookingDttm, "%a %b %D %Y") as bookingDttm,DATE_FORMAT(b.fromDt, "%a %b %D %Y") as formatFromDt, DATE_FORMAT(b.toDt, "%a %b %D %Y") as formatToDt,b.fromDt,b.toDt, b.id as bookingId, ' +
        ' DATE_FORMAT(b.fromDt, "%W") as fromDay,  DATE_FORMAT(b.fromDt, "%b") as fromMonth,  DATE_FORMAT(b.fromDt, "%D") as fromDate, ' +
        ' DATE_FORMAT(b.toDt, "%W") as toDay,  DATE_FORMAT(b.toDt, "%b") as toMonth,  DATE_FORMAT(b.toDt, "%D") as toDate, b.guests, ' +
        ' DATE_FORMAT(b.bookingDttm, "%W") as bookingDay,  DATE_FORMAT(b.bookingDttm, "%b") as bookingMonth,  DATE_FORMAT(b.bookingDttm, "%D") as bookingDate, DATE_FORMAT(b.bookingDttm, "%l:%i %p") as bookingTime ,b.confirmationCode, a.id as accountId, ' +
        ' addr.addressLine1, addr.addressLine2, t.name as town, c.name as cityName, addr.postCode, a.name as customerName, b.status,b.propertySyncFk ' +
        ' from bookings b ' +
        ' inner join accounts a on b.accountFk = a.id ' +
        ' inner join properties p on b.propertyFk = p.id ' +
        ' inner join addresses addr on addr.propertyFk = p.id ' +
        ' inner join cities c on addr.cityFk = c.id ' +
        ' inner join towns t on addr.townFk = t.id ' +
        ' where  b.id = :bookingId ' +
        ' order by b.bookingDttm desc ', {
            replacements: {
                bookingId: bookingId
            }, type: models.sequelize.QueryTypes.SELECT
        });
    booking = booking[0];

    // deal with this later
    // if(booking == null)
    //    return res.redirect('/bookingHistory');

    var fromDt = new Date(booking.fromDt);
    var toDt = new Date(booking.toDt);
    const body = await fetch("https://api.postcodes.io/postcodes/" + booking.postCode).then(result => result.json());
    var longitude = body.result.longitude;
    var latitude = body.result.latitude;
    var dayDiff = await propertyController.dateDiff(fromDt, toDt);
    console.log(dayDiff);

    var propertySync = null;
    if (booking.propertySyncFk != null) {
        propertySync = await models.propertySync.findOne({
            where: {
                id: booking.propertySyncFk
            }
        });
    }

    var refundTypes = await models.refundType.findAll({
        where:{
            deleteFl:false
        }
    });

    var displayRefund = await displayRefundButtonForBookingId(bookingId);
    var refunds = await getRefundsForBookingId(bookingId);
    var refundTotal = getRefundTotal(refunds);
    var cost = parseFloat(booking.cost);
    
    var totalPossibleRefundAmount = cost - refundTotal;
    return res.render('booking', { user: req.user,refundTypes:refundTypes, propertySync: propertySync, 
        dayDiff: dayDiff, booking: booking, latitude: latitude, longitude: longitude,refunds:refunds,
        displayRefund:displayRefund,totalPossibleRefundAmount:totalPossibleRefundAmount });
}

async function getRefundsForBookingId(id)
{
    return await models.sequelize.query('select r.*, rt.type as refundType, DATE_FORMAT(r.createdDttm, "%a %b %D %Y") as createdDttm from refunds r ' + 
                            ' inner join refundTypes rt on r.refundTypeFk = rt.id ' + 
                            ' where r.bookingFk = :id ' + 
                            ' and r.deleteFl = false ', 
                            {replacements:{id:id},type:models.sequelize.QueryTypes.SELECT});
}

function getRefundTotal(refunds)
{
    var total = 0;

    for(var i = 0; i < refunds.length; i++)
    {
        var refund = refunds[i];
        var amount = parseFloat(refund.amount);
        total = total + amount;
    }

    return total;
}