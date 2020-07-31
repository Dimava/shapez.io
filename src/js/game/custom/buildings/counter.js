import { types } from "../../../savegame/serialization";
import { Component } from "../../component";
import { BaseItem } from "../../base_item";
import { gItemRegistry } from "../../../core/global_registries";
import { GameTime } from "../../time/game_time";

import { DrawParameters } from "../../../core/draw_parameters";
import { Entity } from "../../entity";
import { GameSystemWithFilter } from "../../game_system_with_filter";
import { ShapeItem } from "../../items/shape_item";
import { ColorItem } from "../../items/color_item";

import { formatItemsPerSecond } from "../../../core/utils";
import { enumDirection, Vector } from "../../../core/vector";
import { T } from "../../../translations";
import { ItemAcceptorComponent } from "../../components/item_acceptor";
import { ItemEjectorComponent } from "../../components/item_ejector";
import { MetaBuilding } from "../../meta_building";
import { GameRoot } from "../../root";
import { enumItemType } from "../../base_item";

import { enumItemProcessorTypes, ItemProcessorComponent } from "../../components/item_processor";

const id = "counter";

export class ItemCounterComponent extends Component {
    static getId() {
        return id;
    }

    static getSchema() {
        return {
            // inputSlots: types.array(
            //     types.structured({
            //         item: types.obj(gItemRegistry),
            //         sourceSlot: types.uint,
            //     })
            // ),
            itemTickHistory: types.array(types.float),
        };
    }

    duplicateWithoutContents() {
        return new ItemCounterComponent();
    }

    constructor() {
        super();

        /**
         * Maintained every TODO game tick, this aray contains the item counts for every tick in the past 1 second.
         * @type {number[]}
         */
        this.itemTickHistory = Array(24).fill(0);

        /** @type {number} Calculated and set every second. This is a read only property. */
        this.averageItemsPerSecond = 0;

        /** @type {number} - Last time the averageItemsPerSecond property was reset. */
        this.lastResetTime = 0;
    }

    getCurrentTime() {}
}

export class CounterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemCounterComponent]);
    }

    update() {
        // for (let i = 0; i < this.allEntities.length; ++i) {
        //     const entity = this.allEntities[i];
        //     const counterComp = entity.components.Counter;
        // }
    }

    // Only render the items/s overlay if the entity is on screen
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

        /** @type {ItemCounterComponent} */
        const counterComp = entity.components[id];

        // cal avg: //

        const analyzedTime = 5;
        let now = this.root.time.timeSeconds;
        // now = performance.now() / 1e3;
        const filtered = counterComp.itemTickHistory.map(e => now - e).filter(e => e < analyzedTime);
        const min = Math.min(analyzedTime / 2, ...filtered),
            max = Math.max(analyzedTime / 10, ...filtered);
        const avg = !filtered.length ? 0 : (filtered.length - 1) / (max - min);
        counterComp.averageItemsPerSecond = avg;

        // // // // //

        context.save();
        context.globalAlpha = 1;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
        context.translate(center.x, center.y + 0.15);
        context.scale(0.8, 1);

        const size = counterComp.averageItemsPerSecond >= 10 ? 7 : 9;
        context.font = `bold ${size}px GameFont`; // GameFont does not work
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#64666e";
        context.fillStyle = "red";
        context.fillText(counterComp.averageItemsPerSecond.toFixed(1), 0, 0);

        context.restore();
    }
}

export class MetaCounterBuilding extends MetaBuilding {
    constructor() {
        super(id);
    }

    /**
     * @returns {string} Colour used to represent this building when zoomed out.
     */
    getSilhouetteColor() {
        return "#444e81"; // Dark Blue
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getBeltBaseSpeed("regular");
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * The counter is unlocked once the belt speed reaches 20 (items/s). This is around the time when items on
     * a belt begin to blurr. It is also late enough in the game that a player would understand and appreciate
     * this building.
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(`reward_${ id }`);
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
        entity.addComponent(new ItemCounterComponent());

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
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
export function counterProcess({ items, trackProduction, entity, outItems, self }) {
    // console.log("counter PROCESSES");

    const inputItem = items[0].item;
    trackProduction = false;

    /** @type {ItemCounterComponent} */
    const counterComp = entity.components.Counter;
    counterComp.itemTickHistory.shift();
    let now = self.root.time.timeSeconds;
    // now = performance.now() / 1e3;
    counterComp.itemTickHistory.push(now);

    outItems.push({
        item: inputItem,
    });

    return trackProduction;
}

export const counterSprite = {
    sprite: "sprites/buildings/counter.png",
    url: "./res/counter.png",
    w: 192,
    h: 192,
};
export const counterSpriteBp = {
    sprite: "sprites/blueprints/counter.png",
    url: "./res/counter-bp.png",
    w: 192,
    h: 192,
};

export const counterBuildingData = {
    id,
    component: ItemCounterComponent,
    building: MetaCounterBuilding,
    toolbar: 1,
    system: CounterSystem,
    sprite: counterSprite,
    spriteBp: counterSpriteBp,
    process: counterProcess,
    // TODO: keybinding in KEYMAPPINGS
    // TODO: T
    Tname: "Counter",
    Tdesc: "Displays number of items currently going through it.",
    variantId: 510,
    meta: MetaCounterBuilding,
    speed: 2,
};

export default counterBuildingData;
