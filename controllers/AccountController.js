const models = require('../models');
const{validateCreateUserFields} = require('../validators/register');
const {isEmpty} = require('lodash');
const signupController = require('../controllers/SignUpController');
const bookingController = require('../controllers/BookingController');
const sequelize = require('sequelize');

exports.getAccounts = async function(req,res)
{
    var email = req.query.email;
    var accountType = req.query.accountType;
    var fromDt = req.query.fromDt;
    var toDt = req.query.toDt;

    var query = ' select a.id,a.email,DATE_FORMAT(a.createdDttm, "%Y-%m-%d %H:%i:%s") as createdDttm, at.type, a.deleteFl from accounts a' + 
                ' inner join accountTypes at on a.accountTypeFk = at.id ' +
                ' where a.dummyFl = false ';
    
    if(email != '')
        query = query + ' and a.email like :email ';

    if(accountType != 0)
        query = query + ' and a.accountTypeFk = :accountType';
    
    if(fromDt != '')
        query = query + ' and a.createdDttm >= :fromDt';
    
    if(toDt != '')
        query = query + ' and a.createdDttm <= :toDt';
    
    var accounts = await models.sequelize.query(query,
            {replacements:{email:'%' + email +'%',accountType:accountType,fromDt:fromDt,toDt:toDt},
            type:models.sequelize.QueryTypes.SELECT});

    res.json({result:accounts});
        
}


exports.getMyAccount = async function(req,res)
{
    // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
    // var lastOrder = await orderController.getLastOrderForAccountById(req.user.id);
    // var discounts = await discountController.getDiscountByName('Free Shipping');
    // var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
    // var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
    // var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');
    // var shippingDetail = await shippingController.getSavedPrimaryShippingDetailForAccount(req.user.id);
    res.render('myAccount',{user:req.user});
}

exports.getAccountDetails = async function(req,res)
{
    // var discounts = await discountController.getDiscountByName('Free Shipping');
    // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
    
    // var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
    // var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
    // var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');
    
    res.render('accountDetails',{user:req.user});
}

exports.getBookingHistory = async function(req,res)
{
    // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
    var bookingHistory = await bookingController.getBookingHistoryForAccountById(req.user.id);
    // var discounts = await discountController.getDiscountByName('Free Shipping');
    // var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
    // var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
    // var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');

    res.render('bookingHistory',{user:req.user,bookingHistory:bookingHistory});
}

exports.closeAccount = async function(req,res)
{
    var account = req.user;
    
    // await workerQueue.add({process:'closeAccountEmail',email:account.email});
    // req.cookies =[];
    // res.clearCookie('reggae_masters_user_data');
    await req.logout();
    await req.session.destroy();
    await models.account.update({
        deleteFl:true,
        mailingListFl:false,
        closedDttm:Date.now(),
        versionNo:sequelize.literal('versionNo + 1')
    },{
        where:{
            id:account.id
        }
    });

    res.json({});
}

exports.adminCloseAccount = async function(req,res)
{
    var accountId = req.body.accountId;
    var account = await getAccountById(accountId);
    // await workerQueue.add({process:'closeAccountEmail',email:account.email});
    // req.cookies =[];
    
    await models.account.update({
        deleteFl:true,
        mailingListFl:false,
        closedDttm:Date.now(),
        versionNo:sequelize.literal('versionNo + 1')
    },{
        where:{
            id:account.id
        }
    });

    res.json({});
}


exports.updatePassword = async function(req,res)
{
    let errors = {};
    
    validateCreateUserFields(errors, req);
 
    if(!isEmpty(errors))
    {
        // reRender the sign up page with the errors
        console.log(errors);
        rerender_AccountDetails(errors,req,res);
    }
    else
    {
        await models.account.update({
            password: signupController.generateHash(req.body.password),
            versionNo:sequelize.literal('versionNo + 1')
        },{
            where:{
                id:req.user.id
            }
        });
        req.body['success'] = "Password Updated";
        rerender_AccountDetails(errors,req,res);
    }
}


exports.getAccountById = async function(id)
{
    return await getAccountById(id);
}

async function getAccountById(id)
{
    var account =  await models.sequelize.query('select a.*, att.type, DATE_FORMAT(a.closedDttm, "%a %b %D %Y") as closedDttm, ' + 
        ' DATE_FORMAT(a.createdDttm, "%a %b %D %Y") as created  from accounts a ' + 
        ' inner join accountTypes att on a.accountTypeFk = att.id ' + 
        ' where a.id = :id ',{replacements:{id:id},type:models.sequelize.QueryTypes.SELECT});
    return account[0];
}


async function rerender_AccountDetails(errors,req, res)
{
    // var displayCookieMessage = req.body.displayCookieMessage;
    var success = req.body.success ? true : false;
    // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
    // var discounts = await discountController.getDiscountByName('Free Shipping');
    
    // var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
    // var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
    // var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');
    res.render('accountDetails',{ errors:errors,user:req.user,success:success});
}

exports.searchAccounts = async function(req,res)
{
    var accountTypes = await models.accountType.findAll();
    var fromDt = req.query.fromDate;
    var name = req.query.name;
    var email = req.query.email;
    var accountTypeId = req.query.accountTypeId;

    var query = ' select a.*, att.type as accountType, DATE_FORMAT(a.createdDttm, "%a %b %D %Y") as date from accounts a ' +
                ' inner join accountTypes att on a.accountTypeFk = att.id ' +
                ' where a.deleteFl = false ';

    if(fromDt != undefined && fromDt != null)
        query = query + ' and a.createdDttm >= :fromDt ';

    if(name != undefined && name != null)
        query = query + ' and a.name like :name ';
    
    if(email != undefined && email != null)
        query = query + ' and a.email like :email ';

    if(accountTypeId != undefined && accountTypeId != null && accountTypeId !="")
        query = query + ' and a.accountTypeFk = :accountTypeId ';

    var accounts = await models.sequelize.query(query, 
            {replacements:{name: '%' + name + '%',
                        fromDt:fromDt,
                        email:'%' + email + '%',
                        accountTypeId:accountTypeId},
                        type:models.sequelize.QueryTypes.SELECT});
                        
    res.render('adminSearchAccount', {user:req.user, accountTypes:accountTypes, results:accounts});

}