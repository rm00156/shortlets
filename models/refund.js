module.exports = function(sequelize, Sequelize) {
 
    var Refund = sequelize.define('refund', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        refundTypeFk: {
            type: Sequelize.INTEGER,
            allowNull:false
        },

        createdDttm:{
            type:Sequelize.DATE,
            allowNull:false
        },

        amount:{
            type:Sequelize.STRING,
            allowNull:false
        },
        
        bookingFk:{
            type:Sequelize.INTEGER,
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
 
    return Refund;
 
}