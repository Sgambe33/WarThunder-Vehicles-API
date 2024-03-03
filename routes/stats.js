require('dotenv').config();
const express = require('express');
const {Sequelize, Op} = require('sequelize');
const {Vehicle} = require("../models/models");

module.exports = {
    base_route: '/vehicles/stats',
    handler: () => {
        const route = express.Router({caseSensitive: false});
        route.get('', async (req, res) => {
            try {
                const queryResult = await Vehicle.findAll({
                    attributes: [
                        'country',
                        [Sequelize.fn('SUM', Sequelize.col('value')), 'total_value'],
                        [Sequelize.fn('SUM', Sequelize.col('req_exp')), 'total_req_exp'],
                        [Sequelize.fn('COUNT', Sequelize.col('identifier')), 'total_vehicles']
                    ],
                    where: {
                        identifier: {
                            [Op.notLike]: "%killstreak%",
                        },
                        is_gift: false,
                        is_premium: false
                    },
                    group: ['country']
                })
                res.status(200).json(queryResult);
            } catch (error) {
                res.status(500).json({message: error.message});
            }
        });
        return route;
    }
};
