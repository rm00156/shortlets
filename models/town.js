module.exports = function(sequelize, Sequelize) {
 
    var Town = sequelize.define('town', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        name:{
            type: Sequelize.STRING,
            allowNull:false
        },

        cityFk:{
            type: Sequelize.INTEGER,
            allowNull:false
        },

        imagePath:{
            type: Sequelize.TEXT,
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
 
    return Town;
 
}