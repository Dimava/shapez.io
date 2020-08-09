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

const id = "unstacker";

export class MetaUnstackerBuilding extends MetaBuilding {
    constructor() {
        super(id);
    }

    getDimensions() {
        return new Vector(2, 1);
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
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
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
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                    },
                ],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemType.shape,
                    },
                ],
            })
        );
    }
}

// returns trackProduction
export function UnstackerProcess({ items, trackProduction, entity, outItems, self }) {
    // console.log("Unstacker PROCESSES");

    const inputItem = items[0].item;
    trackProduction = true;

    //     debugger;
    let input = items.map(e => e.item.definition.getHash());

    let [it] = input;
    let out = [];
    let a = it.split(":");
    let top = a.shift();
    let right = a.join(":");
    out = [top, right];

    for (let i = 0; i < out.length; ++i) {
        if (!out[i]) continue;
        outItems.push({
            item: new ShapeItem(ShapeDefinition.fromShortKey(out[i])),
            requiredSlot: i,
        });
    }

    return trackProduction;
}

export const Sprite = {
    sprite: "sprites/buildings/unstacker.png",
    url: "./res/unstacker.png",
    w: 192 * 2,
    h: 192,
};
export const SpriteBp = {
    sprite: "sprites/blueprints/unstacker.png",
    url: "./res/unstacker-bp.png",
    w: 192 * 2,
    h: 192,
};

export const unstackerBuildingData = {
    id,
    building: MetaUnstackerBuilding,
    toolbar: 2,
    sprite: Sprite,
    spriteBp: SpriteBp,
    process: UnstackerProcess,
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
    Tname: "Unstacker",
    Tdesc: "Splits lowest layer out of a shape.",
    speed: 1 / 5,
    speedClass: "processors",
    meta: MetaUnstackerBuilding,
    variantId: 530,

    keyCode: "7",
    toolbarIndex: 7,
};

export default unstackerBuildingData;
