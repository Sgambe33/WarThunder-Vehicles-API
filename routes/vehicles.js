require('dotenv').config();
const express = require('express');
const { Vehicle } = require('../models/models');

module.exports = {
    base_route: `/vehicles`,
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(``, async (req, res) => {


            try {
                let user_limit = parseInt(req.query.limit);
                if (!user_limit) user_limit = 50;
                else if (user_limit > 100) user_limit = 100;
                const country = req.query.country;
                const type = req.query.type;
                const rank = parseInt(req.query.rank);
                const isPremium = req.query.isPremium;
                const isGift = req.query.isGift;

                const query = {};

                if (country) query.country = country;
                if (type) query.type = type;
                if (rank) query.tier = rank;
                if (isPremium) query.isPremium = isPremium;
                if (isGift) query.isGift = isGift;
                console.log("Query: ", query);

                let data = await Vehicle.find(query, { _id: 0 }, { limit: user_limit }).lean();
                if (data.length === 0) {
                    res.status(404).json({ message: "No vehicles found" })
                } else {
                    data.forEach((vehicle) => {
                        vehicle.images = []
                        vehicle.images.push(`${req.get('host')}/assets/images/${vehicle.identifier}.png`)
                        vehicle.images.push(`${req.get('host')}/assets/techtrees/${vehicle.identifier}.png`)
                        //response.push(vehicle)
                    })
                    res.status(200).json(data)
                }
            }
            catch (error) {
                res.status(500).json({ message: error.message })
            }
        })

        return route;
    }

}

