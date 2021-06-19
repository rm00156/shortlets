module.exports = function(sequelize, Sequelize) {
 
    var AccountType = sequelize.define('accountType', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        type: {
            type: Sequelize.STRING,
            allowNull:false
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
 
    return AccountType;
 
}