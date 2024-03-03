require('dotenv').config();
const express = require('express');
const {Vehicle} = require('../models/models');
const {Op} = require("sequelize");

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({caseSensitive: false});

        route.get('/:id', async (req, res) => {
            try {
                const queryResult = await Vehicle.findOne({where: {identifier: {[Op.like]: req.params.id}}});
                if (queryResult) {
                    queryResult.dataValues.images = {
                        image: `${req.get('host')}/assets/images/${queryResult.dataValues.identifier.toLowerCase()}.png`,
                        techtree: `${req.get('host')}/assets/techtrees/${queryResult.dataValues.identifier.toLowerCase()}.png`
                    };
                    res.status(200).json(queryResult);
                } else {
                    res.status(404).json({error: 'Vehicle not found'});
                }
            } catch (err) {
                res.status(500).json({error: err.message});
            }
        });
        return route;
    }
};
