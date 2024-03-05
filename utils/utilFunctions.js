const {Vehicle} = require('../models/models');

async function latestVersion(){
    const randomVehicle = await Vehicle.findOne();
    return randomVehicle.dataValues.version;
}

function appendImages(queryResult, req){
    if (queryResult === null) return null;
    queryResult.dataValues.images = {
        image: `${req.get('host')}/assets/images/${queryResult.dataValues.identifier.toLowerCase()}.png`,
        techtree: `${req.get('host')}/assets/techtrees/${queryResult.dataValues.identifier.toLowerCase()}.png`
    };
    return queryResult;
}

module.exports = {
    latestVersion,
    appendImages
}