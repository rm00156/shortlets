module.exports = function(sequelize, Sequelize) {
 
    var PropertySync = sequelize.define('propertySync', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        propertyFk: {
            type: Sequelize.INTEGER,
            allowNull:false
        },
        name:{
            type:Sequelize.STRING,
            allowNull:false
        },

        url:{
            type:Sequelize.STRING,
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
 
    return PropertySync;
 
}