require('dotenv').config();
const express = require('express');
const { Vehicle, VehicleOld } = require('../models/models');
const { Op } = require("sequelize");
const { latestVersion, appendImages } = require("../utils/utilFunctions");
const { VERSION_REGEX } = require("../utils/constants");

const sendResponse = async (model, id, version, req, res) => {
    let queryResult = await model.findOne({
        where: {
            identifier: { [Op.like]: id },
            ...(version && { version })
        }
    });
    queryResult = appendImages(queryResult, req);
    res.status(queryResult ? 200 : 404).json(queryResult || { error: 'Vehicle not found' });
}

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get('/:id/:version', async (req, res) => {
            const { id, version } = req.params;
            try {
                const liveVersion = await latestVersion();
                if (liveVersion === version) {
                    await sendResponse(Vehicle, id, null, req, res);
                } else if (VERSION_REGEX.test(version)) {
                    await sendResponse(VehicleOld, id, version, req, res);
                } else {
                    res.status(400).json({ error: 'Invalid version provided' });
                }
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        return route;
    }
};