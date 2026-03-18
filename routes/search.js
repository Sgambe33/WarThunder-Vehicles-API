const express = require('express');
const { Vehicle } = require('../models/models');
const { Op } = require("sequelize");

module.exports = {
    base_route: '/vehicles/search',
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get('/:name', async (req, res) => {
            try {
                const { name } = req.params;
                const queryResult = await Vehicle.findAll({
                    attributes: ['identifier'],
                    raw: true,
                    where: {
                        identifier: {
                            [Op.like]: `%${name.replace('-', '_')}%`,
                        },
                    },
                });
                const found = queryResult.length > 0;
                res.status(found ? 200 : 404).json(
                    found
                        ? queryResult.map(doc => doc.identifier)
                        : { message: "No vehicles found" }
                );
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        return route;
    }
};