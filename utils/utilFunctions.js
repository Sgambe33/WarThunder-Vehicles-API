const { Vehicle } = require('../models/models');

const LATEST_VERSION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const VEHICLE_JSON_FIELDS = [
    'vehicle_sub_types',
    'hull_armor',
    'turret_armor',
    'engine',
    'modifications',
    'ir_devices',
    'thermal_devices',
    'ballistic_computer',
    'aerodynamics',
    'weapons',
    'presets',
    'customizable_presets'
];

let latestVersionCache = {
    value: null,
    expiresAt: 0
};

async function latestVersion() {
    const now = Date.now();
    if (latestVersionCache.value && now < latestVersionCache.expiresAt) {
        return latestVersionCache.value;
    }

    const versions = await Vehicle.findAll({
        attributes: ['version'],
        group: ['version'],
        raw: true
    });

    const sortedVersions = versions
        .map(v => v.version)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const latest = sortedVersions[sortedVersions.length - 1] || null;
    latestVersionCache = {
        value: latest,
        expiresAt: now + LATEST_VERSION_CACHE_TTL_MS
    };

    return latest;
}

function appendImages(queryResult, req) {
    if (queryResult === null) return null;

    queryResult.images = {
        image: `https://${req.get('host')}/assets/images/${queryResult.identifier.toLowerCase()}.png`,
        techtree: `https://${req.get('host')}/assets/techtrees/${queryResult.identifier.toLowerCase()}.png`
    };

    return queryResult;
}

function deserializeVehicleJsonFields(vehicle) {
    if (!vehicle) return vehicle;

    for (const key of VEHICLE_JSON_FIELDS) {
        const value = vehicle[key];

        if (typeof value !== 'string') {
            continue;
        }

        const trimmed = value.trim();
        const mightBeJson =
            (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'));

        if (!mightBeJson) {
            continue;
        }

        try {
            vehicle[key] = JSON.parse(trimmed);
        } catch (_err) {
            // Keep original string when malformed.
        }
    }

    return vehicle;
}

module.exports = {
    latestVersion,
    appendImages,
    deserializeVehicleJsonFields
}