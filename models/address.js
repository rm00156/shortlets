module.exports = function(sequelize, Sequelize) {
 
    var Address = sequelize.define('address', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        propertyFk:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        addressLine1: {
            type: Sequelize.STRING,
            allowNull:false
        },

        addressLine2: {
            type: Sequelize.STRING,
            allowNull:true
        },

        townFk:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        cityFk:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        postCode:{
            type: Sequelize.STRING,
            allowNull:false
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
 
    return Address;
 
}