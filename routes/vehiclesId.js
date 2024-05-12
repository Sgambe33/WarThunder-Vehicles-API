require('dotenv').config();
const express = require('express');
const {Vehicle, VehicleOld} = require('../models/models');
const {Op} = require("sequelize");
const {appendImages} = require("../utils/utilFunctions");

const findVehicle = async (model, id) => {
    return await model.findOne({
        where: {identifier: {[Op.like]: id}}
    });
}

module.exports = {
    base_route: '/vehicles', handler: () => {
        const route = express.Router({caseSensitive: false});

        route.get('/:id', async (req, res) => {
            const {id} = req.params;
            try {
                let queryResult = await findVehicle(Vehicle, id);
                const versions = await VehicleOld.findAll({
                    attributes: ['version'], where: {identifier: {[Op.like]: id}}
                });
                if (queryResult) {
                    queryResult.dataValues.versions = versions.map(v => v.dataValues.version);
                    queryResult.dataValues.versions.push(queryResult.dataValues.version);
                    queryResult = appendImages(queryResult, req);
                }
                res.status(queryResult ? 200 : 404).json(queryResult || {error: 'Vehicle not found'});
            } catch (err) {
                res.status(500).json({error: err.message});
            }
        });
        return route;
    }
};