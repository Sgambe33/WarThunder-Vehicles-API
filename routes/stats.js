require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client')

module.exports = {
    base_route: `/stats`,
    handler: () => {
        const route = express.Router({ caseSensitive: false });
        const regex = new RegExp('killstreak')
        route.get(``, async (req, res) => {
            try {
                const prisma = new PrismaClient()
                let result = await prisma.vehicles.aggregateRaw({
                    pipeline: [
                        {
                            '$match': {
                                '$and': [
                                    {
                                        'isPremium': false
                                    }, {
                                        'isGift': false
                                    }
                                    //There should be a regex expression to exclude killstreaks vehicles from the count but js sucks
                                    //https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#aggregateraw
                                    
                                ]
                            }
                        }, {
                            '$group': {
                                '_id': '$country',
                                'totalRP': {
                                    '$sum': '$reqExp'
                                },
                                'totalSL': {
                                    '$sum': '$value'
                                }
                            }
                        }, {
                            '$lookup': {
                                'from': 'vehicles',
                                'localField': '_id',
                                'foreignField': 'country',
                                'as': 'vehicleStats'
                            }
                        }, {
                            '$project': {
                                '_id': 0,
                                'country': '$_id',
                                'totalRP': 1,
                                'totalSL': 1,
                                'totalVehicles': {
                                    '$size': '$vehicleStats'
                                }
                            }
                        }
                    ]
                });
                res.status(200).json(result)
            } catch (error) {
                res.status(500).json({ message: error.message })
            }
        })

        return route;
    }

}

