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
    enumDirection,
    ItemProcessorComponent
 } from "../gameData";

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
        return root.hubGoals.isRewardUnlocked(`reward_${ id }`);
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
        entity.addComponent(new TargetShapeCheckerComponent({}));
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.right,
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

export class TargetShapeCheckerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [TargetShapeCheckerComponent]);

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

        const tscComp = entity.components[id];
        const storedItem = tscComp.storedItem;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
        if (storedItem !== null) {
            storedItem.draw(center.x, center.y, parameters, 30);
        }
        this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);

        context.font = "bold 10px GameFont";
        context.textAlign = "center";
        context.fillStyle = "#64666e";
        context.fillText(tscComp.filterType, center.x, center.y + 25.5);

        context.textAlign = "left";
    }
}

// returns trackProduction
export function targetShapeCheckerProcess({ items, trackProduction, entity, outItems, self }) {
    // console.log("targetShapeChecker PROCESSES");

    const inputItem = /** @type {ShapeItem} */ (items[0].item);
    trackProduction = false;

    const tscComponent = entity.components[id];
    if (!tscComponent.isfil && inputItem instanceof ShapeItem) {
        // setting filter type:
        let item = inputItem.definition.getHash();
        //shape:
        if (item.match(/([^-][^-]------|--[^-][^-]----|----[^-][^-]--|------[^-][^-])$/)) {
            let m = item.match(/([^-][^-])(--)*$/);
            tscComponent.filterType = "shape";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = (m.index % 9) / 2;
            let topKey = `${"--".repeat(index)}${tscComponent.filter}u${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
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
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
        }
        // color:
        else if (item.match(/(.[^u].u.u.u|.u.[^u].u.u|.u.u.[^u].u|.u.u.u.[^u])$/)) {
            let m = item.match(/([^u])(.u)*$/);
            tscComponent.filterType = "color";
            tscComponent.filterIndex = m.index;
            tscComponent.filter = m[0].slice(0, 1);
            tscComponent.isfil = true;
            let layer = item.split(":").length;
            let index = ((m.index % 9) - 1) / 2;
            let topKey = `${"--".repeat(index)}C${tscComponent.filter}${"--".repeat(3 - index)}`;
            let key = (topKey + ":").repeat(layer - 1) + topKey;
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
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
            tscComponent.storedItem = new ShapeItem(ShapeDefinition.fromShortKey(key));
        }
        return false;
    }

    if (tscComponent.isfil) {
        let goal = self.root.hubGoals.currentGoal.definition.getHash();

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

    return trackProduction;
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

export const checker = {
    id: "checker",
    component: TargetShapeCheckerComponent,
    building: MetaTargetShapeCheckerBuilding,
    toolbar: 2,
    system: TargetShapeCheckerSystem,
    sysOrder: 4.5,
    process: targetShapeCheckerProcess,
    speed: 100,
    draw: true,
    sprite: tscSprite,
    spriteBp: tscSpriteBp,

    variantId: 500,
    meta: MetaTargetShapeCheckerBuilding,
    speed: 2,
};

export default checker;
