const {DataTypes} = require('sequelize');
const db = require('../utils/db')

const commonAttributes = {
    identifier: {
        type: DataTypes.TEXT, allowNull: false, primaryKey: true
    },
    country: DataTypes.TEXT,
    vehicle_type: DataTypes.TEXT,
    vehicle_sub_types: {
        type: DataTypes.JSON, allowNull: true
    },
    event: {
        type: DataTypes.TEXT, allowNull: true
    },
    release_date: {
        type: DataTypes.DATEONLY, allowNull: true
    },
    version: DataTypes.TEXT,
    era: DataTypes.INTEGER,
    arcade_br: DataTypes.FLOAT,
    realistic_br: DataTypes.FLOAT,
    realistic_ground_br: DataTypes.FLOAT,
    simulator_br: DataTypes.FLOAT,
    simulator_ground_br: DataTypes.FLOAT,
    value: DataTypes.INTEGER,
    req_exp: DataTypes.INTEGER,
    is_premium: DataTypes.BOOLEAN,
    is_pack: DataTypes.BOOLEAN,
    on_marketplace: DataTypes.BOOLEAN,
    squadron_vehicle: DataTypes.BOOLEAN,
    ge_cost: DataTypes.INTEGER,
    crew_total_count: DataTypes.INTEGER,
    visibility: DataTypes.INTEGER,
    hull_armor: {
        type: DataTypes.JSON, allowNull: true
    },
    turret_armor: {
        type: DataTypes.JSON, allowNull: true
    },
    mass: DataTypes.FLOAT,
    train1_cost: DataTypes.INTEGER,
    train2_cost: DataTypes.INTEGER,
    train3_cost_gold: {
        type: DataTypes.INTEGER, allowNull: false
    },
    train3_cost_exp: {
        type: DataTypes.INTEGER, allowNull: false
    },
    sl_mul_arcade:{
        type: DataTypes.FLOAT, allowNull: false
    },
    sl_mul_realistic:{
        type: DataTypes.FLOAT, allowNull: false
    },
    sl_mul_simulator:{
        type: DataTypes.FLOAT, allowNull: false
    },
    exp_mul:{
        type: DataTypes.FLOAT, allowNull: false
    },
    repair_time_arcade: {
        type: DataTypes.FLOAT, allowNull: false
    },
    repair_time_realistic: {
        type: DataTypes.FLOAT, allowNull: false
    },
    repair_time_simulator: {
        type: DataTypes.FLOAT, allowNull: false
    },
    repair_time_no_crew_arcade: {
        type: DataTypes.FLOAT, allowNull: false
    },
    repair_time_no_crew_realistic: {
        type: DataTypes.FLOAT, allowNull: false
    },
    repair_time_no_crew_simulator: {
        type: DataTypes.FLOAT, allowNull: false
    },
    repair_cost_arcade: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_realistic: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_simulator: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_per_min_arcade: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_per_min_realistic: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_per_min_simulator: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_full_upgraded_arcade: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_full_upgraded_realistic: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_cost_full_upgraded_simulator: {
        type: DataTypes.INTEGER, allowNull: false
    },
    required_vehicle: {
        type: DataTypes.TEXT, allowNull: true
    },
    engine: {
        type: DataTypes.JSON, allowNull: true
    },
    modifications: {
        type: DataTypes.JSON, allowNull: true
    },
    ir_devices:{
        type: DataTypes.JSON, allowNull: true
    },
    thermal_devices:{
        type: DataTypes.JSON, allowNull: true
    },
    ballistic_computer:{
        type: DataTypes.JSON, allowNull: true
    },
    aerodynamics: {
        type: DataTypes.JSON, allowNull: true
    },
    has_customizable_weapons: DataTypes.BOOLEAN,
    weapons: {
        type: DataTypes.JSON, allowNull: true
    },
    presets: {
        type: DataTypes.JSON, allowNull: true
    },
    customizable_presets: {
        type: DataTypes.JSON, allowNull: true
    }
}
const Vehicle = db.sequelize.define('Vehicle', {
    ...commonAttributes,
}, {
    tableName: 'vehicle', timestamps: false
});

const VehicleOld = db.sequelize.define('VehicleOld', {
    ...commonAttributes,
}, {
    tableName: 'vehicleold', timestamps: false
});

module.exports = {
    Vehicle, VehicleOld
};