module.exports = function(sequelize, Sequelize) {
 
    var Company = sequelize.define('company', {
 
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
 
        name: {
            type: Sequelize.STRING,
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
 
    return Company;
 
}