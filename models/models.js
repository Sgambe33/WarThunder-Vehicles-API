const {DataTypes} = require('sequelize');
const db = require('../utils/db')

const commonAttributes = {
    identifier: {
        type: DataTypes.STRING, allowNull: false, primaryKey: true
    },
    country: DataTypes.STRING,
    vehicle_type: DataTypes.STRING,
    event: {
        type: DataTypes.STRING, allowNull: true
    },
    release_date: {
        type: DataTypes.DATE, allowNull: true
    },
    version: DataTypes.STRING,
    era: DataTypes.INTEGER,
    arcade_br: DataTypes.REAL,
    realistic_br: DataTypes.REAL,
    simulator_br: DataTypes.REAL,
    value: DataTypes.INTEGER,
    req_exp: DataTypes.INTEGER,
    is_premium: DataTypes.BOOLEAN,
    is_gift: DataTypes.BOOLEAN,
    ge_cost: DataTypes.INTEGER,
    crew_total_count: DataTypes.INTEGER,
    mass: DataTypes.REAL,
    train1_cost: DataTypes.INTEGER,
    train2_cost: DataTypes.INTEGER,
    train3_cost_gold: {
        type: DataTypes.INTEGER, allowNull: false
    },
    train3_cost_exp: {
        type: DataTypes.INTEGER, allowNull: false
    },
    repair_time_arcade: {
        type: DataTypes.REAL, allowNull: false
    },
    repair_time_realistic: {
        type: DataTypes.REAL, allowNull: false
    },
    repair_time_simulator: {
        type: DataTypes.REAL, allowNull: false
    },
    repair_time_no_crew_arcade: {
        type: DataTypes.REAL, allowNull: false
    },
    repair_time_no_crew_realistic: {
        type: DataTypes.REAL, allowNull: false
    },
    repair_time_no_crew_simulator: {
        type: DataTypes.REAL, allowNull: false
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
        type: DataTypes.STRING, allowNull: true
    },
    engine: {
        type: DataTypes.JSON, allowNull: true
    },
    modifications: {
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