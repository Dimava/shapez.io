import {
    Component,
    types,
    gItemRegistry,
    BaseItem,
    Vector,
    ItemAcceptorComponent,
    ItemEjectorComponent,
    Entity,
    MetaBuilding,
    GameRoot,
    T,
    formatItemsPerSecond,
    ModSystem,
    DrawParameters,
    Loader,
    ShapeItem,
    ItemProcessorComponent,
} from "../gameData";
/** @typedef {import('../gameData').ModData} ModData */
/** @typedef {import('../gameData').ModProcessData} ModProcessData */

const id = "checker";
const color = "#ff6000";

export class TargetShapeCheckerComponent extends Component {
    static getId() {
        return id;
    }

    static getSchema() {
        return {
            filter: types.string,
            filterIndex: types.int,
            filterType: types.string,
            isfil: types.bool,
            storedItem: types.nullable(types.obj(gItemRegistry)),
        };
    }
    constructor({
        filter = "unset",
        filterIndex = 0,
        filterType = "unset",
        isfil = false,
        storedItem = null,
    }) {
        super();

        this.filter = filter;
        this.filterIndex = filterIndex;
        this.filterType = filterType;
        this.isfil = isfil;
        /**
         * Currently stored item
         * @type {BaseItem}
         */
        this.storedItem = storedItem;
    }

    duplicateWithoutContents() {
        return new TargetShapeCheckerComponent(this);
    }
}

export class MetaTargetShapeCheckerBuilding extends MetaBuilding {
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
        entity.addComponent(new TargetShapeCheckerComponent({}));
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: "top",
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: "right",
                    },
                ],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: ["bottom"],
                    },
                ],
            })
        );
    }
}

export class TargetShapeCheckerSystem extends ModSystem(id, TargetShapeCheckerComponent) {
    constructor(root) {
        super(root);

        this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
        this.goal = "";
    }

    update() {
        let newGoal = this.root.hubGoals.currentGoal.definition.getHash();
        if (newGoal != this.goal) {
            for (let i = 0; i < this.allEntities.length; ++i) {
                const entity = this.allEntities[i];
                let ejectorComp = entity.components.ItemEjector;
                for (let slot of ejectorComp.slots) {
                    slot.item = null;
                }
            }
            this.goal = newGoal;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} context
     * @param {Entity} entity
     * @param {TargetShapeCheckerComponent} [tscComp]
     * @param {DrawParameters} [parameters]
     */
    drawEntity(context, entity, tscComp, parameters) {
        const staticComp = entity.components.StaticMapEntity;

        const storedItem = tscComp.storedItem;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
        if (storedItem !== null) {
            storedItem.drawItemCenteredClipped(center.x, center.y, parameters, 30);
        }
        this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);

        context.font = "bold 10px GameFont";
        context.textAlign = "center";
        context.fillStyle = "#64666e";
        context.fillText(tscComp.filterType, center.x, center.y + 25.5);

        context.textAlign = "left";
    }
}

/** @param {ModProcessData} */
export function targetShapeCheckerProcess({ items, trackProduction, entity, outItems, system }) {
    // console.log("targetShapeChecker PROCESSES");

    const inputItem = items[0];
    trackProduction = false;

    const tscComponent = entity.components[id];
    if (!tscComponent.isfil && inputItem instanceof ShapeItem) {
        // setting filter type:
        let item = inputItem.getHash();
        // color:
        if (
            item.match(
                /(.[^u-].[u-].[u-].[u-]|.[u-].[^u-].[u-].[u-]|.[u-].[u-].[^u-].[u-]|.[u-].[u-].[u-].[^u-])$/
            )
        ) {
            let m = item.match(/([^u-])(.[u-])*$/);
            tscComponent.filterType = "color";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = ((m.index % 9) - 1) / 2;
            let topKey = `${"--".repeat(index)}C${tscComponent.filter}${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = ShapeItem.createFromHash(key);
        }
        //shape:
        else if (item.match(/([^-][^-]------|--[^-][^-]----|----[^-][^-]--|------[^-][^-])$/)) {
            let m = item.match(/([^-][^-])(--)*$/);
            tscComponent.filterType = "shape";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = (m.index % 9) / 2;
            let topKey = `${"--".repeat(index)}${tscComponent.filter}u${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = ShapeItem.createFromHash(key);
        }
        // hole:
        else if (
            item.match(
                /(--[^-][^-][^-][^-][^-][^-]|[^-][^-]--[^-][^-][^-][^-]|[^-][^-][^-][^-]--[^-][^-]|[^-][^-][^-][^-][^-][^-]--)$/
            )
        ) {
            let m = item.match(/(--)([^-][^-])*$/);
            tscComponent.filterType = "hole";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = (m.index % 9) / 2;
            let topKey = `${"Cu".repeat(index)}--${"Cu".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = ShapeItem.createFromHash(key);
        }
        // uncolored:
        else if (
            item.match(
                /(.u.[^u-].[^u-].[^u-]|.[^u-].u.[^u-].[^u-]|.[^u-].[^u-].u.[^u-]|.[^u-].[^u-].[^u-].u)$/
            )
        ) {
            let m = item.match(/(u)(.[^u])*$/);
            tscComponent.filterType = "uncolored";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = ((m.index % 9) - 1) / 2;
            let topKey = `${"--".repeat(index)}C${tscComponent.filter}${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = ShapeItem.createFromHash(key);
        }
        return false;
    }

    if (tscComponent.isfil) {
        let goal = system.root.hubGoals.currentGoal.definition.getHash();

        let matches = true;

        if (tscComponent.filterType == "color") {
            matches = goal[tscComponent.filterIndex] == tscComponent.filter;
        } else if (tscComponent.filterType == "uncolored") {
            matches =
                !goal[tscComponent.filterIndex] || goal[tscComponent.filterIndex] == tscComponent.filter;
        } else if (tscComponent.filterType == "shape") {
            matches = goal[tscComponent.filterIndex] == tscComponent.filter;
        } else if (tscComponent.filterType == "hole") {
            matches =
                !goal[tscComponent.filterIndex] || goal[tscComponent.filterIndex] == tscComponent.filter;
        }
        outItems.push({
            item: inputItem,
            requiredSlot: matches ? 0 : 1,
        });
    }

    return false;
}

export const tscSprite = [
    {
        // data:
        sprite: "sprites/buildings/targetShapeChecker.png",
        w: 192,
        h: 192,
    },
    {
        // base:
        path: "M 11,31 v 130 l 20,20 h 130 l 20,-20 v -130 l -20,-20 h -130 z",
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
export const tscSpriteBp = [
    {
        // data:
        sprite: "sprites/blueprints/targetShapeChecker.png",
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

const tutorial = [
    {
        id: `checker_build`,
        /** @param {GameRoot} root */
        condition(root) {
            let entities = root.entityMgr.getAllWithComponent(TargetShapeCheckerComponent);
            return !entities.length;
        },
        Tdesc: "Checker is VERY HARD TO EXPLAIN so here's tutorial. Build one for a start.",
    },
    {
        id: `checker_shapes`,
        /** @param {GameRoot} root */
        condition(root) {
            let entities = root.entityMgr.getAllWithComponent(TargetShapeCheckerComponent);
            return !entities.find(e => e.components[id].filter == 'C' && e.components[id].filterIndex == 0) ||
                !entities.find(e => e.components[id].filter == 'R' && e.components[id].filterIndex == 0);
        },
        Tdesc: "Put in a single quad of a shape to make a SHAPE filter. Make circle and square filters to proceed.",
    },
    {
        id: `checker_colors`,
        /** @param {GameRoot} root */
        condition(root) {
            let entities = root.entityMgr.getAllWithComponent(TargetShapeCheckerComponent);
            return !entities.find(e => e.components[id].filter == 'r' && e.components[id].filterIndex == 1) ||
                !entities.find(e => e.components[id].filter == 'g' && e.components[id].filterIndex == 1);
        },
        Tdesc: "Put in a single quad of a colored shape to make a COLOR filter. Make red and greed filters to proceed.",
    },
    {
        id: `checker_lines`,
        /** @param {GameRoot} root */
        condition(root) {
            let entities = root.entityMgr.getAllWithComponent(TargetShapeCheckerComponent);
            return !entities.find(e => e.components[id].filter == 'w');
        },
        Tdesc: "Checkers choose their output based on current goal. Any input is accepted. Make a white filter to proceed.",
    },
    {
        id: `checker_advanced`,
        /** @param {GameRoot} root */
        condition(root) { // AaAaAaAa:BbBbBbBb:CcCcCcCc:DdDdDdDd
            let entities = root.entityMgr.getAllWithComponent(TargetShapeCheckerComponent);
            return !entities.find(e => e.components[id].filter == '-' && e.components[id].filterIndex > 17 && e.components[id].filterIndex < 27) ||
            !entities.find(e => e.components[id].filter == 'u' && e.components[id].filterIndex > 27);
        },
        Tdesc: ". Make filters for a hole on 3rd layer and for uncolored quad on 4th to finish tutorial.",
    },
];

const goal = {
    shape: "RuCrSgWb:CcRmWySu:SwWwRwCw",
    required: 40e3,
    reward: "checker",
    title: "The Full Automation",
    desc:
        "Say hello to the <strong>Checker</strong>, the king of Automation." +
        " - Set it a simple filter - a <strong>shape quad</strong> or a <strong>colored quad</strong>" +
        " and it will <strong>select path</strong> depending on <strong>current Hub Goal</strong>, itself, forever!" +
        " In case you need some more advanced options, <strong>layer</strong> quads to filter a higher layer," +
        " color 3 of 4 quads for <strong>uncolored</strong> or leave a single <strong>hole</strong> to get a hole one",
    tutorial,
};

/** @type {ModData} */
export const checker = {
    id: "checker",
    component: TargetShapeCheckerComponent,
    building: MetaTargetShapeCheckerBuilding,
    toolbar: 2,
    system: TargetShapeCheckerSystem,
    process: targetShapeCheckerProcess,
    sprite: tscSprite,
    spriteBp: tscSpriteBp,

    variantId: 500,
    meta: MetaTargetShapeCheckerBuilding,
    speed: 2,

    Tname: "Checker",
    Tdesc:
        "Toggles output direction depending on current hub goal shape, allowing automation of random levels.",

    goal,

    keyCode: "0",
    toolbarIndex: 10,
};

export default checker;
