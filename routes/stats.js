const express = require('express');
const { EVENT_VEHICLES } = require('../utils/constants');
const { Vehicle, VehicleOld } = require('../models/models');
const { Op } = require('sequelize');
const fs = require('node:fs/promises');
const path = require('node:path');
const CACHE_ENABLED = true;
const STATS_ATTRIBUTES = ['identifier', 'version', 'is_premium', 'is_pack', 'squadron_vehicle', 'on_marketplace', 'country', 'vehicle_type', 'value', 'req_exp', 'ge_cost'];
const STATS_CACHE_DIR = path.resolve(__dirname, '../cache/stats');

const toCacheFilePath = (cacheKey) => {
    return path.join(STATS_CACHE_DIR, `${cacheKey}.json`);
};

async function getLatestVehicleVersion() {
    const versions = await Vehicle.findAll({ attributes: ['version'], group: ['version'], raw: true });

    if (!versions.length) {
        return null;
    }

    return versions
        .map(v => v.version)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .at(-1);
}

async function getCachedStats(cacheKey) {
    const filePath = toCacheFilePath(cacheKey);
    let entry;

    try {
        const raw = await fs.readFile(filePath, 'utf8');
        entry = JSON.parse(raw);
    } catch (err) {
        if (err.code === 'ENOENT') {
            return null;
        }

        console.error(`Failed to read stats cache file ${filePath}:`, err);
        return null;
    }

    if (entry === undefined || entry === null) {
        return null;
    }

    if (entry && typeof entry === 'object' && Object.prototype.hasOwnProperty.call(entry, 'payload')) {
        return entry.payload ?? null;
    }

    return entry;
}

async function writeStatsCache(cacheKey, payload) {
    const filePath = toCacheFilePath(cacheKey);
    await fs.mkdir(STATS_CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(payload), 'utf8');
}

const getVehicleCategory = (v) => {
    if (v.squadron_vehicle) return 'squadron';
    if (v.is_pack) return 'pack';
    if (v.on_marketplace && v.is_premium) return 'marketplace_premium';
    if (v.on_marketplace) return 'marketplace';
    if (v.is_premium) return 'premium';
    return 'techtree';
};

module.exports = {
    base_route: '/vehicles/stats',
    handler: () => {
        const router = express.Router({ caseSensitive: false });

        router.get('', async (req, res) => {
            try {
                const { version: targetVersion } = req.query;
                const requestedVersion = targetVersion || await getLatestVehicleVersion();
                const cacheKey = requestedVersion || 'latest';
                const cachedStats = await getCachedStats(cacheKey);

                if (cachedStats && CACHE_ENABLED) {
                    return res.status(200).json(cachedStats);
                }

                const commonWhere = {
                    identifier: {
                        [Op.notIn]: EVENT_VEHICLES,
                        [Op.notLike]: '%killstreak'
                    }
                };

                const [currentVersions, oldVersions] = await Promise.all([
                    Vehicle.findAll({ attributes: ['version'], group: ['version'], raw: true }),
                    VehicleOld.findAll({ attributes: ['version'], group: ['version'], raw: true })
                ]);

                const allVersions = [...new Set([
                    ...currentVersions.map(v => v.version),
                    ...oldVersions.map(v => v.version)
                ])].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

                let vehicleList = [];
                if (requestedVersion) {
                    const versionWhere = {
                        ...commonWhere,
                        version: { [Op.lte]: requestedVersion }
                    };

                    const vehicleMap = new Map();
                    const processVehicle = (v) => {
                        const existing = vehicleMap.get(v.identifier);
                        if (!existing || v.version.localeCompare(existing.version, undefined, { numeric: true }) > 0) {
                            vehicleMap.set(v.identifier, v);
                        }
                    };

                    const currentVehicles = await Vehicle.findAll({
                        where: versionWhere,
                        attributes: STATS_ATTRIBUTES,
                        raw: true
                    });
                    currentVehicles.forEach(processVehicle);

                    const oldVehicles = await VehicleOld.findAll({
                        where: versionWhere,
                        attributes: STATS_ATTRIBUTES,
                        raw: true
                    });
                    oldVehicles.forEach(processVehicle);

                    vehicleList = vehicleMap.values();
                } else {
                    vehicleList = await Vehicle.findAll({
                        where: commonWhere,
                        attributes: STATS_ATTRIBUTES,
                        raw: true
                    });
                }

                const stats = {
                    total_techtree_vehicles: 0,
                    total_premium_vehicles: 0,
                    total_pack_vehicles: 0,
                    total_marketplace_vehicles: 0,
                    total_marketplace_premium_vehicles: 0,
                    total_squadron_vehicles: 0,
                    total_sl_required: 0,
                    total_rp_required: 0,
                    total_ge_required: 0,
                    total_srp_required: 0,
                    categories: {},
                    countries: {}
                };

                for (const v of vehicleList) {
                    const category = getVehicleCategory(v);
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

                    switch (category) {
                        case 'techtree': {
                            const val = parseInt(v.value) || 0;
                            const exp = parseInt(v.req_exp) || 0;
                            stats.total_techtree_vehicles++;
                            stats.total_sl_required += val;
                            stats.total_rp_required += exp;
                            cStat.total_value += val;
                            cStat.total_req_exp += exp;
                            typeStat.total_value += val;
                            typeStat.total_req_exp += exp;
                            break;
                        }
                        case 'premium': {
                            const ge = parseInt(v.ge_cost) || 0;
                            stats.total_premium_vehicles++;
                            stats.total_ge_required += ge;
                            cStat.total_ge_cost += ge;
                            typeStat.total_ge_cost += ge;
                            break;
                        }
                        case 'pack':
                            stats.total_pack_vehicles++;
                            break;
                        case 'marketplace':
                            stats.total_marketplace_vehicles++;
                            break;
                        case 'marketplace_premium':
                            stats.total_marketplace_premium_vehicles++;
                            break;
                        case 'squadron':
                            stats.total_squadron_vehicles++;
                            stats.total_srp_required += v.req_exp
                            break;
                    }
                }

                const responseData = {
                    ...stats,
                    countries: Object.values(stats.countries),
                    versions: allVersions
                };

                await writeStatsCache(cacheKey, responseData);
                res.status(200).json(responseData);

            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });

        return router;
    }
};