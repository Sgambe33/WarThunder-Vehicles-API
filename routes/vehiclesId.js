require('dotenv').config();
const express = require('express');
const { Vehicle } = require('../models/models');
const { exclude } = require('../utils/utilFunctions.js');

module.exports = {
    base_route: `/vehicles`,
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/:id`, async (req, res) => {
            try {
                let data = await Vehicle.find({ identifier: req.params.id }, { _id: 0 });
                if (data.length === 0) {
                    res.status(404).json({ message: "No vehicles found" })
                } else {
                    res.status(200).json(data[0])
                }
            } catch (error) {
                res.status(500).json({ message: error.message })
            }
        })

        return route;
    }

}

