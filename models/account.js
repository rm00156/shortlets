module.exports = function(sequelize, Sequelize) {
 
    var Account = sequelize.define('account', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        name:{
            type:Sequelize.STRING,
            allowNull:false,
        },

        email: {
            type: Sequelize.STRING,
            allowNull:false
        },

        password:{
            type: Sequelize.STRING,
            allowNull: false
        },

        accountTypeFk: {
            type:Sequelize.INTEGER,
            allowNull:false
        },
        
        createdDttm: {
            field:'createdDttm',
            type: Sequelize.DATE,
            default: Date.now()
        },
        
        defaultPassword:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
            default:false
        },

        dummyFl:{
            type:Sequelize.BOOLEAN,
            allowNull:false
        },
        mailingListFl:{
            type:Sequelize.BOOLEAN,
            allowNull:false 
        },
        closedDttm:{
            type:Sequelize.DATE,
            allowNull:true
        },
        deleteFl:{
            type:Sequelize.BOOLEAN,
            allowNull:false
        },

        versionNo:{
            type:Sequelize.INTEGER,
            allowNull:false
        }
    },{
        timestamps:false
    }
);
 
    return Account;
 
}