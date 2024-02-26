require('dotenv').config();
const express = require('express');
const {Vehicle} = require('../models/models');

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({caseSensitive: false});

        route.get('', async (req, res) => {
                try {
                    const user_limit = Math.min(parseInt(req.query.limit) || 50, 200);
                    const {country, type, rank, isPremium, isGift} = req.query;
                    const filter = {};
                    if (country) filter.country = country;
                    if (type) filter.vehicle_type = type;
                    if (rank) filter.rank = rank;
                    if (isPremium) filter.is_premium = isPremium;
                    if (isGift) filter.is_gift = isGift;
                    const vehicles = await Vehicle.findAll({
                        where: filter,
                        limit: user_limit
                    });
                    vehicles.forEach((v) => {
                        v.dataValues.images = {
                            image: `${req.get('host')}/assets/images/${v.dataValues.identifier}.png`,
                            techtree: `${req.get('host')}/assets/techtrees/${v.dataValues.identifier}.png`
                        };
                    });
                    res.status(200).json(vehicles);
                } catch
                    (err) {
                    res.status(500).json({error: err.message});
                }
            }
        )
        ;
        return route;
    }
}
;

