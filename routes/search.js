const express = require('express');
const { Vehicle } = require('../models/models');
const {Op} = require("sequelize");

module.exports = {
    base_route: '/vehicles/search',
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get('/:name', async (req, res) => {
            try {
                const name = req.params.name.replace('-', '_');
                const queryResult = await Vehicle.findAll({
                    where: {
                        identifier: {
                            [Op.iLike]: `%${name}%`,
                        },
                    },
                });
                if (queryResult.length === 0) {
                    res.status(404).json({ message: "No vehicles found" });
                } else {
                    res.status(200).json(queryResult.map(doc => doc.dataValues.identifier));
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        return route;
    }
};
