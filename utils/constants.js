const UNIT_TYPES = {
    'tanks': ['light_tank', 'medium_tank', 'heavy_tank', 'tank_destroyer', 'spaa'],
    'aircrafts': ['fighter', 'assault', 'bomber', 'helicopter'],
    'ships': ['destroyer', 'submarine_chaser', 'cruiser', 'battleship', 'gun_boat', 'torpedo_boat', 'torepedo_gun_boat', 'naval_ferry_barge']
}

const VERSION_REGEX = /^\d+\.\d+\.\d+\.\d+$/;

const EVENT_VEHICLES = [
    "us_m18_hellcat_black_cat_race",
    "po_2op_event",
    "germ_sturmmorser_sturmtiger_event",
    "po-2_nw",
    "os2u_1_naval",
    "us_amx_13_75",
    "us_amx_13_90",
    "us_m551_football",
    "ussr_m551_football",
    "md_460_usa",
    "md_460_yt_cup_2019",
    "ussr_t_72b3_2017_race",
    "ussr_t_80u_race",
    "us_m1a1_abrams_yt_cup_2019",
    "ussr_t_80u_yt_cup_2019",
    "uk_challenger_ii_yt_cup_2019",
    "germ_leopard_2a5_yt_cup_2019",
    "j_8f_missile_test",
    "mirage_2000_5f_missile_test",
    "saab_jas39c_south_africa_missile_test",
    "mig_29smt_9_19_missile_test",
    "f_16d_block_40_barak_2_missile_test",
    "f_16c_block_50_missile_test",
    "md_ystervark_spaa_uparmor_flamer",
    "md_ystervark_spaa_uparmor",
    "md_ystervark_spaa_flamer",
    "md_ystervark_spaa",
    "md_vickers_mk_11",
    "md_vickers_mk_11_uparmor_rearmed",
    "md_vickers_mk_11_uparmor",
    "md_vickers_mk_11_rearmed",
    "md_bosvark",
    "md_bosvark_recoiless_rifle",
    "md_bosvark_uparmor",
    "md_bosvark_uparmor_recoiless_rifle",
    "md_btr_80a",
    "md_btr_80a_projector",
    "md_btr_80a_uparmor",
    "md_btr_80a_uparmor_projector",
    "md_flarakrad",
    "md_flarakrad_uparmor",
    "md_m53_59",
    "md_m53_59_rocket",
    "md_m53_59_uparmor",
    "md_m53_59_uparmor_rocket",
    "md_tgdgb_m40_lv",
    "md_tgdgb_m40_lv_uparmor",
    "uk_crusader_aa_mk_2_tutorial",
    "ussr_t_50_for_tutorial",
    "us_m26_pershing_tutorial",
    "germ_panther_ii_tutorial",
    "us_m4a2_76w_sherman_tutorial"
]

module.exports = {
    UNIT_TYPES,
    VERSION_REGEX,
    EVENT_VEHICLES
}