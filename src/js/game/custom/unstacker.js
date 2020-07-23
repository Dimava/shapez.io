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
} from "./gameData";

export class MetaUnstackerBuilding extends MetaBuilding {
    constructor() {
        super("unstacker");
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
        return true; // root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_sorter);
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed("unstacker");
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
                processorType: "unstacker",
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
                    },
                ],
            })
        );
    }
}

// returns trackProduction
export function UnstackerProcess({ items, trackProduction, entity, outItems, self }) {
    console.log("Unstacker PROCESSES");

    const inputItem = items[0].item;
    trackProduction = false;

    //     debugger;
    let input = items.map(e => e.item.definition.getHash());

    let [it] = input;
    let out = [];
    let a = it.split(":");
    let right = a.pop();
    let top = a.join(":");
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

export const UnstackerSprite = [
    {
        // data:
        w: 192 * 2,
        h: 192,
    },
    {
        // base:
        path: "M 0 0 L 0 100 100 100 100 0 z",
    },
    {
        // red cross:
        path: "M 175,40 l 12,12 -12,12 12,12 -12,12 -12,-12 -12,12 -12,-12 12,-12 -12,-12 12,-12 12,12 z",
        fill: "red",
    },
    {
        // green arrow:
        path: "M 40,35 l 30,-30 30,30 z",
        fill: "lightgreen",
    },
];
export const UnstackerSpriteBp = [
    {
        // data:
        w: 192 * 2,
        h: 192,
    },
    {
        // base:
        path: "M 11,31 v 130 l 20,20 h 130 l 20,-20 v -130 l -20,-20 h -130 z",
        fill: "#6CD1FF",
        stroke: "#56A7D8",
    },
    {
        // red cross:
        path: "M 175,40 l 12,12 -12,12 12,12 -12,12 -12,-12 -12,12 -12,-12 12,-12 -12,-12 12,-12 12,12 z",
        fill: "#5EB7ED",
        stroke: "#56A7D8",
    },
    {
        // green arrow:
        path: "M 40,35 l 30,-30 30,30 z",
        fill: "#5EB7ED",
        stroke: "#56A7D8",
    },
];

export const unstackerBuildingData = {
    id: "unstacker",
    building: MetaUnstackerBuilding,
    toolbar: true,
    speed: 100,
    sprite: UnstackerSprite,
    spriteBp: UnstackerSpriteBp,
    process: UnstackerProcess,
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
    Tname: "Unstacker",
    Tdesc: "Whatever...",
};
