const models = require('../models');

exports.isAdmin = async function(req,res,next)
{
    var account = req.user;
    if(account)
    {
        account = await models.account.findOne({
            where:{
                id:account.id,
                deleteFl:false
            }
        });
    
        if(account.accountTypeFk == 1)
            next();
        else
            res.redirect('/');
        
    }
    else
        res.redirect('/');
}