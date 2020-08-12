import {
    MetaBuilding,
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
        return root.hubGoals.isRewardUnlocked(`reward_${id}`);
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

const components = {
    R: "R",
    C: "C",
    S: "S",
    W: "W",
    B: "RC",
    D: "RS",
    O: "RW",
    F: "CS",
    U: "CW",
    M: "SW",
    Z: "RCS",
    T: "RCW",
    L: "RSW",
    P: "CSW",
    Y: "RCSW",
};

const recipes = {};

for (let s in components) {
    components[s] = components[s].split("").sort().join("");
}

for (let s1 in components) {
    let res = {};
    for (let s2 in components) {
        let cm = [...new Set(components[s1] + components[s2])].sort().join("");
        for (let r in components) {
            if (cm == components[r]) {
                res[s2] = r;
            }
        }
    }
    recipes[s1] = res;
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
    let a = "";

    // for (let i = 0; i < 4; i++) {
    //     let empty = it1[i*2] == "-" || it2[i*2] == "-";
    //     let r = recipes[it1[i*2] + it2[i*2]] || "C";
    //     a += empty ? "--" : r + "u";
    // }
    let quads1 = it1
        .split(":")
        .flatMap(e => e.match(/../g))
        .map(e => e[0]);
    let quads2 = it2
        .split(":")
        .flatMap(e => e.match(/../g))
        .map(e => e[0]);

    let r = [];
    for (let i = 0; i < Math.max(quads1.length, quads2.length); ++i) {
        if (!quads1[i] || !quads2[i]) {
            r.push(quads1[i] || quads2[i]);
            continue;
        }
        if (quads1[i] == "-" || quads2[i] == "-") {
            r.push(quads1[i] == "-" ? quads2[i] : quads1[i]);
        } else {
            r.push(recipes[quads1[i]][quads2[i]]);
        }
    }
    a = r.map((e, i) => `${i && !(i % 4) ? ":" : ""}${e}${e == "-" ? "-" : "u"}`).join("");

    if (a != "--------") {
        outItems.push({
            item: new ShapeItem(ShapeDefinition.fromShortKey(a)),
        });
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
    sprite: `sprites/buildings/${id}.png`,
    url: `./res/${id}.png`,
    w: 192 * 2,
    h: 192 * 2,
};
export const SpriteBp = {
    sprite: `sprites/blueprints/${id}.png`,
    url: `./res/${id}-bp.png`,
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
    Tname: "Combiner",
    Tdesc: "Combines shapes into shapes of higher class. Works with shapes same as Merger works with colors.",
    speed: 1 / 5,
    speedClass: "processors",
    meta: MetaCombinerBuilding,
    variantId: 540,

    keyCode: "8",
    toolbarIndex: 8,
};

export default unstackerBuildingData;
