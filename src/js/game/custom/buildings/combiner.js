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
    enumItemType,
} from "../gameData";


const id = "combiner";
const color = "blue";



export class MetaCombinerBuilding extends MetaBuilding {
    constructor() {
        super(id);
    }

    getDimensions() {
        return new Vector(2, 2);
    }

    getSilhouetteColor() {
        return color;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(`reward_${ id }`);
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed(id);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 2,
                processorType: id,
            })
        );
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                ],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(1, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.shape,
                    },
                ],
            })
        );
    }
}




// returns trackProduction
export function CombinerProcess({ items, trackProduction, entity, outItems, self }) {
    // console.log("Combiner PROCESSES");

    const inputItem = items[0].item;
    trackProduction = true;

//     debugger;
    let input = items.map(e => e.item.definition.getHash());


    let [it1, it2] = input;
    let out = [];
    const recipes = {
        "CC": "L",
        "RR": "P",
        "SS": "T",
        "WW": "Z",
        "CR" : "B", "RC" : "B",
        "CS" : "U", "SC" : "U",
    };
    let a = ""; 
    for (let i = 0; i < 4; i++) {
        let empty = it1[i*2] == "-" || it2[i*2] == "-";
        let r = recipes[it1[i*2] + it2[i*2]] || "C";
        a += empty ? "--" : r + "u";
    }

    if (a != "--------") {
        outItems.push({
            item: new ShapeItem(ShapeDefinition.fromShortKey(a)),
        })
    }

    // for (let i = 0; i < out.length; ++i) {
    // 	if (!out[i]) continue;
    // 	outItems.push({
    // 		item: new ShapeItem(ShapeDefinition.fromShortKey(out[i])),
    // 		requiredSlot: i,
    // 	})
    // }

    return trackProduction;
}


export const Sprite = {
    sprite: `sprites/buildings/${ id }.png`,
    url: `./res/${ id }.png`,
    w: 192 * 2,
    h: 192 * 2,
};
export const SpriteBp = {
    sprite: `sprites/blueprints/${ id }.png`,
    url: `./res/${ id }-bp.png`,
    w: 192 * 2,
    h: 192 * 2,
};

export const unstackerBuildingData = {
    id: id,
    building: MetaCombinerBuilding,
    toolbar: 2,
    sprite: Sprite,
    spriteBp: SpriteBp,
    process: CombinerProcess,
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
    Tname: id,
    Tdesc: "Whatever...",
    speed: 1 / 5,
    speedClass: "processors",
    meta: MetaCombinerBuilding,
    variantId: 540,
};

export default unstackerBuildingData;