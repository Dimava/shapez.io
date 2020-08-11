import { enumColors } from "./colors";
import { customShapes } from "./custom/shapes";

/** @enum {string} */
export const enumSubShape = {
    rect: "rect",
    circle: "circle",
    star: "star",
    windmill: "windmill",
};

/** @enum {string} */
export const enumSubShapeToShortcode = {
    [enumSubShape.rect]: "R",
    [enumSubShape.circle]: "C",
    [enumSubShape.star]: "S",
    [enumSubShape.windmill]: "W",
};

/** @enum {enumSubShape} */
export const enumShortcodeToSubShape = {};
for (const key in enumSubShapeToShortcode) {
    enumShortcodeToSubShape[enumSubShapeToShortcode[key]] = key;
}

/**
 * @callback DrawShape
 * @param {Object} args
 */

/**
 * @typedef {Object} ShapeData
 * @property {string} id
 * @property {string} code
 * @property {boolean} [spawnable]
 * @property {string} [spawnColor]
 * @property {number} [maxQuarters]
 * @property {number} [minDistance]
 * @property {number} [minChance]
 * @property {number} [distChance]
 * @property {number} [maxChance]
 * @property {DrawShape | string} draw
 * @property {number} tier
 */

/** @enum {ShapeData} */
export const allShapeData = {
    rect: {
        id: "rect",
        code: "R",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 4,
        minDistance: 0,
        minChance: 100,
        distChance: 0,
        maxChance: 100,
        draw: "M 0 0 v 1 h 1 v -1 z",
        tier: 0,
    },
    circle: {
        id: "circle",
        code: "C",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 4,
        minDistance: 0,
        minChance: 50,
        distChance: 15,
        maxChance: 100,
        draw: "M 0 0 l 1 0 a 1 1 0 0 1 -1 1 z ",
        tier: 0,
    },
    star: {
        id: "star",
        code: "S",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 4,
        minDistance: 5,
        minChance: 20,
        distChance: 10,
        maxChance: 100,
        draw: "M 0 0 L 0 0.6 1 1 0.6 0 z",
        tier: 0.5,
    },
    windmill: {
        id: "windmill",
        code: "W",
        spawnable: true,
        spawnColor: "uncolored",
        maxQuarters: 3,
        minDistance: 7,
        minChance: 20,
        distChance: 5,
        maxChance: 100,
        draw: "M 0 0 L 0 0.6 1 1 1 0 z",
        tier: 1,
    },
};

for (let data of customShapes) {
    allShapeData[data.id] = data;
}

initShapes();

export function initShapes() {
    for (let k in enumSubShape) {
        delete enumSubShape[k];
    }
    for (let k in enumSubShapeToShortcode) {
        delete enumSubShapeToShortcode[k];
    }
    for (let k in enumShortcodeToSubShape) {
        delete enumShortcodeToSubShape[k];
    }

    for (let s in allShapeData) {
        let data = allShapeData[s];
        assert(data.id == s);
        assert(data.code.toUpperCase() == data.code);
        enumSubShape[data.id] = data.id;
        enumSubShapeToShortcode[data.id] = data.code;
        enumShortcodeToSubShape[data.code] = data.id;
        if (data.spawnable) {
            data.spawnColor = data.spawnColor || "uncolored";
            assert(enumColors[data.spawnColor], "should have known initial color");
            data.maxQuarters = data.maxQuarters || 4;
            data.minDistance = data.minDistance || 0;
            assert(data.minChance > 0 || data.distChance > 0, "should have chance to spawn");
            data.minChance = data.minChance || 0;
            data.distChance = data.distChance || 0;
            data.maxChance = data.maxChance || 999999;
        }
    }
}
