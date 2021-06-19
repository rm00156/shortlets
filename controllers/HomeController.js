const models = require('../models');
const adminController = require('../controllers/AdminController');
const sequelize = require('sequelize');
const config = require('../config/config.json');
const propertyController = require('../controllers/PropertyController');
const ical = require('node-ical');

exports.getHome = async function(req,res){

    var cities = await propertyController.getAllCitiesWithProperties();
    var towns = await getAllTowns();
    var properties = await getRandomProperties();
    res.render('home', {user:req.user,cities:cities,towns:towns[0],properties:properties[0]});
}

exports.getTestHome = async function(req,res){

    var cities = await propertyController.getAllCitiesWithProperties();
    var towns = await getAllTowns();
    var properties = await getRandomProperties();
    res.render('home_original', {user:req.user,cities:cities,towns:towns[0],properties:properties[0]});
}

exports.getAllTowns = async function()
{
    return await getAllTowns();
}

async function getAllTowns()
{
    return await models.sequelize.query('select * from towns where deleteFl = false ORDER BY name asc LIMIT 6');
}

async function getRandomProperties()
{
    return await models.sequelize.query('select * from properties p where deleteFl = false order by rand() LIMIT 6');
}