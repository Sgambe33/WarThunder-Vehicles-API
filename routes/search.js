const express = require('express');
const { PrismaClient } = require('@prisma/client')

module.exports = {
    base_route: `/vehicles/search`,
    handler: () => {
        const route = express.Router({ caseSensitive: false });

        route.get(`/:name`, async (req, res) => {
            try {
                let name = req.params.name.replace('-', '_');
                const prisma = new PrismaClient()
                let data = await prisma.vehicles.findMany(
                    {
                        where: {
                            identifier: {
                                contains: name,
                                mode: "insensitive"
                            }
                        },
                        take: 25
                    }
                );
                if (data.length === 0) {
                    res.status(404).json({ message: "No vehicles found" })
                } else {
                    const identifiers = data.map(doc => doc.identifier);
                    res.status(200).json(identifiers);
                }
            } catch (error) {
                res.status(500).json({ message: error.message })
            }
        })

        return route;
    }

}

