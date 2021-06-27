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
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
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
                job.data.picture4,job.data.count);
            
        }
    });
}

async function addProperty(job,body,propertyName,pricePerDay,bedroom,bathroom,guest,beds,advanceNotice,
            addressLine1,addressLine2,cityId,townId,postCode,description,picture1,picture2,picture3,
                picture4,count)
{
    var processed = 1;
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

    job.progress(processed);
    processed++;
    var now = Date.now();
    var s3FileLocations = await forEachSavePictures(pictureArray, propertyName,savePictures,now);
    job.progress(processed);
    processed++;
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
        deleteFl:false,
        versionNo:1
    });
    job.progress(processed);
    processed++;

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
    job.progress(processed);
    processed++;

    for(var i = 0; i < count; i++ )
    {
        var name = 'syncName' + i;
        if( body[name] != undefined)
            await propertyController.addPropertySync(body['syncName' + i],body['syncUrl' + i],property.id);
    }
    job.progress(processed);
    processed++;

    var amenities = await propertyController.getAmenities();

    job.progress(processed);
    processed++;
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
    
    job.progress(processed);
    processed++;
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


async function forEachSavePictures(array, propertyName,callback,now)
{
    var s3FileLocations = new Array();
    for(var i = 0 ; i < array.length; i++)
    {
        var s3FileLocation = await callback(array[i], i,now,propertyName);
        s3FileLocations.push(s3FileLocation);
    }

    return s3FileLocations;
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

throng({ workers, start });