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


const id = "painterDouble";

const cache = {};

function colorShape(shape, color) {
    const recipeId = shape + "+" + color;
    let out = cache[recipeId];
    if (out) return out;

    let layers = shape.split(':').map(e=>e.split(''));
    for (let i = 0; i < 4; i++) {
        let charges = 2;
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
export function Painter2Process({ items, trackProduction, entity, outItems, self }) {
    const shape1 = items[0].item.getHash();
    const shape2 = items[1].item.getHash();
    const color = items[2].item.getHash();

    outItems.push({
        item: new ShapeItem(colorShape(shape1, color)),
    });
    outItems.push({
        item: new ShapeItem(colorShape(shape2, color)),
    });

    return true;
}


export const BuildingData = {
    id: id,
    process: Painter2Process,
};

export default BuildingData;