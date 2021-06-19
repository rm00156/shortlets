const passport = require('passport');
exports.getLoginPage = async function(req,res)
{
    var reset = req.query.reset == 'success' ? true :false;
    var checkout = req.query.checkout;
    var propertyId = req.query.propertyId;
    var guests = req.query.guests;
    var fromDate = req.query.fromDate;
    var toDate = req.query.toDate;
    checkout = (checkout) ? true : false;
    // var displayCookieMessage = req.body.displayCookieMessage;
    
    // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
    // var discounts = await discountController.getDiscountByName('Free Shipping');
    // var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
    // var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
    // var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');
    
    res.render('login',{user:req.user,reset:reset,checkout:checkout,propertyId:propertyId,guests:guests,
                        fromDate:fromDate,toDate:toDate});
}

exports.logout = function(req, res)
{
    req.logout();
    req.session.destroy();
    res.redirect('/');
}


exports.login = function(req,res,next)
{
    passport.authenticate('local', (err,user,info)=> {
        if(err)
            return next(err);
        
        if(!user)
            return render_login(req,res);

        req.logIn(user,async (err)=>{

            if(err)
                return next(err);
            
            
            // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
            // var basketItems = numberOfBasketItems[2];
            // if(basketItems.length > 0 && req.user.dummyFl)
            // {
            //      var basketItemIds = new Array();
            //     basketItems.forEach(element => {
            //         basketItemIds.push(element.id);
            //     });
            //     await basketController.updateBasketItemsForAccount(basketItemIds,user.id);
            // }
            var checkout = req.body.checkout;
            var successRedirect = '/myAccount';
            if(checkout != undefined && checkout != null)
            {
                var propertyId = req.body.propertyId;
                var guests = req.body.guests;
                var fromDate = req.body.fromDate;
                var toDate = req.body.toDate;

                successRedirect = '/property?id=' + propertyId + '&guests=' + guests+ '&fromDate=' + fromDate + '&toDate=' + toDate;
            }
            return res.redirect(successRedirect);

        })
                
    })(req,res,next);
       
}


exports.adminLogin = function(req,res,next)
{
    req.body["admin"] = true;
    passport.authenticate('local', (err,user,info)=> {
        if(err)
            return next(err);
        
        if(!user)
            return render_AdminLogin(req,res);

                
        req.logIn(user, (err)=>{

            if(err)
                return next(err);
            
            return res.redirect('/adminDashboard');

        })
                
    })(req,res,next);
       
}

const render_AdminLogin = function( req,res)
{
    res.render('adminLogin', {error:'You have entered an invalid username or password'});
}

const render_login = async function(req,res)
{
    // var displayCookieMessage = req.body.displayCookieMessage;
    // var discounts = await discountController.getDiscountByName('Free Shipping');
    // var numberOfBasketItems = await basketController.getNumberOfBasketItems(req.user.id);
    // var clothingProductTypes = await productController.getProductTypesByProductTypeGroupName('Clothing');
    // var accessoriesProductTypes = await productController.getProductTypesByProductTypeGroupName('Accessories');
    // var cdsVinylProductTypes = await productController.getProductTypesByProductTypeGroupName('Cds/Vinyl');
    
    res.render((req.body.checkout == undefined ) ? 'login' : 'checkoutLogin', {error:'You have entered an invalid username or password'});
}
