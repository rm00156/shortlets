const models = require('../models');
const bcrypt = require('bcrypt');
const passport = require('passport');

const secretKey = '6Lejxd4ZAAAAAMnYdtwYTYUGHvhwMtxs7vFTnIYG';
const fetch = require('node-fetch');
const{validateUser} = require('../validators/register');
const { stringify } = require('querystring');
const {isEmpty} = require('lodash');
const Queue = require('bull');
// Connect to a local redis intance locally, and the Heroku-provided URL in production
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const workerQueue = new Queue('worker', REDIS_URL );

const generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null );
}

exports.generateHash = function(password)
{
    return generateHash(password);
}

exports.getRegisterPage = async function(req,res)
{
    var checkout = req.query.checkout;
    var propertyId = req.query.propertyId;
    var guests = req.query.guests;
    var fromDate = req.query.fromDate;
    var toDate = req.query.toDate;
    checkout = (checkout) ? true : false;

    res.render('register',{user:req.user,checkout:checkout,propertyId:propertyId,guests:guests,
                    fromDate:fromDate,toDate:toDate});
}


// exports.getRegisterPage = async function(req,res)
// {
//     var displayCookieMessage = req.body.displayCookieMessage;
    
//     var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
//     var discounts = await discountController.getDiscountByName('Free Shipping');
//     var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
//     var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
//     var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');
//     res.render('register',{user:req.user,displayCookieMessage:displayCookieMessage,discounts:discounts,
//         numberOfBasketItems:numberOfBasketItems[0],basketTotal:numberOfBasketItems[1],basketItems:numberOfBasketItems[2],
//         clothingProductTypes:clothingProductTypes,accessoriesProductTypes:accessoriesProductTypes,cdsVinylProductTypes:cdsVinylProductTypes});
// }

exports.captcha = async function(req,res)
{
    var captcha = req.body.captcha;
    if(!captcha)
    {
      return res.json({error:'Token not defined'});
    }

    const query = stringify({
        secret: secretKey,
        response: req.body.captcha,
        remoteip: req.connection.remoteAddress
      });
    const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

    const body = await fetch(verifyURL).then(res => res.json());

 
    if(!(body.success) || body.score < 0.4)
    {
        return res.json({error:'You might be a robot, sorry!! You are banned!',score:body.score});
    }

    return res.json({});

}

// exports.addAdmin = async (req, res, next)=>{
//     let errors = {};
    
//     return validateUser(errors, req).then(async errors=>{
 
//             if(!isEmpty(errors))
//             {
//                 // reRender the sign up page with the errors
//                 console.log(errors);
//                 rerender_adminRegister(errors,req,res);
//             }
//             else
//             {
//                 var emailRegister =  req.body.emailRegister;
//                 models.idGenerator.findOne({
//                     where:{
//                         entity:'account'
//                     }
//                 }).then(async idGenerator=>{
//                     var nextId = idGenerator.nextId;
                
//                     await models.account.create({
//                         id:nextId,
//                         email: req.body.email,
//                         password: generateHash(req.body.password),
//                         accountTypeFk: 1,
//                         createdDttm:Date.now(),
//                         defaultPassword:false,
//                         dummyFl:false,
//                         mailingListFl:(emailRegister == undefined || emailRegister == 'off') ? false : true,
//                         deleteFl:false,
//                         versionNo:1
//                     });
                
//                     models.idGenerator.update({
//                         nextId:nextId +1,
//                         versionNo:idGenerator.versionNo + 1
//                     },
//                     {
//                         where:{
//                             entity:'account'
//                         }
//                     }).then(()=>{
//                         req.body['admin'] = true;
//                     passport.authenticate('local', {
//                             successRedirect:'/adminAccount?id=' + nextId,
//                             failureRedirect:'/addAdmin',
//                             failureFlash: true
//                         })(req, res, next); 
//                     })
//                 })

                                          
//               }
//            });
//  }

 
async function rerender_register(errors,req, res)
{
    // var displayCookieMessage = req.body.displayCookieMessage;
    
    // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
    // var discounts = await discountController.getDiscountByName('Free Shipping');
    // var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
    // var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
    // var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');
    res.render('register',{ errors:errors,user:req.user});
}

// async function rerender_adminRegister(errors,req, res)
// {
//     var lowStockResult = await adminController.lowStock();
//     res.render('addAdmin',{ errors:errors,user:req.user,lowStockResult:lowStockResult});
// }

exports.register = async function(req,res,next)
{
    let errors = {};
    
    return validateUser(errors, req).then(async errors=>{
 
            if(!isEmpty(errors))
            {
                // reRender the sign up page with the errors
                console.log(errors);
                rerender_register(errors,req,res);
            }
            else
            {
                var emailRegister =  req.body.emailRegister
                await models.account.create({
                        email: req.body.email,
                        name:req.body.name,
                        password: generateHash(req.body.password),
                        accountTypeFk: 2,
                        createdDttm:Date.now(),
                        defaultPassword:false,
                        dummyFl:false,
                        mailingListFl:(emailRegister == undefined || emailRegister == 'off') ? false : true,
                        deleteFl:false,
                        versionNo:1
                    });
                // req.cookies =[];
                // res.clearCookie('reggae_masters_user_data');
            
    
                // await workerQueue.add({process:'registrationEmail',email:req.user.email});
     
                    // await workerQueue.add({process:'parentRegistrationEmail',email:req.body.email});
                    // await workerQueue.add({process:'parentRegistrationEmailToBluwave',email:req.body.email,telephoneNo:telephoneNo,name:name});
                    
                    // authenticate with passport
                var checkout = req.body.checkout;
                var successRedirect = '/myAccount';
                var failureRedirect = '/register';
                if(checkout != undefined && checkout != null)
                {
                    var propertyId = req.body.propertyId;
                    var guests = req.body.guests;
                    var fromDate = req.body.fromDate;
                    var toDate = req.body.toDate;

                    successRedirect = '/property?id=' + propertyId + '&guests=' + guests + '&fromDate=' + fromDate + '&toDate=' + toDate;
                    failureRedirect = '/register?propertyId=' + propertyId + '&guests=' + guests + '&fromDate=' + fromDate + '&toDate=' + toDate;
                }
                
                passport.authenticate('local', {
                    successRedirect:successRedirect,
                    failureRedirect:failureRedirect,
                    failureFlash: true
                })(req, res, next);                   
              }
           });
}

exports.addAdmin = async (req, res, next)=>{
    let errors = {};
    
    return validateUser(errors, req).then(async errors=>{
 
            if(!isEmpty(errors))
            {
                // reRender the sign up page with the errors
                console.log(errors);
                rerender_adminRegister(errors,req,res);
            }
            else
            {
                var emailRegister =  req.body.emailRegister;
            
                await models.account.create({
                    name:req.body.name,
                    email: req.body.email,
                    password: generateHash(req.body.password),
                    accountTypeFk: 1,
                    createdDttm:Date.now(),
                    defaultPassword:false,
                    dummyFl:false,
                    mailingListFl:(emailRegister == undefined || emailRegister == 'off') ? false : true,
                    deleteFl:false,
                    versionNo:1
                });
                
                
                req.body['admin'] = true;
                passport.authenticate('local', {
                        successRedirect:'/adminAccount?id=' + nextId,
                        failureRedirect:'/addAdmin',
                        failureFlash: true
                    })(req, res, next);                               
              }
           });
 }

 async function rerender_adminRegister(errors,req, res)
{
    // var lowStockResult = await adminController.lowStock();
    res.render('addAdmin',{ errors:errors,user:req.user});
}
