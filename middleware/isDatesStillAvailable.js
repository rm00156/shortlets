const models = require('../models');

exports.isDatesStillAvailable = async function(req,res, next)
{
    var propertyId = req.body.propertyId;
    var fromDate = req.body.fromDate;
    var toDate = req.body.toDate;

    var bookings = await models.sequelize.query('select * from bookings ' + 
                ' where fromDt <= :toDate ' + 
                ' and toDt >= :fromDate ' + 
                ' and (status = :status1 or status = :status2) ' +
                ' and propertyFk = :propertyId ' +
                ' and deleteFl = false ',
                {replacements:{fromDate:fromDate,toDate:toDate,propertyId:propertyId,
                status1:'Successful',status2:'Unavailable'},
                type:models.sequelize.QueryTypes.SELECT});

    if(bookings.length > 0)
    {
        return res.redirect('/property?id=' + propertyId +'&error=true');
    }
    else
    {
        next();
    } 
}