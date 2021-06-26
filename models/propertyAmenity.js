module.exports = function(sequelize, Sequelize) {
 
    var PropertyAmenity = sequelize.define('propertyAmenity', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        propertyFk:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        amenityFk:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        checkedFl:{
            type: Sequelize.BOOLEAN,
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
 
    return PropertyAmenity;
 
}