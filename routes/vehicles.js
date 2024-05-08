require('dotenv').config();
const express = require('express');
const { Vehicle } = require('../models/models');
const { appendImages } = require("../utils/utilFunctions");

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get('', async (req, res) => {
            try {
                const { limit = 50, page = 0, country, type, era, isPremium, isGift } = req.query;
                const user_limit = Math.min(parseInt(limit), 200);

                // Only include filter parameters if they are defined
                const filter = {};
                if (country) filter.country = country;
                if (type) filter.vehicle_type = type;
                if (era) filter.era = era;
                if (isPremium) filter.is_premium = isPremium;
                if (isGift) filter.is_gift = isGift;

                const attributes = ['identifier', 'country', 'vehicle_type', 'era', 'arcade_br', 'realistic_br', 'simulator_br', 'event', 'release_date', 'is_premium', 'is_gift', 'value', 'req_exp', 'ge_cost'];
                const vehicles = await Vehicle.findAll({
                    where: filter,
                    limit: user_limit,
                    attributes,
                    order: [['identifier', 'ASC']],
                    offset: page * user_limit
                });
                const vehiclesWithImages = vehicles.map(v => appendImages(v, req));
                res.status(200).json(vehiclesWithImages);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        return route;
    }
};

