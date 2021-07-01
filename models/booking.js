module.exports = function(sequelize, Sequelize) {
 
    var Booking = sequelize.define('booking', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        propertyFk: {
            type: Sequelize.INTEGER,
            allowNull:false
        },

        accountFk: {
            type: Sequelize.INTEGER,
            allowNull:false
        },

        fromDt:{
            type: Sequelize.DATE,
            allowNull:false
        },

        toDt:{
            type: Sequelize.DATE,
            allowNull:false
        },

        bookingDttm:{
            type: Sequelize.DATE,
            allowNull:false
        },

        guests:{
            type:Sequelize.INTEGER,
            allowNull:false
        },

        nights:{
            type:Sequelize.INTEGER,
            allowNull:false
        },

        cost:{
            type: Sequelize.STRING,
            allowNull:false
        },

        status:{
            type: Sequelize.STRING,
            allowNull:false
        },

        confirmationCode:{
            type:Sequelize.STRING,
            allowNull:true
        },

        propertySyncFk:{
            type:Sequelize.INTEGER,
            allowNull:true
        },
        
        cancelledDttm:{
            type:Sequelize.DATE,
            allowNull:true
        },
    
        paymentProcessorOrderId:{
            type:Sequelize.STRING,
            allowNull:true
        },

        deleteFl:{
            type: Sequelize.BOOLEAN,
            allowNull:false
        },

        versionNo:{
            type: Sequelize.INTEGER,
            allowNull:false
        }


    },{
        timestamps:false
    }
);
 
    return Booking;
 
}