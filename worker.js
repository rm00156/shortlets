const throng = require('throng');
const Queue = require("bull");
const models = require('./models');
const hbs = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const ical = require('node-ical');
const aws = require('aws-sdk');
const config = require('./config/config.json');
const propertyController = require('./controllers/PropertyController');
// const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const REDIS_URL = "redis-19621.c77.eu-west-1-1.ec2.cloud.redislabs.com:19621";

const sequelize = require('sequelize');

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
const workers = process.env.WEB_CONCURRENCY || 2;

// The maxium number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
const maxJobsPerWorker = 50;

aws.config.update({

    secretAccessKey: config.secretAccessKey,
    accessKeyId:config.accessKeyId,
    region: config.region
});

const start = function()
 {
    // Connect to the named work queue
    const workerQueue = new Queue('worker', REDIS_URL );
  
    workerQueue.process(maxJobsPerWorker, async (job) => 
    {
        if(job.data.process == 'syncCalendarsTask')
        {
            await syncCalendarsTask();
        }
        else if(job.data.process == 'addProperty')
        {
            return await addProperty(job,job.data.body,job.data.propertyName,job.data.pricePerDay,
                job.data.bedroom,job.data.bathroom,job.data.guest,job.data.beds,job.data.advanceNotice,
                job.data.addressLine1,job.data.addressLine2,job.data.cityId,job.data.townId,
                job.data.postCode,job.data.description,job.data.picture1,job.data.picture2,job.data.picture3,
                job.data.picture4,job.data.picture5,job.data.picture6,job.data.picture7,
                job.data.picture8,job.data.count);
            
        }
        else if(job.data.process == 'editProperty')
        {
            return await editProperty(job, job.data.body, job.data.files);
        }
    });
}

async function addProperty(job,body,propertyName,pricePerDay,bedroom,bathroom,guest,beds,advanceNotice,
            addressLine1,addressLine2,cityId,townId,postCode,description,picture1,picture2,picture3,
                picture4,picture5,picture6,picture7,picture8,count)
{
    var processed = 1;
    job.progress(processed);
    var pictureArray = new Array();
    
    // console.log(picture1);
    // console.log(propertyName)
    pictureArray.push(picture1);

    if(picture2 != undefined)
    {
        pictureArray.push(picture2);
    }

    if(picture3 != undefined)
    {
        pictureArray.push(picture3);
    }

    if(picture4 != undefined)
    {
        pictureArray.push(picture4);
    }

    if(picture5 != undefined)
    {
        pictureArray.push(picture5);
    }

    if(picture6 != undefined)
    {
        pictureArray.push(picture6);
    }

    if(picture7 != undefined)
    {
        pictureArray.push(picture7);
    }

    if(picture8 != undefined)
    {
        pictureArray.push(picture8);
    }

    
    processed++;
    job.progress(processed);
    var now = Date.now();
    var result = await forEachSavePictures(pictureArray, propertyName,savePictures,now, job, processed);
    var s3FileLocations = result[0];
    processed = result[1];
    console.log(processed);
    property = await models.property.create({
        name:propertyName,
        description:description,
        pricePerDay:pricePerDay,
        guests:guest,
        beds:beds,
        advanceNotice:advanceNotice,
        bedrooms:bedroom,
        bathrooms:bathroom,
        displayImage1:config.s3BucketPath + s3FileLocations[0],
        displayImage2:s3FileLocations.length > 1 ? config.s3BucketPath + s3FileLocations[1] : null,
        displayImage3:s3FileLocations.length > 2 ? config.s3BucketPath + s3FileLocations[2] : null,
        displayImage4:s3FileLocations.length > 3 ? config.s3BucketPath + s3FileLocations[3] : null,
        displayImage5:s3FileLocations.length > 4 ? config.s3BucketPath + s3FileLocations[4] : null,
        displayImage6:s3FileLocations.length > 5 ? config.s3BucketPath + s3FileLocations[5] : null,
        displayImage7:s3FileLocations.length > 6 ? config.s3BucketPath + s3FileLocations[6] : null,
        displayImage8:s3FileLocations.length > 7 ? config.s3BucketPath + s3FileLocations[7] : null,
        deleteFl:false,
        versionNo:1
    });
    processed++;
    job.progress(processed);
    
    await models.address.create({
        propertyFk:property.id,
        addressLine1:addressLine1,
        addressLine2:addressLine2 == '' ? null : addressLine2,
        cityFk:cityId,
        townFk:townId,
        postCode:postCode,
        deleteFl:false,
        versionNo:1
    });
    processed++;
    job.progress(processed);
    
    for(var i = 0; i < count; i++ )
    {
        var name = 'syncName' + i;
        if( body[name] != undefined)
            await propertyController.addPropertySync(body['syncName' + i],body['syncUrl' + i],property.id);
    }
    processed++;
    job.progress(processed);
   

    var amenities = await propertyController.getAmenities();

    processed++;
    job.progress(processed);
    
    for( var j = 0; j < amenities.length; j++ )
    {
        var amenity = amenities[j];
        var id = amenity.id;
        var amenityName = amenity.name;
        var isChecked = body[amenityName] == 'true'; 

        await models.propertyAmenity.create({
            propertyFk:property.id,
            amenityFk:id,
            checkedFl:isChecked,
            deleteFl:false,
            versionNo:1
        });
    }
    processed++;
    job.progress(processed);
    console.log(processed);
    return property.id;
}

exports.savePictures = async function(picture, index, now, propertyName)
{
    return await savePictures(picture,index,now,propertyName);
}

async function savePictures(picture,index,now, propertyName)
{
    var s3FileLocation = 'Pictures/' + propertyName + '/picture_' + index +'_'+ now + "." + ((picture.mimeType == 'image/png') ? 'png' : 'jpg');
    
    const s3 = new aws.S3();
    var params = {
        Bucket:config.bucketName,
        Body: Buffer.from(picture.data.data),
        Key: s3FileLocation,
        ACL:'public-read'
    };

    
    var s3UploadPromise = new Promise(function(resolve, reject) {
        s3.upload(params, function(err, data) {
            if (err) {
                console.log(err)
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
    
    await s3UploadPromise;
    console.log('zit')
    return s3FileLocation;
}


async function forEachSavePictures(array, propertyName,callback,now, job, processed)
{
    var s3FileLocations = new Array();
    for(var i = 0 ; i < array.length; i++)
    {
        var s3FileLocation = await callback(array[i], i,now,propertyName);
        s3FileLocations.push(s3FileLocation);
        processed++;
        job.progress(processed);
        console.log(processed);
    }

    return [s3FileLocations,processed];
}

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

        start.setUTCHours(24);
        end.setUTCHours(24);

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

async function editProperty(job, body, files)
{
    var processed = 1;
    job.progress(processed);
    var files = files;
    var hide = body.hide == 'true' ? true : false;

    var propertyId = body.propertyId;
    var propertyName = body.propertyName;
    var pricePerDay = body.pricePerDay;
    var bedrooms = body.bedrooms;
    var bathrooms = body.bathrooms;
    var guests = body.guests;
    var beds = body.beds;
    var advanceNotice = body.advanceNotice;
    var addressLine1 = body.addressLine1;
    var addressLine2 = body.addressLine2;
    var cityId = body.cityId;
    var townId = body.townId;
    var postCode = body.postCode;
    var description = body.description;
    var removePicture2 = body.removePicture2 != undefined;
    var removePicture3 = body.removePicture3 != undefined;
    var removePicture4 = body.removePicture4 != undefined;
    var removePicture5 = body.removePicture5 != undefined;
    var removePicture6 = body.removePicture6 != undefined;
    var removePicture7 = body.removePicture7 != undefined;
    var removePicture8 = body.removePicture8 != undefined;
    var addressId = body.addressId;
    var picture1;
    var picture2;
    var picture3;
    var picture4;
    var picture5;
    var picture6;
    var picture7;
    var picture8;
    var count = body.syncCount;

    var now = Date.now();
    if (files != null && files.picture1) 
    {
        picture1 = config.s3BucketPath + await savePictures(files.picture1, 1, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (files != null && files.picture2) 
    {
        picture2 = config.s3BucketPath + await savePictures(files.picture2, 2, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (files != null && files.picture3)
    {
        picture3 = config.s3BucketPath + await savePictures(files.picture3, 3, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (files != null && files.picture4)
    {
        picture4 = config.s3BucketPath + await savePictures(files.picture4, 4, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (files != null && files.picture5)
    {
        picture5 = config.s3BucketPath + await savePictures(files.picture5, 5, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (files != null && files.picture6)
    {
        picture6 = config.s3BucketPath + await savePictures(files.picture6, 6, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (files != null && files.picture7) 
    {
        picture7 = config.s3BucketPath + await savePictures(files.picture7, 7, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (files != null && files.picture8) 
    {
        picture8 = config.s3BucketPath + await savePictures(files.picture8, 8, now, propertyName);
        processed++;
        job.progress(processed);
    }

    if (removePicture2 == true)
        picture2 = null;

    if (removePicture3 == true)
        picture3 = null;

    if (removePicture4 == true)
        picture4 = null;

    if (removePicture5 == true)
        picture5 = null;

    if (removePicture6 == true)
        picture6 = null;

    if (removePicture7 == true)
        picture7 = null;

    if (removePicture8 == true)
        picture8 = null;

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
    processed++;
    job.progress(processed);
    
    var propertyUpdateJson = {
        name: propertyName,
        pricePerDay: pricePerDay,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        guests: guests,
        beds: beds,
        advanceNotice: advanceNotice,
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

    if (picture5 !== undefined)
        propertyUpdateJson['displayImage5'] = picture5;

    if (picture6 !== undefined)
        propertyUpdateJson['displayImage6'] = picture6;

    if (picture7 !== undefined)
        propertyUpdateJson['displayImage7'] = picture7;

    if (picture8 !== undefined)
        propertyUpdateJson['displayImage8'] = picture8;

    await models.property.update(propertyUpdateJson,
        {
            where: {
                id: propertyId
            }
        });

    processed++;
    job.progress(processed);   

    for (var i = 0; i < count; i++) {
        var name = 'syncName' + i;
        if (body[name] != undefined)
            await propertyController.addPropertySync(body['syncName' + i], body['syncUrl' + i], propertyId);
    }

    processed++;
    job.progress(processed);
    var amenities = await propertyController.getAmenities();

    for (var j = 0; j < amenities.length; j++) {
        var amenity = amenities[j];
        var id = amenity.id;
        var amenityName = amenity.name;
        var isChecked = body[amenityName] == 'true';

        await models.propertyAmenity.update({
            checkedFl: isChecked,
            versionNo: sequelize.literal('versionNo + 1')
        }, {
                where: {
                    propertyFk: propertyId,
                    amenityFk: id
                }
            });

    }
    processed++;
    job.progress(processed);

}

throng({ workers, start });