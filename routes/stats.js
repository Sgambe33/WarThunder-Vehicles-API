require('dotenv').config();
const express = require('express');
const { Vehicle } = require('../models/models');

module.exports = {
    base_route: `/stats`,
    handler: () => {
        const route = express.Router({ caseSensitive: false });
        route.get(``, async (req, res) => {
            try {
                let countAndCosts = await Vehicle.aggregate([
                    {
                        $match: {
                            $and: [
                                {
                                    isPremium: false
                                }, {
                                    isGift: false
                                }, {
                                    identifier: {
                                        $not: /killstreak/
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: "$country",
                            totalRP: {
                                $sum: "$reqExp"
                            },
                            totalSL: {
                                $sum: "$value"
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "vehicles",
                            localField: "_id",
                            foreignField: "country",
                            as: "vehicleStats"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            country: "$_id",
                            totalRP: 1,
                            totalSL: 1,
                            totalVehicles: { $size: "$vehicleStats" }
                        }
                    }
                ]);
                res.status(200).json(countAndCosts)
            } catch (error) {
                res.status(500).json({ message: error.message })
            }
        })
        return route;
    }

}

