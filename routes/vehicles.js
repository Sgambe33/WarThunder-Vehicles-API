require('dotenv').config();
const express = require('express');
const { Vehicle } = require('../models/models');
const { appendImages } = require("../utils/utilFunctions");
const { Op } = require('sequelize');
const { EVENT_VEHICLES } = require('../utils/constants');

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get('', async (req, res) => {
            const { limit = 200, page = 0, country, type, era, isPremium, isPack, isSquadronVehicle, isOnMarketplace, excludeKillstreak = "true", excludeEventVehicles = "true" } = req.query;
            const user_limit = Math.min(limit, 200);

            const filter = {};
            if (country) filter.country = country;
            if (type) {
                const typesArray = Array.isArray(type) ? type : type.split(',');
                filter.vehicle_type = { [Op.in]: typesArray };
            } if (era) filter.era = era;
            if (isPremium) filter.is_premium = isPremium === 'true';
            if (isPack) filter.is_pack = isPack === 'true';
            if (isSquadronVehicle) filter.squadron_vehicle = isSquadronVehicle === 'true';
            if (isOnMarketplace) filter.on_marketplace = isOnMarketplace === 'true';

            const identifierFilters = [];
            if (excludeEventVehicles === 'true') identifierFilters.push({ [Op.notIn]: EVENT_VEHICLES });
            if (excludeKillstreak) identifierFilters.push({ [Op.notLike]: '%killstreak' });
            if (identifierFilters.length > 0) filter.identifier = { [Op.and]: identifierFilters };

            const attributes = ['identifier', 'country', 'vehicle_type', 'vehicle_sub_types', 'era', 'arcade_br', 'realistic_br', 'realistic_ground_br', 'simulator_br', 'simulator_ground_br', 'event', 'release_date', 'is_premium', 'is_pack', 'on_marketplace', 'squadron_vehicle', 'value', 'req_exp', 'ge_cost', 'sl_mul_arcade', 'sl_mul_realistic', 'sl_mul_simulator', 'exp_mul', 'crew_total_count', 'visibility', 'hull_armor', 'turret_armor'];
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