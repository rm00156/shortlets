module.exports = function(sequelize, Sequelize) {
 
    var Property = sequelize.define('property', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        name: {
            type: Sequelize.STRING,
            allowNull:false
        },

        description: {
            type: Sequelize.TEXT,
            allowNull:false
        },

        pricePerDay:{
            type: Sequelize.STRING,
            allowNull:false
        },

        guests:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        beds:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        bedrooms:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        bathrooms:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        advanceNotice:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        displayImage1:{
            type: Sequelize.STRING,
            allowNull:false
        },

        displayImage2:{
            type: Sequelize.STRING,
            allowNull:true
        },

        displayImage3:{
            type: Sequelize.STRING,
            allowNull:true
        },

        displayImage4:{
            type: Sequelize.STRING,
            allowNull:true
        },

        displayImage5:{
            type: Sequelize.STRING,
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
 
    return Property;
 
}