const UNIT_TYPES = {
    'tanks': ['light_tank', 'medium_tank', 'heavy_tank', 'tank_destroyer', 'spaa'],
    'aircrafts': ['fighter', 'assault', 'bomber', 'helicopter'],
    'ships': ['destroyer', 'submarine_chaser', 'cruiser', 'battleship', 'gun_boat', 'torpedo_boat', 'torepedo_gun_boat', 'naval_ferry_barge']
}

const VERSION_REGEX = /^\d+\.\d+\.\d+\.\d+$/;

module.exports = {
    UNIT_TYPES,
    VERSION_REGEX
}