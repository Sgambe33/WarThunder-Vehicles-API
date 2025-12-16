const { Vehicle } = require('../models/models');

async function latestVersion() {
    const versions = await Vehicle.findAll({
        attributes: ['version'],
        group: ['version']
    });

    const sortedVersions = versions
        .map(v => v.version)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return sortedVersions[sortedVersions.length - 1];
}

function appendImages(queryResult, req) {
    if (queryResult === null) return null;
    queryResult.dataValues.images = {
        image: `https://${req.get('host')}/assets/images/${queryResult.dataValues.identifier.toLowerCase()}.png`,
        techtree: `https://${req.get('host')}/assets/techtrees/${queryResult.dataValues.identifier.toLowerCase()}.png`
    };
    return queryResult;
}

module.exports = {
    latestVersion,
    appendImages
}