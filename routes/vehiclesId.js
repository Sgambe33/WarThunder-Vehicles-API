require('dotenv').config();
const express = require('express');
const {Vehicle, VehicleOld} = require('../models/models');
const {Op} = require("sequelize");
const {appendImages} = require("../utils/utilFunctions");

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({caseSensitive: false});

        route.get('/:id', async (req, res) => {
            try {
                let queryResult = await Vehicle.findOne({where: {identifier: {[Op.like]: req.params.id}}});
                const versions = await VehicleOld.findAll({
                    attributes: ['version'],
                    where: {
                        identifier: {[Op.like]: req.params.id}
                    }
                });
                if (queryResult && versions.length > 0) {
                    queryResult.dataValues.versions = versions.map(v => v.dataValues.version);
                    queryResult.dataValues.versions.push(queryResult.dataValues.version);
                    queryResult = appendImages(queryResult, req);
                }
                res.status((queryResult && (versions.length > 0)) ? 200 : 404).json(queryResult || {error: 'Vehicle not found'});

            } catch (err) {
                res.status(500).json({error: err.message});
            }
        });
        return route;
    }
};
