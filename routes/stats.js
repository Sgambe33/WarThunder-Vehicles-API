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
                const { version: targetVersion } = req.query;
                const commonWhere = {
                    identifier: {
                        [Op.notIn]: EVENT_VEHICLES,
                        [Op.notLike]: '%killstreak'
                    }
                };

                const [currentVersions, oldVersions] = await Promise.all([
                    Vehicle.findAll({ attributes: ['version'], group: ['version'] }),
                    VehicleOld.findAll({ attributes: ['version'], group: ['version'] })
                ]);

                const allVersions = [...new Set([
                    ...currentVersions.map(v => v.version),
                    ...oldVersions.map(v => v.version)
                ])].sort((a, b) => a.localeCompare(b));


                let vehicleList = [];
                if (targetVersion) {
                    //version <= targetVersion
                    const versionWhere = {
                        ...commonWhere,
                        version: { [Op.lte]: targetVersion }
                    };

                    const [currentVehicles, oldVehicles] = await Promise.all([
                        Vehicle.findAll({ where: versionWhere, raw: true }),
                        VehicleOld.findAll({ where: versionWhere, raw: true })
                    ]);

                    const combined = [...currentVehicles, ...oldVehicles];
                    combined.sort((a, b) => a.version.localeCompare(b.version));

                    const vehicleMap = {};
                    combined.forEach(v => {
                        vehicleMap[v.identifier] = v;
                    });

                    vehicleList = Object.values(vehicleMap);
                } else {
                    //otherwise get stats for latest version
                    vehicleList = await Vehicle.findAll({
                        where: commonWhere,
                        raw: true
                    });
                }

                const stats = {
                    total_techtree_vehicles: 0,
                    total_premium_vehicles: 0,
                    total_sl_required: 0,
                    total_rp_required: 0,
                    total_ge_required: 0,
                    categories: {},
                    countries: {}
                };

                vehicleList.forEach(v => {
                    const isPremium = v.is_premium;
                    const isPack = v.is_pack;
                    const onMarket = v.on_marketplace;
                    const country = v.country;
                    const type = v.vehicle_type;

                    if (!stats.countries[country]) {
                        stats.countries[country] = {
                            country: country,
                            total_value: 0,
                            total_req_exp: 0,
                            total_ge_cost: 0,
                            total_vehicles: 0,
                            vehicle_types: {}
                        };
                    }
                    const cStat = stats.countries[country];

                    if (!cStat.vehicle_types[type]) {
                        cStat.vehicle_types[type] = {
                            count: 0,
                            total_value: 0,
                            total_req_exp: 0,
                            total_ge_cost: 0
                        };
                    }
                    const typeStat = cStat.vehicle_types[type];

                    cStat.total_vehicles++;
                    typeStat.count++;

                    stats.categories[type] = (stats.categories[type] || 0) + 1;

                    //non-premium / non-market / non-pack => tech tree vehicles
                    if (!isPremium && !onMarket && !isPack) {
                        const val = parseInt(v.value) || 0;
                        const exp = parseInt(v.req_exp) || 0;

                        stats.total_techtree_vehicles++;
                        cStat.total_value += val;
                        cStat.total_req_exp += exp;

                        typeStat.total_value += val;
                        typeStat.total_req_exp += exp;

                        stats.total_sl_required += val;
                        stats.total_rp_required += exp;
                    }

                    // premium only (market and packs not considered)
                    if (isPremium) {
                        stats.total_premium_vehicles++;

                        if (!isPack && !onMarket) {
                            const ge = parseInt(v.ge_cost) || 0;
                            cStat.total_ge_cost += ge;
                            typeStat.total_ge_cost += ge;
                            stats.total_ge_required += ge;
                        }
                    }
                });

                const responseData = {
                    ...stats,
                    countries: Object.values(stats.countries),
                    versions: allVersions
                };

                res.status(200).json(responseData);

            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });

        return router;
    }
};