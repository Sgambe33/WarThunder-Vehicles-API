require('dotenv').config();
const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { Vehicle } = require("../models/models");

const { fn, col } = Sequelize;

module.exports = {
    base_route: '/vehicles/stats',
    handler: () => {
        const route = express.Router({ caseSensitive: false });
        route.get('', async (req, res) => {
            try {
                const attributes = [
                    'country',
                    [fn('SUM', col('value')), 'total_value'],
                    [fn('SUM', col('req_exp')), 'total_req_exp'],
                    [fn('COUNT', col('identifier')), 'total_vehicles']
                ];
                const queryResult = await Vehicle.findAll({
                    attributes,
                    where: {
                        identifier: {
                            [Op.notLike]: "%killstreak%",
                        },
                        is_gift: false,
                        is_premium: false
                    },
                    group: ['country']
                });
                res.status(200).json(queryResult);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        return route;
    }
};