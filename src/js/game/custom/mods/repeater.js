import {
    Component,
    types,
    gItemRegistry,
    BaseItem,
    Vector,
    globalConfig,
    ItemAcceptorComponent,
    ItemEjectorComponent,
    enumItemProcessorTypes,
    Entity,
    MetaBuilding,
    GameRoot,
    enumHubGoalRewards,
    T,
    formatItemsPerSecond,
    GameSystemWithFilter,
    DrawParameters,
    formatBigNumber,
    Loader,
    ShapeItem,
    ShapeDefinition,
    ColorItem,
    enumDirection,
    ItemProcessorComponent,
} from "../gameData";

const id = "repeater";
const color = "#ff6000";

export class RepeaterComponent extends Component {
    static getId() {
        return id;
    }

    static getSchema() {
        return {
            itemHash: types.string,
            storedItem: types.nullable(types.obj(gItemRegistry)),
            charges: types.int,
        };
    }
    constructor({ itemHash = "", storedItem = null, charges = 0 }) {
        super();

        this.itemHash = itemHash;
        /**
         * Currently stored item
         * @type {BaseItem}
         */
        this.storedItem = storedItem;
        this.charges = charges;
    }

    duplicateWithoutContents() {
        return new RepeaterComponent({ itemHash: this.itemHash, storedItem: this.storedItem });
    }
}

export class MetaRepeaterBuilding extends MetaBuilding {
    constructor() {
        super(id);
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getSilhouetteColor() {
        return color;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return true; // is a debug building
        // return root.hubGoals.isRewardUnlocked(`reward_${ id }`);
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes[id]);
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
                processorType: enumItemProcessorTypes[id],
            })
        );
        entity.addComponent(new RepeaterComponent({}));
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
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                ],
            })
        );
    }
}

export class RepeaterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [RepeaterComponent]);

        // this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
    }

    update() {
        const storedShapes = this.root.hubGoals.storedShapes;

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            /** @type {RepeaterComponent} */
            const comp = entity.components[id];

            let processorComp = entity.components.ItemProcessor;
            while (processorComp.inputSlots.length) {
                let inputSlot = processorComp.inputSlots.pop();
                if (inputSlot.item.getHash() != comp.itemHash) {
                    comp.storedItem = inputSlot.item;
                    comp.itemHash = inputSlot.item.getHash();
                    comp.charges = 0;
                }
                comp.charges = Math.min(comp.charges + 1, 500);
            }

            let item = comp.storedItem;
            let hash = comp.itemHash;
            if (item) {
                let slots = entity.components.ItemEjector.slots;
                for (let i = 0; i < slots.length; ++i) {
                    if (!slots[i].item) {
                        if (globalConfig.debug.blueprintsNoCost) {
                            comp.charges = 500;
                        }
                        if (!comp.charges) {
                            if (!storedShapes[hash]) break;
                            storedShapes[hash]--;
                            comp.charges++;
                        }
                        comp.charges--;
                        slots[i].item =
                            item instanceof ShapeItem
                                ? ShapeItem.createFromHash(comp.itemHash)
                                : ColorItem.createFromHash(comp.itemHash);
                    }
                }
            }
        }
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const context = parameters.context;
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        const comp = entity.components[id];
        const storedItem = comp.storedItem;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
        if (storedItem !== null) {
            context.save();
            context.translate(center.x, center.y);
            context.scale(0.8, 0.8);
            storedItem.draw(0, 0, parameters, 30);
            context.restore();
        }
        // leave here for case it will show count
        // this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);
    }
}

// returns trackProduction
export function repeaterProcess({ items, trackProduction, entity, outItems, self }) {
    // console.log("repeater PROCESSES");

    const inputItem = /** @type {ShapeItem} */ (items[0].item);
    trackProduction = false;

    const comp = entity.components[id];
    if (inputItem.getHash() != comp.itemHash) {
        comp.storedItem = inputItem;
        comp.itemHash = inputItem.getHash();
        comp.charges = 0;
    }
    comp.charges = Math.min(comp.charges + 1, 500);

    return trackProduction;
}

export const tscSprite = [
    {
        // data:
        sprite: `sprites/buildings/${id}.png`,
        w: 192,
        h: 192,
    },
    {
        // base:
        path: "M 11,31 v 130 l 20,20 h 130 l 20,-20 v -130 l -20,-20 h -130 z",
    },
    // {
    //     // red cross:
    //     path: "M 175,40 l 12,12 -12,12 12,12 -12,12 -12,-12 -12,12 -12,-12 12,-12 -12,-12 12,-12 12,12 z",
    //     fill: "red",
    // },
    {
        // green arrow:
        path: "M 35,45 l 30,-30 30,30 z",
        fill: "lightgreen",
    },
    {
        // green arrow:
        path: "M 156,45 l -30,-30 -30,30 z",
        fill: "lightgreen",
    },
    {
        // blue arrow:
        path: "M 60,45 l 35,-35 35,35 z",
        fill: "lightyellow",
    },
];
export const tscSpriteBp = [
    {
        // data:
        sprite: `sprites/blueprints/${id}.png`,
        w: 192,
        h: 192,
        transparent: true,
    },
    {
        // base:
        path: "M 11,31 v 130 l 20,20 h 130 l 20,-20 v -130 l -20,-20 h -130 z",
        fill: "#6CD1FF",
        stroke: "#56A7D8",
    },
    // {
    //     // red cross:
    //     path: "M 175,40 l 12,12 -12,12 12,12 -12,12 -12,-12 -12,12 -12,-12 12,-12 -12,-12 12,-12 12,12 z",
    //     fill: "#5EB7ED",
    //     stroke: "#56A7D8",
    // },
    {
        // green arrow:
        path: "M 35,45 l 30,-30 30,30 z",
        fill: "#56A7D8",
    },
    {
        // green arrow:
        path: "M 156,45 l -30,-30 -30,30 z",
        fill: "#56A7D8",
    },
    {
        // blue arrow:
        path: "M 60,45 l 35,-35 35,35 z",
        fill: "#5EB7ED",
        stroke: "#56A7D8",
    },
];

export const repeater = {
    id,
    component: RepeaterComponent,
    building: MetaRepeaterBuilding,
    toolbar: 2,
    system: RepeaterSystem,
    sysOrder: 4.5,
    process: repeaterProcess,
    draw: true,
    sprite: tscSprite,
    spriteBp: tscSpriteBp,

    variantId: 550,
    meta: MetaRepeaterBuilding,
    speed: 2,
    Tname: "Repeater",
    Tdesc: "Duplicates shapes or colors, taking them from hub. Can store up to 1000 items itself.",

    keyCode: "4",
    toolbarIndex: 4,
};

export default repeater;
