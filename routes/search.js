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
                    where: {
                        identifier: {
                            [Op.like]: `%${name.replace('-', '_')}%`,
                        },
                    },
                });
                res.status(queryResult.length === 0 ? 404 : 200).json(
                    queryResult.length === 0
                        ? { message: "No vehicles found" }
                        : queryResult.map(doc => doc.dataValues.identifier)
                );
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        return route;
    }
};