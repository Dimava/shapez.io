import { MetaBuilding,
	enumDirection,
	enumItemProcessorTypes,
	T,
	ItemProcessorComponent,
	ItemEjectorComponent,
	ItemAcceptorComponent,
	Vector,
	formatItemsPerSecond,
	ShapeItem,
	ShapeDefinition,
    ColorItem,
    enumItemType,
} from "../gameData";


const id = "painter";

const cache = {};

function colorShape(shape, color) {
    const recipeId = shape + "+" + color;
    let out = cache[recipeId];
    if (out) return out;

    let layers = shape.split(':').map(e=>e.split(''));
    for (let i = 0; i < 4; i++) {
        let charges = 4;
        for (let j = layers.length - 1; j >= 0; --j) {
            if (layers[j][2*i] != "-") {
                layers[j][2*i+1] = color;
                charges--;
                if (!charges) break;
            }
        }
    }
    let result = layers.map(e=>e.join('')).join(':');
    return cache[recipeId] = ShapeDefinition.fromShortKey(result);
}

// returns trackProduction
export function Painter1Process({ items, trackProduction, entity, outItems, self }) {
    const shape = items[0].item.getHash();
    const color = items[1].item.getHash();

    outItems.push({
        item: new ShapeItem(colorShape(shape, color)),
    });

    return true;
}


export const BuildingData = {
    id: id,
    process: Painter1Process,
};

export default BuildingData;