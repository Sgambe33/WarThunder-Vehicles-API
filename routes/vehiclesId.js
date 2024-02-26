require('dotenv').config();
const express = require('express');
const {Vehicle} = require('../models/models');

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({caseSensitive: false});

        route.get('/:id', async (req, res) => {
            try {
                const queryResult = await Vehicle.findOne({where: {identifier: req.params.id}});
                if (queryResult) {
                    queryResult.dataValues.images = {
                        image: `${req.get('host')}/assets/images/${queryResult.dataValues.identifier}.png`,
                        techtree: `${req.get('host')}/assets/techtrees/${queryResult.dataValues.identifier}.png`
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
