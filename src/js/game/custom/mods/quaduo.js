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

const id = "quaduo";

export class MetaQuaduoPainterBuilding extends MetaBuilding {
    constructor() {
        super(id);
    }

    getDimensions() {
        return new Vector(4, 2);
    }

    getSilhouetteColor() {
        return "#ff6000";
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
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed, true)]];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 6,
                processorType: id,
            })
        );
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(3, 1),
                        direction: enumDirection.right,
                    },
                ],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.color,
                    },
                    {
                        pos: new Vector(1, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.color,
                    },
                    {
                        pos: new Vector(2, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.color,
                    },
                    {
                        pos: new Vector(3, 1),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.color,
                    },
                ],
            })
        );
    }
}

const cache = {};

function colorShape(shape, c1, c2, c3, c4) {
    const recipeId = `${shape}+${c1}+${c2}+${c3}+${c4}`;
    let out = cache[recipeId];
    if (out) return out;

    let layers = shape.split(":").map(e => e.split(""));
    let colors = [c1, c2, c3, c4];
    for (let i = 0; i < 4; i++) {
        for (let j = layers.length - 1; j >= 0; --j) {
            if (layers[j][2 * i] != "-") {
                layers[j][2 * i + 1] = colors[i];
            }
        }
    }
    let result = layers.map(e => e.join("")).join(":");
    return (cache[recipeId] = ShapeDefinition.fromShortKey(result));
}

// returns trackProduction
export function QuaduoPainterProcess({ items, trackProduction, entity, outItems, self }) {
    // console.log("QuaduoPainter PROCESSES");

    let input = items.map(e => e.item.getHash());

    let out1 = colorShape(input[0], input[2], input[3], input[4], input[5]);
    outItems.push({
        item: new ShapeItem(out1),
    });
    let out2 = colorShape(input[1], input[2], input[3], input[4], input[5]);
    outItems.push({
        item: new ShapeItem(out2),
    });

    // trackProduction
    return true;
}

export const Sprite = {
    sprite: `sprites/buildings/${id}.png`,
    url: `./res/${id}.png`,
    w: 756,
    h: 378,
};
export const SpriteBp = {
    sprite: `sprites/blueprints/${id}.png`,
    url: `./res/${id}.png`, // NOT BP ATM
    w: 756,
    h: 378,
};

export const unstackerBuildingData = {
    id,
    building: MetaQuaduoPainterBuilding,
    toolbar: 2,
    sprite: Sprite,
    spriteBp: SpriteBp,
    process: QuaduoPainterProcess,
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
    Tname: "QuaduoPainter",
    Tdesc: "Paints all layers of 2 shapes on insane speed.",
    speed: 1 / 2,
    speedClass: "processors",
    meta: MetaQuaduoPainterBuilding,
    variantId: 560,

    keyCode: "9",
    toolbarIndex: 9,
};

export default unstackerBuildingData;
