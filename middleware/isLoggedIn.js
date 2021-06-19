exports.isLoggedInCustomer = function(req,res,next)
{
    if(req.user && req.user.accountTypeFk == 2)
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
}

exports.isLoggedInToCheckout = function(req,res,next)
{
    if(req.user)
    {
        next();
    }
    else
    {
        var propertyId = req.query.propertyId;
        var guests = req.query.guests;
        var fromDate = req.query.fromDate;
        var toDate = req.query.toDate;
        res.redirect('/register?checkout=true&propertyId=' + propertyId + '&guests=' + guests + '&fromDate=' + fromDate + 
        '&toDate=' + toDate );
    }
}

exports.isLoggedIn = function(req,res,next)
{
    if(req.user)
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
}