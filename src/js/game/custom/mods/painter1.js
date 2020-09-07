import { ShapeItem } from "../gameData";
/** @typedef {import('../gameData').ModData} ModData */
/** @typedef {import('../gameData').ModProcessData} ModProcessData */

const id = "painter";

const cache = {};

function colorShape(shape, color) {
    const recipeId = shape + "+" + color;
    let out = cache[recipeId];
    if (out) return out;

    let layers = shape.split(":").map(e => e.split(""));
    for (let i = 0; i < 4; i++) {
        let charges = 3;
        for (let j = layers.length - 1; j >= 0; --j) {
            if (layers[j][2 * i] != "-") {
                layers[j][2 * i + 1] = color;
                charges--;
                if (!charges) break;
            }
        }
    }
    let result = layers.map(e => e.join("")).join(":");
    return (cache[recipeId] = result);
}

/** @param {ModProcessData} */
export function Painter1Process({ items, trackProduction, entity, outItems, self }) {
    const shape = items[0].getHash();
    const color = items[1].getHash();

    outItems.push({
        item: ShapeItem.createFromHash(colorShape(shape, color)),
    });

    return trackProduction;
}

export const BuildingData = {
    id: id,
    process: Painter1Process,
};

export default BuildingData;
