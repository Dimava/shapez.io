import {
    MetaBuilding,
    T,
    ItemProcessorComponent,
    ItemEjectorComponent,
    ItemAcceptorComponent,
    Vector,
    formatItemsPerSecond,
    ShapeItem,
    GameRoot,
    Entity,
    ColorItem,
    enumInvertedColors,
} from "../gameData";
/** @typedef {import('../gameData').ModData} ModData */
/** @typedef {import('../gameData').ModProcessData} ModProcessData */

const id = "advanced_processor";

export class MetaInverterBuilding extends MetaBuilding {
    constructor() {
        super(id);
    }

    getSilhouetteColor() {
        return "#25d7b8";
    }

    getDimensions(variant) {
        return new Vector(2, 2);
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
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(`reward_${id}`);
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
                    { pos: new Vector(1, 0), direction: "right" },
                    // { pos: new Vector(1, 0), direction: enumDirection.top, layer: enumLayer.wires },
                ],
            })
        );
        // entity.addComponent(
        //     new EnergyConsumerComponent({
        //         bufferSize: 3,
        //         perCharge: 1,
        //         batteryPosition: new Vector(0.63, 0.7),
        //         acceptorSlotIndex: 1,
        //         ejectorSlotIndex: 1,
        //     })
        // );

        // entity.addComponent(
        //     new WiredPinsComponent({
        //         slots: [
        //             {
        //                 pos: new Vector(0, 0),
        //                 direction: "top",
        //                 type: "positiveEnergyAcceptor",
        //             },
        //             {
        //                 pos: new Vector(1, 0),
        //                 direction: "top",
        //                 type: "negativeEnergyEjector",
        //             },
        //         ],
        //     })
        // );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: ["left"],
                    },
                    // {
                    //     pos: new Vector(0, 0),
                    //     directions: ["top"],
                    //     filter: "positiveEnergy",
                    //     layer: "wires",
                    // },
                    {
                        pos: new Vector(0, 0),
                        directions: ["top"],
                        filter: "shape",
                    },
                ],
            })
        );
    }
}


/** @param {ModProcessData} */
export function Process({ items, itemsBySlot, trackProduction, entity, outItems, system }) {
    const item = items[0];

    const processorComp = entity.components.ItemProcessor;
    if (!processorComp.charges) {
    	let hash = items[1].getHash().slice(0, 8);
    	processorComp.charges = hash.split('').filter(e => e == 'C').length - 1;
    } else {
        processorComp.inputSlots = itemsBySlot.slice(1);
        processorComp.charges--;
    }

    if (item.getItemType() === "color") {
        const colorItem = /** @type {ColorItem} */ (items[0]);
        const newColor = enumInvertedColors[colorItem.color];
        outItems.push({
            item: new ColorItem(newColor),
            requiredSlot: 0,
        });
    } else if (item.getItemType() === "shape") {
        const shapeItem = /** @type {ShapeItem} */ (items[0]);
        const newItem = system.root.shapeDefinitionMgr.shapeActionInvertColors(
            shapeItem.definition
        );

        outItems.push({
            item: new ShapeItem(newItem),
            requiredSlot: 0,
        });
    } else {
        assertAlways(
            false,
            "Bad item type: " + item.getItemType() + " for advanced processor."
        );
    }
    return trackProduction;
}

// TODO: keyCode, toolbarIndex
/** @type {ModData} */
export const data = {
    id,
    building: MetaInverterBuilding,
    toolbar: 2,
    process: Process,
    speed: 1 / 3,
    speedClass: "processors",
    meta: MetaInverterBuilding,
    variantId: 31,

    Tname: "Inverter",
    Tdesc: "Inverts colors of shapes and paints using flat Circles. Inverts 1 item per circle quad.",
};

export default data;
