export { Component } from "../component";
export { types } from "../../savegame/serialization";
export { gItemRegistry } from "../../core/global_registries";
export { BaseItem } from "../base_item";
export { Vector, enumDirection } from "../../core/vector";
export { globalConfig } from "../../core/config";

export { ItemAcceptorComponent } from "../components/item_acceptor";
export { ItemEjectorComponent } from "../components/item_ejector";
export { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
export { Entity } from "../entity";
export { MetaBuilding } from "../meta_building";
export { GameRoot } from "../root";
export { enumHubGoalRewards } from "../tutorial_goals";
export { T } from "../../translations";
export { formatItemsPerSecond } from "../../core/utils";

export { GameSystemWithFilter } from "../game_system_with_filter";
export { DrawParameters } from "../../core/draw_parameters";
export { formatBigNumber, lerp } from "../../core/utils";
export { Loader } from "../../core/loader";

export { GameTime } from "../time/game_time";

export { ShapeItem } from "../items/shape_item";
export { ColorItem } from "../items/color_item";
export { ShapeDefinition } from "../shape_definition";

export { enumItemType } from "../base_item";
export { enumInvertedColors } from "../colors";


import { BaseItem } from "../base_item";
import { ItemProcessorSystem } from "../systems/item_processor"
import { Entity } from "../entity";
import { Component } from "../component";
import { MetaBuilding } from "../meta_building";
import { GameSystemWithFilter } from "../game_system_with_filter";


/**
 * @typedef {Object} ModProcessData
 * @property {BaseItem[]} items
 * @property {boolean} trackProduction
 * @property {Entity} entity
 * @property {Array<{item: BaseItem, requiredSlot?: number, preferredSlot?: number}>} outItems
 * @property {ItemProcessorSystem} system
 * @property {Array.<{ item: BaseItem, sourceSlot: number }>} itemsBySlot
 * @property {Array.<{ item: BaseItem, sourceSlot: number }>} itemsRaw
 */


/**
 * @callback ModProcess
 * @param {ModProcessData} data
 * @returns {boolean} trackProduction
 */


/**
 * @typedef {Object} ModData
 * @property {string} id
 * @property {typeof MetaBuilding} building
 * @property {typeof Component} [component]
 * @property {typeof GameSystemWithFilter} [system]
 * @property {number} toolbar
 * @property {Object|string} sprite
 * @property {Object|string} spriteBp
 * @property {ModProcess} process
 * @property {string} Tname
 * @property {string} Tdesc
 * @property {number} speed
 * @property {string} [speedClass]
 * @property {typeof MetaBuilding} meta
 * @property {number} variantId
 * @property {string|number} keyCode
 * @property {number} toolbarIndex
 * @property {{shape: string, required: number, reward: string, title: string, desc: string, tutorial?: Object, sort_index?: number}} [goal]
 * @property {Object} [goal.tutorial]
 */


/**
 * @typedef {Object} ModLevel
 * @property {string} id
 * @property {{ shape: string, required: number, reward: string, title: string, desc: string, sort_index?: number} | {fixed: true, title: string, desc: string, minLevel: number, maxLevel: number, baseCount: number, countPerLevel: number, shape: string, reward: string}} [goal]
 */

/** @param {ModProcessData} */
/** @type {ModData} */


// /** @typedef {import('../gameData').ModData} ModData */
// /** @typedef {import('../gameData').ModProcessData} ModProcessData */
