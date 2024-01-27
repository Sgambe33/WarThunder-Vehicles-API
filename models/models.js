const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    country: String,
    identifier: String,
    tier: Number,
    type: mongoose.Schema.Types.Mixed,
    releaseDate: String,
    value: Number,
    reqExp: Number,
    isPremium: Boolean,
    costGold: Number,
    isGift: Boolean,
    crewTotalCount: Number,
    train1Cost: Number,
    train2Cost: Number,
    train3Cost_gold: Number,
    train3Cost_exp: Number,
    repairTimeHrsArcade: Number,
    repairTimeHrsHistorical: Number,
    repairTimeHrsSimulaton: Number,
    repairCostArcadeBasic: Number,
    repairCostHistoricalBasic: Number,
    repairCostSimulationBasic: Number,
    repairCostArcadeReference: Number,
    repairCostHistoricalReference: Number,
    repairCostSimulationReference: Number,
    mass: Number,
    engine: Object,
    aerodyanmics: Object,
    weapons: Object,
    presets: Object,
    sensors: Object
},{
    minimize: false,
    collection: 'vehicles'
});

module.exports = {
    Vehicle: mongoose.model('Vehicle', vehicleSchema)
}