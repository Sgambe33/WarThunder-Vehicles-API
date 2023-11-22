const express = require('express');
const { Vehicle } = require('../models/models');

module.exports = {
    base_route: `/vehicles/search`,
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/:name`, async (req, res) => {
            try {
                let name = req.params.name;
                name = name.replace('-', '_');
                console.log(name);
                let data = await Vehicle.find({ identifier: { $regex: name, $options: 'i' } }, { _id: 0 });
                if (data.length === 0) {
                    res.status(404).json({ message: "No vehicles found" })
                } else {
                    const identifiers = data.map(doc => doc.identifier);
                    res.status(200).json(identifiers)
                }
            } catch (error) {
                res.status(500).json({ message: error.message })
            }
        })
        return route;
    }

}

