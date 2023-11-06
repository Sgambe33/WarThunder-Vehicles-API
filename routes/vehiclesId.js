require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client')
const {exclude} = require('../utils/utilFunctions.js');

module.exports = {
    base_route: `/vehicles`,
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/:id`, async (req, res) => {
            try {
                console.log(req.params.id);
        
                const prisma = new PrismaClient()
                let result = await prisma.vehicles.findMany(
                    {
                        where: {identifier: req.params.id},
                    }
            
                );
                if (result.length === 0) {
                    res.status(404).json({ message: "No vehicle with such id." });
                } else {
                    res.status(200).json(exclude(result[0], '_id'));
                }
            } catch (error) {
                res.status(500).json({ message: error.message })
            }
        })

        return route;
    }

}

