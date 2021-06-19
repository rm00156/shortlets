const models = require('../models');
const passport = require('passport');
const signUpController = require('../controllers/SignUpController');
exports.getUser = async function(req,res,next)
{
    // create table id generator
    // id entity ,nextId

    // first check whether the user is logged in
    // if the user is logged in 
    // check whether the account is a dummy account
    // if its dummy check the user cookie permission
    // if no permission response display message
    // else check whether their is a cookie present on the users pc
    // if cookie present 
    // log the user into their account
    // next()
    // else
    // create a dummy account using the id generator with dummy email and dummy password
    var account = req.user;
    var date = Date.now();
    if(account)
    {
        // logged in 

        if(account.dummyFl == true)
        {
            models.cookiePermission.findOne({
                where:{
                    accountFk:account.id
                }
            }).then(cookiePermission=>{

                if(cookiePermission == null)
                {
                    // add a property so that cookie message is displayed;
                    req.body['displayCookieMessage'] = true;
                    next();
                }
                else
                {
                    next();
                }
            })
        }
        else
        {
            next();
        }
    }
    else
    {
        // not logged in
        var cookie = req.cookies['hyde_user_data'];
        if(cookie)
        {
            var id = cookie.id;
            models.account.findOne({
                where:{
                    id:id,
                    deleteFl:false
                }
            }).then(account=>{

                req.body['email'] = account.email;
                req.body['password'] = 'welcome';
                passport.authenticate('local', (err,user,info)=> {
                    if(err)
                        return next(err);
                    
                    
                    req.logIn(user,async (err)=>{
            
                        if(err)
                            return next(err);

                        next();
                        });
                })(req,res,next);


            })
        }
        else
        {
            // no cookie
            models.idGenerator.findOne({
                where:{
                    entity:'account'
                }
            }).then(idGenerator=>{

                var nextId = idGenerator.nextId;
                var password = signUpController.generateHash('welcome');
                models.account.create({
                    id: nextId,
                    email:'temp'+ nextId,
                    password:password,
                    accountTypeFk:2,
                    defaultPassword:false,
                    createdDttm:date,
                    mailingListFl:false,
                    deleteFl:false,
                    versionNo:1,
                    dummyFl:true
                }).then(newAccount=>{
                    models.idGenerator.findOne({
                        where:{
                            entity:'account'
                        }
                    }).then(idGenerator=>{

                        models.idGenerator.update({
                            nextId:nextId +1,
                            versionNo:idGenerator.versionNo + 1
                        },
                        {
                            where:{
                                entity:'account'
                            }
                        }).then(()=>{
    
                            req.body['email'] = newAccount.email;
                            req.body['password'] = 'welcome';
                            console.log(newAccount.email)
                            passport.authenticate('local', (err,user,info)=> {
                                if(err)
                                    return next(err);
                                
                                
                                req.logIn(user,async (err)=>{
                        
                                    if(err)
                                        return next(err);
                                    req.body['displayCookieMessage'] = true;
                                    next();
                                    });
                            })(req,res,next);
    
                        
                        })
                    })
                                     
                   
                })
            })
            
        }
    }
}    
    
