import { formatItemsPerSecond } from "../../../core/utils";
import { enumDirection, Vector } from "../../../core/vector";
import { T } from "../../../translations";
import { enumItemType } from "../../base_item";
import { EnergyConsumerComponent } from "../../components/energy_consumer";
import { ItemAcceptorComponent } from "../../components/item_acceptor";
import { ItemEjectorComponent } from "../../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../../components/item_processor";
import { enumPinSlotType, WiredPinsComponent } from "../../components/wired_pins";
import { Entity } from "../../entity";
import { MetaBuilding } from "../../meta_building";
import { enumLayer, GameRoot } from "../../root";

import { ColorItem, ShapeItem } from "../gameData";
import { enumInvertedColors } from "../../colors";

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
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.advancedProcessor);
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
                processorType: enumItemProcessorTypes[id],
            })
        );
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    { pos: new Vector(1, 0), direction: enumDirection.right },
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
        //                 direction: enumDirection.top,
        //                 type: enumPinSlotType.positiveEnergyAcceptor,
        //             },
        //             {
        //                 pos: new Vector(1, 0),
        //                 direction: enumDirection.top,
        //                 type: enumPinSlotType.negativeEnergyEjector,
        //             },
        //         ],
        //     })
        // );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                    },
                    // {
                    //     pos: new Vector(0, 0),
                    //     directions: [enumDirection.top],
                    //     filter: enumItemType.positiveEnergy,
                    //     layer: enumLayer.wires,
                    // },
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.top],
                        filter: enumItemType.shape,
                    },
                ],
            })
        );
    }
}


// returns trackProduction
export function Process({ items, trackProduction, entity, outItems, self }) {
    const item = items[0].item;

    const processorComp = entity.components.ItemProcessor;
    if (!processorComp.charges) {
    	let hash = items[1].item.getHash().slice(0, 8);
    	processorComp.charges = hash.split('').filter(e => e == 'C').length - 1;
    } else {
        processorComp.inputSlots = items.slice(1);
        processorComp.charges--;
    }

    if (item.getItemType() === enumItemType.color) {
        const colorItem = /** @type {ColorItem} */ (items[0].item);
        const newColor = enumInvertedColors[colorItem.color];
        outItems.push({
            item: new ColorItem(newColor),
            requiredSlot: 0,
        });
    } else if (item.getItemType() === enumItemType.shape) {
        const shapeItem = /** @type {ShapeItem} */ (items[0].item);
        const newItem = self.root.shapeDefinitionMgr.shapeActionInvertColors(
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
}

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
