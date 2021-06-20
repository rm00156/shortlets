const throng = require('throng');
const Queue = require("bull");
const models = require('./models');
const hbs = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const ical = require('node-ical');

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
const workers = process.env.WEB_CONCURRENCY || 2;

// The maxium number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
const maxJobsPerWorker = 50;

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
    });
}

async function syncCalendarsTask()
{
    // var propertySyncs = await models.propertySync.findAll({
    //     where:{
    //         deleteFl:false
    //     }
    // });

    // for( var i = 0; i < propertySyncs.length; i++ )
    // {
    //     var propertySync = propertySyncs[i];
    //     await processCalendarSync(propertySync);
    // }
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