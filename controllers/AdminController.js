const models = require('../models');
// const accountController = require('../controllers/AccountController');
const signupController = require('../controllers/SignUpController');
const{validateCreateUserFields} = require('../validators/register');
const sequelize = require('sequelize');
const {isEmpty} = require('lodash');
const aws = require('aws-sdk');
const config = require('../config/config.json');
const propertyController = require('../controllers/PropertyController');
const accountController = require('../controllers/AccountController');

aws.config.update({

    secretAccessKey: config.secretAccessKey,
    accessKeyId:config.accessKeyId,
    region: config.region
  });


exports.getLogin = async function(req,res)
{
    res.render('adminLogin');
}

exports.getSearchBookingPage = async function(req,res)
{
    res.render('adminSearchBooking',{user:req.user});
}

exports.getAdminDashboard = async function(req,res)
{
    // var thisMonthsTotal = await orderController.getThisMonthsTotal();
    // var thisYearsTotal = await orderController.getThisYearsTotal();
    // var bestSellingProduct = await orderController.getBestSellingProduct();
    // var thisMonthsNewAccounts = await accountController.getThisMonthsNewAccounts();
    // var numberOfUkandInternationalOrders = await orderController.getNumberOfUkandInternationalOrders();
    // var last7 = await orderController.getLast7DaysOrderCount();
    // var result = sortNumberOfUkandInternationalOrders(numberOfUkandInternationalOrders);
    // var lowStockResult = await lowStock();
    res.render('adminDashboard',{user:req.user});
}

exports.getTownsForCityId = async function(req,res)
{
    var cityId = req.query.id;

    models.town.findAll({
        where:{
            cityFk:cityId
        },
        order:[
            ['name','ASC']
        ]
    }).then(towns=>{
        res.json({towns:towns});
    })
}

exports.getAddProperty = async function(req,res)
{
    var success = (req.query.success == undefined) ? false : true;
    if(success)
        success = "Created Successfully";
    else
        success = "";

    var cities = await propertyController.getAllCities();
    var amenities = await propertyController.getAmenities();

    res.render('addProperty', {user:req.user, amenities:amenities, cities:cities,success:success});
           
}

exports.addProperty = async function(req,res)
{
    var propertyName = req.body.propertyName;
    var pricePerDay = req.body.pricePerDay;
    var bedroom = req.body.bedroom;
    var bathroom = req.body.bathroom;
    var guest = req.body.guest;
    var beds = req.body.beds;
    var advanceNotice = req.body.advanceNotice;
    var addressLine1 = req.body.addressLine1;
    var addressLine2 = req.body.addressLine2;
    var cityId = req.body.cityId;
    var townId = req.body.townId;
    var postCode = req.body.postCode;
    var description = req.body.description;
    var picture1 = req.files.picture1;
    var picture2 = req.files.picture2;
    var picture3 = req.files.picture3;
    var picture4 = req.files.picture4;
    var count = req.body.syncCount;
    var error = {};
    var pictureArray = new Array();
    
    pictureArray.push(picture1);

    var property = await models.property.findOne({
        where:{
            name:propertyName
        }
    });

    if(property != null)
    {
        error['propertyName'] = 'Property with name ' + propertyName + ' already exists. Please enter a new unique name.';
        return res.json({error:error})
    }

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

    var now = Date.now();
    var s3FileLocations = await forEachSavePictures(pictureArray, propertyName,savePictures,now);

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

    for(var i = 0; i < count; i++ )
    {
        var name = 'syncName' + i;
        if( req.body[name] != undefined)
            await propertyController.addPropertySync(req.body['syncName' + i],req.body['syncUrl' + i],property.id);
    }

    var amenities = await propertyController.getAmenities();

    for( var j = 0; j < amenities.length; j++ )
    {
        var amenity = amenities[j];
        var id = amenity.id;
        var amenityName = amenity.name;
        var isChecked = req.body[amenityName] == 'true'; 

        await models.propertyAmenity.create({
            propertyFk:property.id,
            amenityFk:id,
            checkedFl:isChecked,
            deleteFl:false,
            versionNo:1
        });

    }

    res.json({propertyId:property.id});

}
exports.getSearchAccountPage = async function(req,res)
{
    var accountTypes = await models.accountType.findAll();

    res.render('adminSearchAccount',{user:req.user,accountTypes:accountTypes});  
}

exports.getAccount = async function(req,res)
{
    var id = req.query.id;
    // var lastOrder = await orderController.getLastOrderForAccountById(id);
    var account = await accountController.getAccountById(id);
    // var lowStockResult = await lowStock();

    res.render('adminAccount',{user:req.user,account:account});
}

exports.getAddAdmin = async function(req,res)
{
    res.render('addAdmin',{user:req.user});
}

exports.getSearchPropertyPage = async function(req,res)
{
    var cities = await propertyController.getAllCities();

    res.render('adminSearchProperty', {user:req.user,cities:cities});
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
        Body: picture.data,
        Key: s3FileLocation,
        ACL:'public-read'
    };

    var s3UploadPromise = new Promise(function(resolve, reject) {
        s3.upload(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
    
    await s3UploadPromise;
    return s3FileLocation;
}







// exports.getSearchProductPage = function(req,res)
// {
//     models.productTypeGroup.findAll().then(categories=>{
//         models.color.findAll({
//             order:[
//                 ['color','ASC']
//             ]
//         }).then(colors=>{
//             models.country.findAll().then(async countries=>{
//                 var lowStockResult = await lowStock();

//                 res.render('adminSearchProduct', {user:req.user, categories:categories,colors:colors,countries:countries,lowStockResult:lowStockResult});
//             })
//         })
//     })
// }

// exports.getSearchAccountPage = function(req,res)
// {
//     models.accountType.findAll().then(async accountTypes=>{
//         var lowStockResult = await lowStock();

//         res.render('adminSearchAccount',{user:req.user,accountTypes:accountTypes,lowStockResult:lowStockResult});
//     })
// }

// exports.getSearchOrderPage = async function(req,res)
// {
//     var lowStockResult = await lowStock();
//     res.render('adminSearchOrder',{user:req.user,lowStockResult:lowStockResult});
// }

// exports.getAccount = async function(req,res)
// {
//     var id = req.query.id;
//     var lastOrder = await orderController.getLastOrderForAccountById(id);
//     var account = await accountController.getAccountById(id);
//     var lowStockResult = await lowStock();

//     res.render('adminAccount',{user:req.user,lastOrder:lastOrder,account:account,lowStockResult:lowStockResult});
// }

// exports.getAccountDetails = async function(req,res)
// {
//     var id = req.query.id;
//     var account = await accountController.getAccountById(id);
//     var lowStockResult = await lowStock();

//     res.render('adminAccountDetails',{user:req.user,account:account,lowStockResult:lowStockResult});
// }

// exports.adminUpdateAccountPassword = async function(req,res)
// {
//     let errors = {};
    
//     validateCreateUserFields(errors, req);
 
//     if(!isEmpty(errors))
//     {
//         // reRender the sign up page with the errors
//         console.log(errors);
//         rerender_AccountDetails(errors,req,res);
//     }
//     else
//     {
//         await models.account.update({
//             password: signupController.generateHash(req.body.password),
//             versionNo:sequelize.literal('versionNo + 1')
//         },{
//             where:{
//                 id:req.body.id
//             }
//         });
//         req.body['success'] = "Password Updated";
//         rerender_AccountDetails(errors,req,res);
//     }
// }

// async function rerender_AccountDetails(errors,req, res)
// {
//     var id = req.body.id;
//     var account = await accountController.getAccountById(id);
//     var success = req.body.success ? true : false;
//     var lowStockResult = await lowStock();

//     res.render('adminAccountDetails',{ errors:errors,user:req.user,success:success,account:account,lowStockResult:lowStockResult});
// }

// exports.updateMailingList = async function(req,res)
// {
//     var id = req.body.id;
//     var emailRegister = req.body.emailRegister == undefined ? false : true;
//     var account = await accountController.getAccountById(id);
//     var errors = {};
//     if(account.mailingListFl == emailRegister)
//     {
//         errors['emailRegister'] = 'No change made';
//         rerender_AccountDetails(errors,req,res);
//     }
//     else
//     {
//         await models.account.update({
//             mailingListFl:emailRegister
//         },{
//             where:{
//                 id:id
//             }
//         });

//         errors['emailRegister'] = 'Updated Successfully';
//         rerender_AccountDetails(errors,req,res);
//     }
//     console.log(req.body);
// }

// exports.getOrderHistory = async function(req,res)
// {   
//     var id = req.query.id;
//     var account = await accountController.getAccountById(id);
//     var orderHistory = await orderController.getOrderHistoryForAccountById(id);
//     var lowStockResult = await lowStock();

//     res.render('adminOrderHistory',{user:req.user,account:account,orderHistory:orderHistory,lowStockResult:lowStockResult});
// }

// exports.getOrder = async function(req,res)
// {
//     var orderId = req.query.id;
//     var accountId = req.query.accountId;
//     var account = await accountController.getAccountById(accountId);
//     var order = await orderController.getOrderById(orderId);
//     var lowStockResult = await lowStock();
//     var refundTypes = await orderController.getRefundTypes();
//     var refunds = await orderController.getRefundsForOrderId(orderId);
//     var displayRefundButton = await orderController.displayRefundButtonForOrderId(orderId);
//     res.render('adminOrder',{user:req.user,order:order,account:account,
//         lowStockResult:lowStockResult,refundTypes:refundTypes,refunds:refunds,displayRefundButton:displayRefundButton});
// }

// exports.getLowStock = async function(req,res)
// {
//     var lowStockResult = await lowStock();
//     res.render('adminLowStock',{user:req.user,lowStockResult:lowStockResult});
// }

// exports.getWagwarnPage = async function(req,res)
// {
//     var lowStockResult = await lowStock();
//     res.render('addWagwarn',{user:req.user,lowStockResult:lowStockResult});
// }

// exports.getSearchWagwarnPage = async function(req,res)
// {
//     var lowStockResult = await lowStock();
//     res.render('adminSearchWagwarn',{user:req.user,lowStockResult:lowStockResult});
// }

// function sortNumberOfUkandInternationalOrders(numberOfUkandInternationalOrders)
// {
//     if(numberOfUkandInternationalOrders.length == 0)
//         return {uk:0,international:0};
//     else if(numberOfUkandInternationalOrders.length == 1)
//     {
//         var uk = numberOfUkandInternationalOrders[0].ukFl == 1 ? numberOfUkandInternationalOrders[0].total : 0;
//         var international = numberOfUkandInternationalOrders[0].ukFl == 0 ? numberOfUkandInternationalOrders[0].total : 0;
//         return {uk:uk,international:international};
//     }
//     else
//     {
//         var uk;
//         var international;
//         if(numberOfUkandInternationalOrders[0].ukFl == 0)
//         {
//             uk = numberOfUkandInternationalOrders[1].total;
//             international = numberOfUkandInternationalOrders[0].total;
//         }
//         else
//         {
//             uk = numberOfUkandInternationalOrders[0].total;
//             international = numberOfUkandInternationalOrders[1].total;
//         }
//         return {uk:uk,international:international};
//     }        
// }

// exports.lowStock = async function()
// {
//     return await lowStock();
// }

// exports.getAdminWagwarn = async function(req,res)
// {
//     var id = req.query.id;
//     var blog = await blogController.getBlogById(id);
//     var lowStockResult = await lowStock();
//     res.render('adminWagwarn',{user:req.user,lowStockResult:lowStockResult,blog:blog});
// }

// exports.getAddAdmin = async function(req,res)
// {
//     var lowStockResult = await lowStock();
//     res.render('addAdmin',{user:req.user,lowStockResult:lowStockResult});
// }

// exports.getDeliveryDiscount = async function(req,res)
// {
//     var success = (req.query.success == undefined) ? false : true;
//     if(success)
//         success = "Updated Successfully";
//     else
//         success = "";

//     var lowStockResult = await lowStock();
//     var discounts = await discountController.getDiscountByName('Free Shipping');
//     res.render('adminDeliveryDiscount',{user:req.user,lowStockResult:lowStockResult,discounts:discounts,success:success});
// }

// exports.getBlogs = async function(req,res)
// {
//     var title = req.query.title;
//     var blogs = await models.sequelize.query('select *,' + 
//             ' DATE_FORMAT(createdDttm, "%Y-%m-%d %H:%i:%s") as createdDttm,DATE_FORMAT(publishDttm, "%Y-%m-%d %H:%i:%s") as publishDttm from blogs ' + 
//             ' where title like :title ', {replacements:{title:'%'+ title + '%'},type:models.sequelize.QueryTypes.SELECT});
//     res.json({blogs:blogs});
// }

// async function lowStock()
// {
//     var query = ' SELECT distinct p.id, p.name, p.price, pd.picture1Path FROM productdetails pd ' +
//     ' inner join products p on pd.productFk = p.id ' +
//     ' where pd.quantity < :low ';
//     var query2 = ' select distinct p.id, p.name, p.price, c.color, pd.picture1Path from productdetails pd ' +
//     ' inner join products p on pd.productFk = p.id ' + 
//     ' inner join sizequantities s on pd.sizeQuantityFk = s.id ' +
//     ' inner join colors c on pd.colorFk = c.id ' +
//     ' where (s.sQuantity < :low or mQuantity < :low or lQuantity < :low or xlQuantity < :low ' + 
//     ' or xxlQuantity < :low ) ';

//     var result = await models.sequelize.query(query,{replacements:{low:5},type:models.sequelize.QueryTypes.SELECT});
//     var result2 = await models.sequelize.query(query2,{replacements:{low:5},type:models.sequelize.QueryTypes.SELECT});

//     var count = result.length + result2.length;
//     return {lowStock:result,lowStock2:result2,count:count};
// }

// exports.lowStock = async function()
// {
//     return await lowStock();
// }