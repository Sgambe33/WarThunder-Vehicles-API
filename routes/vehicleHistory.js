require('dotenv').config();
const express = require('express');
const {Vehicle, VehicleOld} = require('../models/models');
const {Op} = require("sequelize");
const {latestVersion, appendImages} = require("../utils/utilFunctions");
const {VERSION_REGEX} = require("../utils/constants");

module.exports = {
    base_route: '/vehicles', handler: () => {
        const route = express.Router({caseSensitive: false});

        route.get('/:id/:version', async (req, res) => {
            try {
                const liveVersion = await latestVersion();
                if (liveVersion === req.params.version) {
                    let queryResult = await Vehicle.findOne({where: {identifier: {[Op.like]: req.params.id}}});
                    queryResult = appendImages(queryResult, req);
                    res.status(queryResult ? 200 : 404).json(queryResult || {error: 'Vehicle not found'});

                } else if (VERSION_REGEX.test(req.params.version)) {
                    let queryResult = await VehicleOld.findOne({
                        where: {
                            identifier: {[Op.like]: req.params.id}, version: req.params.version
                        }
                    });
                    queryResult = appendImages(queryResult, req);
                    res.status(queryResult ? 200 : 404).json(queryResult || {error: 'Vehicle or version not found'});
                } else {
                    res.status(400).json({error: 'Invalid version provided'});
                }
            } catch (err) {
                res.status(500).json({error: err.message});
            }
        });
        return route;
    }
};
