const models = require('../models');
const adminController = require('../controllers/AdminController');
const sequelize = require('sequelize');
const config = require('../config/config.json');
const homeController = require('../controllers/HomeController');
const ical = require('node-ical');
const icalGenerator = require('ical-generator');
const moment = require('moment');
const fetch = require('node-fetch');

exports.getAllCities = async function () {
    return await getAllCities();
}

async function getAllCities() {
    return await models.city.findAll({
        order: [
            ['name', 'ASC']
        ]
    });
}

async function getAllCitiesWithProperties() {
    return await models.sequelize.query('select distinct c.* from addresses a ' +
        ' inner join cities c on a.cityFk = c.id ' +
        ' where c.deleteFl = false ' +
        ' and a.deleteFl = false order by c.name asc',
        { type: models.sequelize.QueryTypes.SELECT });
    // return result[0];
}

exports.getAllCitiesWithProperties = async function () {
    return await getAllCitiesWithProperties();
}

exports.addProperty1 = async function(req,res)
{
    res.render('addProperty1',{user:req.user});
}

exports.getProperties = async function (req, res) {
    var propertyName = req.query.propertyName;
    var cityId = req.query.cityId;
    var townId = req.query.townId;
    var minPricePerDay = req.query.minPricePerDay;
    var maxPricePerDay = req.query.maxPricePerDay;
    var addressLine1 = req.query.addressLine1;
    var postCode = req.query.postCode;

    var query = 'select distinct p.id, p.displayImage1,p.name, p.pricePerDay, c.name as city, t.name as town, a.id addressId, a.postCode from properties p ' +
        ' inner join addresses a on a.propertyFk = p.id ' +
        ' inner join cities c on a.cityFk = c.id ' +
        ' inner join towns t on a.townFk = t.id ' +
        ' where p.name like :propertyName ' +
        ' and a.addressLine1 like :addressLine1 ' +
        ' and a.postCode like :postCode ';


    if (maxPricePerDay != '')
        query = query + 'and p.pricePerDay <= :maxPrice ';

    if (minPricePerDay != '')
        query = query + 'and p.pricePerDay >= :minPrice ';

    if (cityId != 0)
        query = query + ' and c.id = :cityId';

    if (townId != '')
        query = query + ' and t.id = :townId';

    var result = await models.sequelize.query(query,
        {
            replacements: {
                propertyName: '%' + propertyName + '%',
                minPricePerDay: minPricePerDay,
                maxPricePerDay: maxPricePerDay,
                addressLine1: '%' + addressLine1 + '%',
                postCode: '%' + postCode + '%',
                townId: townId,
                cityId: cityId
            },
            type: models.sequelize.QueryTypes.SELECT
        });

    res.json({ result: result });
}

exports.getAdminProperty = async function (req, res) {
    var id = req.query.id;
    var success = req.query.success == 'true';

    var property = await models.sequelize.query("select p.*, t.name as town, c.name as city, c.id as cityId, t.id as townId, a.addressLine1, a.addressLine2, a.postCode from properties p " +
        " inner join addresses a on a.propertyFk = p.id " +
        " inner join cities c on a.cityFk = c.id " +
        " inner join towns t on a.townFk = t.id " +
        " where p.id = :id ", { replacements: { id: id }, type: models.sequelize.QueryTypes.SELECT });

    var cities = await getAllCities();

    var propertySyncs = await getPropertySyncsForProperty(id);
    var ical = 'localhost:3000/syncListing?id=' + id;
    res.render('adminProperty', {user:req.user, property: property[0], cities: cities, success: success, propertySyncs: propertySyncs, ical: ical });

}

async function getPropertySyncsForProperty(id) {
    return await models.propertySync.findAll({
        where: {
            propertyFk: id,
            deleteFl: false
        }
    });
}

exports.editProperty = async function (req, res) {
    var files = req.files;
    var hide = req.body.hide == 'true' ? true : false;

    var propertyId = req.body.propertyId;
    var propertyName = req.body.propertyName;
    var pricePerDay = req.body.pricePerDay;
    var bedrooms = req.body.bedrooms;
    var bathrooms = req.body.bathrooms;
    var guests = req.body.guests;
    var addressLine1 = req.body.addressLine1;
    var addressLine2 = req.body.addressLine2;
    var cityId = req.body.cityId;
    var townId = req.body.townId;
    var postCode = req.body.postCode;
    var description = req.body.description;
    var removePicture2 = req.body.removePicture2 != undefined;
    var removePicture3 = req.body.removePicture3 != undefined;
    var removePicture4 = req.body.removePicture4 != undefined;
    var addressId = req.body.addressId;
    var picture1;
    var picture2;
    var picture3;
    var picture4;
    var count = req.body.syncCount;
    var errors = {};
    var differentPropertyWithName = await models.sequelize.query('select * from properties p where p.name = :propertyName and p.id != :id ',
        { replacements: { propertyName: propertyName, id: propertyId }, type: models.sequelize.QueryTypes.SELECT });

    if (differentPropertyWithName.length > 0) {
        errors['name'] = 'Name already exists for another property.'
        return res.json({ errors: errors });
    }

    var now = Date.now();
    if (files != null && files.picture1) {
        var picture1 = config.s3BucketPath + await adminController.savePictures(files.picture1, 1, now, propertyName)
    }

    if (files != null && files.picture2) {
        var picture2 = config.s3BucketPath + await adminController.savePictures(files.picture2, 2, now, propertyName)
    }

    if (files != null && files.picture3) {
        var picture3 = config.s3BucketPath + await adminController.savePictures(files.picture3, 3, now, propertyName)
    }

    if (files != null && files.picture4) {
        var picture4 = config.s3BucketPath + await adminController.savePictures(files.picture4, 4, now, propertyName)
    }

    if (removePicture2 == true)
        picture2 = null;

    if (removePicture3 == true)
        picture3 = null;

    if (removePicture4 == true)
        picture4 = null;

    await models.address.update({
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        cityFk: cityId,
        townFk: townId,
        postCode: postCode,
        versionNo: sequelize.literal('versionNo + 1')
    },
        {
            where: {
                id: addressId
            }
        });

    var propertyUpdateJson = {
        name: propertyName,
        pricePerDay: pricePerDay,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        guests: guests,
        description: description,
        deleteFl: hide,
        versionNo: sequelize.literal('versionNo + 1')
    };

    if (picture1 !== undefined)
        propertyUpdateJson['displayImage1'] = picture1;

    if (picture2 !== undefined)
        propertyUpdateJson['displayImage2'] = picture2;

    if (picture3 !== undefined)
        propertyUpdateJson['displayImage3'] = picture3;

    if (picture4 !== undefined)
        propertyUpdateJson['displayImage4'] = picture4;
    await models.property.update(propertyUpdateJson,
        {
            where: {
                id: propertyId
            }
        });

        for(var i = 0; i < count; i++ )
        {
            var name = 'syncName' + i;
            if( req.body[name] != undefined)
                await addPropertySync(req.body['syncName' + i],req.body['syncUrl' + i],propertyId);
        }


    return res.json({ success: 'success' });
}

exports.addPropertySync = async function (name, url, propertyId) {
    return await addPropertySync(name, url, propertyId);
}

async function addPropertySync(name, url, propertyId) {
    var propertySync = await models.propertySync.findOne({
        where: {
            propertyFk: propertyId,
            name: name,
            url: url,
            deleteFl: false
        }
    });

    if (propertySync == null)
        await models.propertySync.create({
            propertyFk: propertyId,
            url: url,
            name: name,
            deleteFl: false,
            versionNo: 1
        });

    return propertySync;
}

exports.propertyAvailability = async function (req, res) {
    var id = req.query.id;
    var property = await models.property.findOne({
        where:{
            id:id
        }
    });
    var bookings = await getBookingsForProperty(id);
    res.render('propertyAvailability', {user:req.user, bookings: bookings, property:property });
}

exports.syncListing = async function (req, res) {
    var propertyId = req.query.id;
    var property = await models.property.findOne({
        where: {
            id: propertyId
        }
    });

    var bookings = await getBookingsForProperty(propertyId);
    const calendar = icalGenerator({ name: 'Property ' + property.name });
    for (var i = 0; i < bookings.length; i++) {
        var booking = bookings[i];
        var event = {
            start: booking.fromDt,
            end: booking.toDt,
            summary: booking.status,
            description: 'Property ' + property.name,
        };

        calendar.createEvent(event);
    }

    calendar.serve(res);
    return;
}

async function getBookingsForProperty(propertyId) {
    var result1 = await models.sequelize.query('select b.*, a.name from bookings b ' +
        ' inner join accounts a on b.accountfk = a.id ' +
        ' where b.propertyFk = :propertyId ' +
        ' and b.propertySyncFk is null ' +
        ' and (b.status != :status and b.status != :status2)' + 
        ' and b.deleteFl = false ',
        {
            replacements: {
                propertyId: propertyId,
                status: 'Cancelled',
                status2: 'Pending',
            }, type: models.sequelize.QueryTypes.SELECT
        });

    var result2 = await models.sequelize.query('select b.*, ps.name as propertySyncName from bookings b ' + 
                ' inner join propertySyncs ps on b.propertySyncFk = ps.id ' +
                ' where b.propertyFk = :propertyId ' + 
                ' and (b.status != :status and b.status != :status2) ' + 
                ' and b.accountFk = :dummyId ' +
                ' and b.deleteFl = false ', 
                {replacements:{propertyId:propertyId,status:'Cancelled', status2:'Pending',dummyId:0},
                type:models.sequelize.QueryTypes.SELECT});

    var results = new Array();
    result1.forEach(result =>{
        results.push(result);
    });
    
    result2.forEach(result=>{
        results.push(result);
    })

    return results;
}

exports.validateCalendarSync = async function (req, res) {
    var url = req.query.url;
    var valid = true;
    try {
        await ical.async.fromURL(url);
    }
    catch (err) {
        valid = false;
    }

    res.json({ success: valid })

}

exports.searchProperties = async function (req, res) {
    var guests = req.query.guests;
    var fromDt = req.query.fromDt;
    var toDt = req.query.toDt;
    var cityId = req.query.cityId;
    var townId = req.query.townId;
    var bedrooms = req.query.bedrooms;
    var bathrooms = req.query.bathrooms;
    var city = await models.city.findOne({
        where: {
            id: cityId
        }
    });

    var query = "select distinct p.*, t.name as town from properties p " +
        ' inner join addresses a on a.propertyFk = p.id ' +
        ' inner join towns t on a.townFk = t.id ' +
        ' where p.deleteFl = false ' +
        ' and a.deleteFl = false ';

    if (fromDt != undefined && toDt != undefined) {
        query = query + ' and p.id not in (select propertyFk from bookings where fromDt <= :fromDt && toDt >= :toDt and status=:completed) ';
        if (fromDt != undefined)
            fromDt = new Date(fromDt);

        if (toDt != undefined)
            toDt = new Date(toDt);
    }

    if (fromDt != undefined) {
        query = query + ' and p.id not in (select propertyFk from bookings where fromDt <= :fromDt and status=:completed) ';
        fromDt = new Date(fromDt);
    }

    if (guests != undefined && guests != 'undefined' &&  guests != '')
        query = query + ' and p.guests >= :guests ';

    if (cityId != undefined && cityId != 0)
        query = query + ' and a.cityFk = :cityId ';
    else
        cityId = 1;

    var town = null;
    if (townId != undefined && townId != 0) {
        query = query + ' and a.townFk = :townId ';
        town = await models.town.findOne({
            where: {
                id: townId
            }
        });
    }

    if (bathrooms != undefined) {
        query = query + ' and p.bathrooms >= :bathrooms ';
        bathrooms = bathrooms.replace('+', '');
    }

    if (bedrooms != undefined) {
        query = query + ' and p.bedrooms >= :bedrooms ';
        bedrooms = bedrooms.replace('+', '');
    }

    var properties = await models.sequelize.query(query,
        {
            replacements: {
                guests: guests, fromDt: fromDt, toDt: toDt, cityId: cityId,
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                townId: townId, completed: 'Completed'
            },
            type: models.sequelize.QueryTypes.SELECT
        });

    var cities = await getAllCitiesWithProperties();
    var towns = await homeController.getAllTowns();
        console.log(bathrooms)
    res.render('properties', { user: req.user, bedrooms:bedrooms,bathrooms:bathrooms, properties: properties, cityId: cityId, city: city, town: town, cities: cities, towns: towns });
}

exports.getProperty = async function(req,res)
{
    var id = req.query.id;
    var property = await models.sequelize.query('select p.*, t.name as town, c.name as city, addr.postCode from properties p ' + 
            ' inner join addresses addr on addr.propertyFk = p.id ' + 
            ' inner join towns t on addr.townFk = t.id ' + 
            ' inner join cities c on addr.cityFk = c.id ' + 
            ' where p.id = :id ',
            {replacements:{id:id},type:models.sequelize.QueryTypes.SELECT});
    property = property[0];
    if(property == null)
        return res.redirect('/properties?cityId=1');
    
    const body = await fetch("https://api.postcodes.io/postcodes/" + property.postCode).then(result => result.json());
    var longitude = body.result.longitude;
    var latitude = body.result.latitude; 

    var propertyAvailabilityDates = await getPropertyAvailabilty(id);
    var error = req.query.error;


    res.render('property',{user:req.user,error:error, propertyAvailabilityDates:propertyAvailabilityDates, property:property, longitude:longitude,latitude:latitude});
}

async function getPropertyAvailabilty(propertyId)
{
    
    // get all bookings where the toDate is after or equal today
    // find all dates within each booking

    var bookings = await models.sequelize.query('select * from bookings b ' + 
                    ' where b.propertyFk = :propertyId ' + 
                    ' and b.toDt >= CURDATE() ' + 
                    ' and (b.status != :cancelled and b.status != :pending)' + 
                    ' and b.deleteFl = false ' ,
                    {replacements:{propertyId:propertyId,cancelled:'Cancelled',pending:'Pending'}, type:models.sequelize.QueryTypes.SELECT});
    

    var result = new Array();
    console.log(bookings);
    for( var i = 0; i < bookings.length; i++ )
    {
        var booking = bookings[i];
        var fromDt = booking.fromDt;
        var toDt = booking.toDt;
        // var between = new Array();
        while (fromDt < toDt) 
        {
            var month = fromDt.getMonth();
            var day = fromDt.getDate();
            var year = fromDt.getFullYear();
            var date = year + '-' + month + '-' + day;
            console.log(date);
            result.push(date);
            fromDt.setDate(fromDt.getDate() + 1);
        }

        // result.push(between);
    }
    return result;
}

exports.removeSync = async function (req, res) {
    var id = req.body.id;
    await models.propertySync.update({
        deleteFl: true
    },
        {
            where: {
                id: id
            }
        });

    res.json({ success: true });

}

// exports.getBooking = async function (req, res) {
//     var bookingId = req.query.id;

//     var bookings = await models.sequelize.query('select b.*,p.pricePerDay as price, p.name as propertyName, a.name as customerName from bookings b ' +
//         ' inner join properties p on b.propertyFk = p.id ' +
//         ' inner join accounts a on b.accountFk = a.id ' +
//         ' where b.id = :bookingId ',
//         { replacements: { bookingId: bookingId }, type: models.sequelize.QueryTypes.SELECT });
//     var booking = bookings[0];
//     var bookingStart = booking.fromDt;
//     var bookingEnd = booking.toDt;
//     var today = new Date();

//     var dayDiff = dateDiff(today, bookingStart);
//     var currentlyStaying = false;

//     if (bookingStart <= today && today < bookingEnd)
//         currentlyStaying = true;

//     console.log(booking)
//     res.render('booking', {user:req.user, booking: booking, dayDiff: dayDiff, currentlyStaying: currentlyStaying });
// }

exports.getBooking = async function(req,res)
{
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
            ' order by b.bookingDttm desc ',{replacements:{
                bookingId:bookingId},type:models.sequelize.QueryTypes.SELECT});
    booking = booking[0];

    // deal with this later
    // if(booking == null)
    //    return res.redirect('/bookingHistory');

    var fromDt = new Date(booking.fromDt);
    var toDt = new Date(booking.toDt);
    const body = await fetch("https://api.postcodes.io/postcodes/" + booking.postCode).then(result => result.json());
    var longitude = body.result.longitude;
    var latitude = body.result.latitude;
    var dayDiff = await dateDiff(fromDt, toDt);
    console.log(dayDiff);

    var propertySync = null;
    if(booking.propertySyncFk != null)
    {
        propertySync = await models.propertySync.findOne({
            where:{
                id:booking.propertySyncFk
            }
        });
    }

    return res.render('booking', {user:req.user,propertySync:propertySync, dayDiff:dayDiff, booking:booking,latitude:latitude,longitude:longitude});
}


function dateDiff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

exports.dateDiff = async function (first, second) {
    return await dateDiff(first, second);
}

exports.adminSearchProperties = async function(req,res)
{
    var cities = await getAllCities();
    var propertyName = req.query.propertyName;
    var addressLine1 = req.query.addressLine1;
    var city = req.query.city;
    var town = req.query.town;
    var postCode = req.query.postCode;

    var query = 'select p.*, c.name as city, t.name as town, addr.addressLine1, addressLine2, addr.postCode from properties p ' + 
            ' inner join addresses addr on addr.propertyFk = p.id ' + 
            ' inner join cities c on addr.cityFk = c.id ' + 
            ' inner join towns t on addr.townFk = t.id ' + 
            ' where p.deleteFl = false ';

    if(propertyName != undefined && propertyName != null)
        query = query + ' and p.name like :propertyName ';

    if(addressLine1 != undefined && addressLine1 != null)
        query = query + ' and addr.addressLine1 like :addressLine1 ';

    if(city != undefined && city != null && city != "" )
        query = query + ' and addr.cityFk = :city ';

    if(town != undefined && town != null && town != "" )
        query = query + ' and addr.townFk = :town ';

    if(postCode != undefined && postCode != null)
        query = query + ' and addr.postCode like :postCode ';

    var results = await models.sequelize.query(query,
                            {replacements:{
                                propertyName: '%' + propertyName + '%',
                                addressLine1: '%' + addressLine1 + '%',
                                city:city,
                                town:town,
                                postCode: '%' + postCode + '%',
                            },type:models.sequelize.QueryTypes.SELECT});

    res.render('adminSearchProperty', {user:req.user, cities:cities,results:results});
}