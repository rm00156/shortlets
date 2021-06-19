module.exports = function(sequelize, Sequelize) {
 
    var City = sequelize.define('city', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        name:{
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
 
    return City;
 
}