import {
    ShapeItem,
} from "../gameData";
/** @typedef {import('../gameData').ModData} ModData */
/** @typedef {import('../gameData').ModProcessData} ModProcessData */

const id = "painterDouble";

const cache = {};

function colorShape(shape, color) {
    const recipeId = shape + "+" + color;
    let out = cache[recipeId];
    if (out) return out;

    let layers = shape.split(":").map(e => e.split(""));
    for (let i = 0; i < 4; i++) {
        let charges = 2;
        for (let j = layers.length - 1; j >= 0; --j) {
            if (layers[j][2 * i] != "-") {
                layers[j][2 * i + 1] = color;
                charges--;
                if (!charges) break;
            }
        }
    }
    let result = layers.map(e => e.join("")).join(":");
    return cache[recipeId] = result;
}

/** @param {ModProcessData} */
export function Painter2Process({ items, trackProduction, outItems }) {
    const shape1 = items[0].getHash();
    const shape2 = items[1].getHash();
    const color = items[2].getHash();

    outItems.push({
        item: ShapeItem.createFromHash(colorShape(shape1, color)),
    });
    outItems.push({
        item: ShapeItem.createFromHash(colorShape(shape2, color)),
    });

    return trackProduction;
}

export const BuildingData = {
    id: id,
    process: Painter2Process,
};

export default BuildingData;
