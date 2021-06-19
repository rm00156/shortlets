let LocalStrategy = require('passport-local').Strategy;
let bcrypt = require('bcryptjs');
let models = require('./models');

module.exports= function(passport)
{
    passport.serializeUser((user, done)=>{
        done(null,user.id);
    });

    passport.deserializeUser((id,done) =>{
        models.account.findOne({
            where:{
                id:id
            }
        }).then(user=>{
            if(user== null)
                done( new Error('Wrong account id'));

            done(null,user);
            
        });
    });

    passport.use(new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback: true
    }, (req,email,password,done)=>{
        return models.account
        .findOne({
            where: {
                email:email,
                deleteFl:false
            }
        }).then(user=>{

            if(user == null )
            {
                req.flash('message', 'Incorrect Credentials');
                return done(null,false);
            }
            else if( user.password == null || user.password == undefined)
            {
                req.flash('message', 'You must reset your password');
                return done(null, false);
            }
            else if(!validPassword(user, password))
            {
                req.flash('message', 'Incorrect credentials');
                return done(null,false);
            }

            return done(null,user);
        }).catch(err=>{
            done(err,false);
        });
    }));

    const validPassword = function(user, password)
    {
        return bcrypt.compareSync(password, user.password);
    }
}