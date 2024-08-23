require('dotenv').config();
const express = require('express');
const { EVENT_VEHICLES } = require('../utils/constants');
const { Vehicle, VehicleOld } = require('../models/models');
const { Op, fn, col } = require('sequelize');

module.exports = {
    base_route: '/vehicles/stats',
    handler: () => {
        const router = express.Router({ caseSensitive: false });

        router.get('', async (req, res) => {
            try {
                const commonWhere = {
                    identifier: {
                        [Op.notIn]: EVENT_VEHICLES,
                        [Op.notLike]: '%killstreak'
                    }
                };

                const [countryStatsQuery, vehicleStatsQuery, totalPremiumVehicles, totalGeRequired, currentVersions, oldVersions, geCostByCountry] = await Promise.all([
                    Vehicle.findAll({
                        attributes: [
                            'country',
                            [fn('SUM', col('value')), 'total_value'],
                            [fn('SUM', col('req_exp')), 'total_req_exp'],
                        ],
                        where: { ...commonWhere, is_premium: false, on_marketplace: false, is_pack: false },
                        group: ['country']
                    }),
                    Vehicle.findAll({
                        attributes: [
                            'country',
                            'vehicle_type',
                            [fn('COUNT', col('identifier')), 'total_vehicles']
                        ],
                        where: commonWhere,
                        group: ['country', 'vehicle_type']
                    }),
                    Vehicle.count({
                        where: { ...commonWhere, is_premium: true }
                    }),
                    Vehicle.sum('ge_cost', {
                        where: { ...commonWhere, is_premium: true, is_pack: false, on_marketplace: false }
                    }),
                    Vehicle.findAll({
                        attributes: ['version'],
                        group: ['version']
                    }),
                    VehicleOld.findAll({
                        attributes: ['version'],
                        group: ['version']
                    }),
                    Vehicle.findAll({
                        attributes: [
                            'country',
                            [fn('SUM', col('ge_cost')), 'total_ge_cost']
                        ],
                        where: { ...commonWhere, is_premium: true, is_pack: false, on_marketplace: false },
                        group: ['country']
                    })
                ]);
                
                const geCostMap = geCostByCountry.reduce((acc, item) => {
                    acc[item.country] = item.dataValues.total_ge_cost;
                    return acc;
                }, {});
                
                const vehicleTypeGroup = vehicleStatsQuery.reduce((acc, item) => {
                    if (!acc[item.country]) {
                        acc[item.country] = {
                            total_vehicles: 0,
                            vehicle_types: {}
                        };
                    }
                    acc[item.country].total_vehicles += parseInt(item.dataValues.total_vehicles);
                    acc[item.country].vehicle_types[item.vehicle_type] = parseInt(item.dataValues.total_vehicles);
                    return acc;
                }, {});
                
                const countryStats = countryStatsQuery.reduce((accumulator, item) => {
                    accumulator.push({
                        country: item.country,
                        total_value: parseInt(item.dataValues.total_value),
                        total_req_exp: parseInt(item.dataValues.total_req_exp),
                        total_ge_cost: parseInt(geCostMap[item.country]) || 0,
                        total_vehicles: vehicleTypeGroup[item.country] ? parseInt(vehicleTypeGroup[item.country].total_vehicles) : 0,
                        vehicle_types: vehicleTypeGroup[item.country] ? vehicleTypeGroup[item.country].vehicle_types : {}
                        
                    });
                    return accumulator;
                }, []);

                const vehicleStats = {
                    total_playable_vehicles: Object.values(countryStats).reduce((acc, country) => acc + parseInt(country.total_vehicles), 0),
                    total_premium_vehicles: totalPremiumVehicles,
                    total_sl_required: Object.values(countryStats).reduce((acc, country) => acc + parseInt(country.total_value), 0),
                    total_rp_required: Object.values(countryStats).reduce((acc, country) => acc + parseInt(country.total_req_exp), 0),
                    total_ge_required: totalGeRequired,
                    categories: Object.values(countryStats).reduce((accumulator, country) => {
                        Object.entries(country.vehicle_types).forEach(([vehicleType, count]) => {
                            accumulator[vehicleType] = (accumulator[vehicleType] || 0) + count;
                        });
                        return accumulator;
                    }, {}),
                    countries: countryStats,
                    versions: [...new Set([...currentVersions.map(v => v.version), ...oldVersions.map(v => v.version)])].sort((a, b) => a.localeCompare(b))
                };

                res.status(200).json(vehicleStats);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        return router;
    }
};
