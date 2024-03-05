const {Vehicle} = require("../models/models");
const UNIT_TYPES = {
    'tanks': ['lighttank', 'mediumtank', 'heavytank', 'tankdestroyer', 'spaa'],
    'aircrafts': ['fighter', 'stormovik', 'bomber', 'divebomber'],
    'ships': ['torpedoboat', 'submarinechaser', 'minelayer', 'transport', 'navalferrybarge', 'destroyer', 'torpedogunboat', 'ship']
}

const VERSION_REGEX = /^\d+\.\d+\.\d+\.\d+$/;

module.exports = {
    UNIT_TYPES,
    VERSION_REGEX
}