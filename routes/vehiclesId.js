const express = require('express');
const { Vehicle, VehicleOld } = require('../models/models');
const { Op } = require("sequelize");
const { appendImages, latestVersion } = require("../utils/utilFunctions");
const { VERSION_REGEX } = require("../utils/constants");

const findVehicle = (model, id, version = null) => {
    const where = { identifier: { [Op.like]: id } };
    if (version) where.version = version;
    return model.findOne({ where });
};

module.exports = {
    base_route: '/vehicles',
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get('/:id', async (req, res) => {
            const { id } = req.params;
            const { version: targetVersion } = req.query;

            try {
                let result = null;

                if (targetVersion) {
                    if (!VERSION_REGEX.test(targetVersion)) {
                        return res.status(400).json({ error: 'Invalid version provided' });
                    }

                    const currentLiveVersion = await latestVersion();

                    if (targetVersion === currentLiveVersion) {
                        result = await findVehicle(Vehicle, id);
                    } else {
                        result = await findVehicle(VehicleOld, id, targetVersion);
                    }

                } else {
                    const [vehicle, oldVersions] = await Promise.all([
                        findVehicle(Vehicle, id),
                        VehicleOld.findAll({
                            attributes: ['version'],
                            where: { identifier: { [Op.like]: id } }
                        })
                    ]);

                    if (vehicle) {
                        result = vehicle;
                        const history = oldVersions.map(v => v.version);
                        result.dataValues.versions = [...history, vehicle.version].sort();
                    }
                }

                if (result) {
                    result = appendImages(result, req);
                    return res.status(200).json(result);
                } else {
                    return res.status(404).json({ error: 'Vehicle not found' });
                }

            } catch (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
        });

        return route;
    }
};