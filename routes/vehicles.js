require('dotenv').config();
const express = require('express');
const { Vehicle } = require('../models/models');
const { appendImages } = require("../utils/utilFunctions");
const { Op } = require('sequelize');

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get('', async (req, res) => {
            const { limit = 50, page = 0, country, type, era, isPremium, isGift, killstreak } = req.query;
            const user_limit = Math.min(limit, 300);

            const filter = {};
            if (country) filter.country = country;
            if (type) filter.vehicle_type = type;
            if (era) filter.era = era;
            if (isPremium) filter.is_premium = isPremium;
            if (isGift) filter.is_gift = isGift;

            const identifierFilters = [];
            if (!killstreak) identifierFilters.push({ [Op.notLike]: '%killstreak' });
            if (identifierFilters.length > 0) filter.identifier = { [Op.and]: identifierFilters };

            const attributes = ['identifier', 'country', 'vehicle_type', 'era', 'arcade_br', 'realistic_br', 'simulator_br', 'event', 'release_date', 'is_premium', 'is_gift', 'value', 'req_exp', 'ge_cost'];
            try {
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