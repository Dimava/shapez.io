import { globalConfig } from "../core/config";
import { clamp, findNiceIntegerValue, randomChoice, randomInt } from "../core/utils";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { enumColors, allColorData } from "./colors";
import { allShapeData } from "./shapes";
import { enumItemProcessorTypes } from "./components/item_processor";
import { GameRoot, enumLayer } from "./root";
import { enumSubShape, ShapeDefinition } from "./shape_definition";
import { enumHubGoalRewards, tutorialGoals, fixedGoals } from "./tutorial_goals";
import { UPGRADES, blueprintShape } from "./upgrades";
import { customBuildingData } from "./custom/modBuildings";
import { RandomNumberGenerator } from "../core/rng";
import { ColorItem } from "./items/color_item";

export class HubGoals extends BasicSerializableObject {
    static getId() {
        return "HubGoals";
    }

    static getSchema() {
        return {
            level: types.uint,
            storedShapes: types.keyValueMap(types.uint),
            upgradeLevels: types.keyValueMap(types.uint),

            currentGoal: types.structured({
                definition: types.knownType(ShapeDefinition),
                required: types.uint,
                reward: types.nullable(types.enum(enumHubGoalRewards)),
            }),
        };
    }

    deserialize(data) {
        const errorCode = super.deserialize(data);
        if (errorCode) {
            return errorCode;
        }

        // Compute gained rewards
        for (let i = 0; i < this.level - 1; ++i) {
            if (i < tutorialGoals.length) {
                const reward = tutorialGoals[i].reward;
                this.gainedRewards[reward] = (this.gainedRewards[reward] || 0) + 1;
            }
        }
        for (let i = 0; i < fixedGoals.length; ++i) {
            if (fixedGoals[i].minLevel < this.level) {
                const reward = fixedGoals[i].reward;
                this.gainedRewards[reward] =
                    (this.gainedRewards[reward] || 0) +
                    Math.min(fixedGoals[i].maxLevel, this.level) -
                    fixedGoals[i].minLevel;
            }
        }

        // Compute upgrade improvements
        for (const upgradeId in UPGRADES) {
            const upgradeHandle = UPGRADES[upgradeId];
            const level = this.upgradeLevels[upgradeId] || 0;
            let totalImprovement = upgradeHandle.baseValue || 1;
            for (let i = 0; i < level; ++i) {
                totalImprovement += upgradeHandle.tiers[i].improvement;
            }
            this.upgradeImprovements[upgradeId] = totalImprovement;
        }

        // Compute current goal
        this.createNextGoal();
    }

    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        super();

        this.root = root;

        this.level = 1;

        /**
         * Which story rewards we already gained
         * @type {Object.<string, number>}
         */
        this.gainedRewards = {};

        /**
         * Mapping from shape hash -> amount
         * @type {Object<string, number>}
         */
        this.storedShapes = {};

        /**
         * Stores the levels for all upgrades
         * @type {Object<string, number>}
         */
        this.upgradeLevels = {};

        /**
         * Stores the improvements for all upgrades
         * @type {Object<string, number>}
         */
        this.upgradeImprovements = {};
        for (const key in UPGRADES) {
            this.upgradeImprovements[key] = UPGRADES[key].baseValue || 1;
        }

        this.createNextGoal();

        // Allow quickly switching goals in dev mode
        if (G_IS_DEV) {
            window.addEventListener("keydown", ev => {
                if (ev.key === "b") {
                    // root is not guaranteed to exist within ~0.5s after loading in
                    if (this.root && this.root.app && this.root.app.gameAnalytics) {
                        this.onGoalCompleted();
                    }
                }
            });
        }
    }

    /**
     * Returns how much of the current shape is stored
     * @param {ShapeDefinition} definition
     * @returns {number}
     */
    getShapesStored(definition) {
        return this.storedShapes[definition.getHash()] || 0;
    }

    /**
     * @param {string} key
     * @param {number} amount
     */
    takeShapeByKey(key, amount) {
        assert(this.getShapesStoredByKey(key) >= amount, "Can not afford: " + key + " x " + amount);
        assert(amount >= 0, "Amount < 0 for " + key);
        assert(Number.isInteger(amount), "Invalid amount: " + amount);
        this.storedShapes[key] = (this.storedShapes[key] || 0) - amount;
        return;
    }

    /**
     * @param {string} key
     * @param {number} amount
     */
    putShapeByKey(key, amount) {
        assert(amount >= 0, "Amount < 0 for " + key);
        assert(Number.isInteger(amount), "Invalid amount: " + amount);
        this.storedShapes[key] = (this.storedShapes[key] || 0) + amount;
        return;
    }

    /**
     * Returns how much of the current shape is stored
     * @param {string} key
     * @returns {number}
     */
    getShapesStoredByKey(key) {
        return this.storedShapes[key] || 0;
    }

    /**
     * Returns how much of the current goal was already delivered
     */
    getCurrentGoalDelivered() {
        return this.getShapesStored(this.currentGoal.definition);
    }

    /**
     * Returns the current level of a given upgrade
     * @param {string} upgradeId
     */
    getUpgradeLevel(upgradeId) {
        return this.upgradeLevels[upgradeId] || 0;
    }

    /**
     * Returns whether the given reward is already unlocked
     * @param {enumHubGoalRewards} reward
     */
    isRewardUnlocked(reward) {
        if (G_IS_DEV && globalConfig.debug.allBuildingsUnlocked) {
            return true;
        }
        return !!this.gainedRewards[reward];
    }

    /**
     * Handles the given definition, by either accounting it towards the
     * goal or otherwise granting some points
     * @param {ShapeDefinition} definition
     */
    handleDefinitionDelivered(definition) {
        const hash = definition.getHash();
        this.storedShapes[hash] = (this.storedShapes[hash] || 0) + 1;

        this.root.signals.shapeDelivered.dispatch(hash);

        // Check if we have enough for the next level
        const targetHash = this.currentGoal.definition.getHash();
        if (
            this.storedShapes[targetHash] >= this.currentGoal.required ||
            (G_IS_DEV && globalConfig.debug.rewardsInstant)
        ) {
            this.onGoalCompleted();
        }
    }

    /**
     * Handles the given hash, by either accounting it towards the
     * goal or otherwise granting some points
     * @param {string} hash
     */
    handleDeliveredByHash(hash) {
        this.storedShapes[hash] = (this.storedShapes[hash] || 0) + 1;

        this.root.signals.shapeDelivered.dispatch(hash);

        // Check if we have enough for the next level
        const targetHash = this.currentGoal.definition.getHash();
        if (
            this.storedShapes[targetHash] >= this.currentGoal.required ||
            (G_IS_DEV && globalConfig.debug.rewardsInstant)
        ) {
            this.onGoalCompleted();
        }
    }

    /**
     * Creates the next goal
     */
    createNextGoal() {
        const storyIndex = this.level - 1;
        if (storyIndex < tutorialGoals.length) {
            const { shape, required, reward } = tutorialGoals[storyIndex];
            this.currentGoal = {
                /** @type {ShapeDefinition} */
                definition: this.root.shapeDefinitionMgr.getShapeFromShortKey(shape),
                required,
                reward,
            };
            return;
        }

        for (let fixed of fixedGoals) {
            if (fixed.minLevel > this.level || fixed.maxLevel < this.level) {
                continue;
            }
            let definition = null;
            if (typeof fixed.shape === "string") {
                definition = this.root.shapeDefinitionMgr.getShapeFromShortKey(fixed.shape);
            } else {
                definition = this.createRandomShapeOfTiers(fixed.shape);
            }
            this.currentGoal = {
                definition,
                required: fixed.baseCount + (this.level - fixed.minLevel) * fixed.countPerLevel,
                reward: fixed.reward,
            };
            return;
        }

        this.currentGoal = {
            /** @type {ShapeDefinition} */
            definition: this.createRandomShape(),
            required: 5000 + findNiceIntegerValue((this.level - tutorialGoals.length) * 200),
            reward: enumHubGoalRewards.no_reward_freeplay,
        };
    }

    /**
     * Called when the level was completed
     */
    onGoalCompleted() {
        const reward = this.currentGoal.reward;
        this.gainedRewards[reward] = (this.gainedRewards[reward] || 0) + 1;

        this.root.app.gameAnalytics.handleLevelCompleted(this.level);
        ++this.level;
        this.createNextGoal();

        this.root.signals.storyGoalCompleted.dispatch(this.level - 1, reward);
    }

    /**
     * Returns whether we are playing in free-play
     */
    isFreePlay() {
        return this.level >= tutorialGoals.length;
    }

    /**
     * Returns whether a given upgrade can be unlocked
     * @param {string} upgradeId
     */
    canUnlockUpgrade(upgradeId) {
        const handle = UPGRADES[upgradeId];
        const currentLevel = this.getUpgradeLevel(upgradeId);

        if (currentLevel >= handle.tiers.length) {
            // Max level
            return false;
        }

        if (G_IS_DEV && globalConfig.debug.upgradesNoCost) {
            return true;
        }

        const tierData = handle.tiers[currentLevel];

        for (let i = 0; i < tierData.required.length; ++i) {
            const requirement = tierData.required[i];
            if ((this.storedShapes[requirement.shape] || 0) < requirement.amount) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns the number of available upgrades
     * @returns {number}
     */
    getAvailableUpgradeCount() {
        let count = 0;
        for (const upgradeId in UPGRADES) {
            if (this.canUnlockUpgrade(upgradeId)) {
                ++count;
            }
        }
        return count;
    }

    /**
     * Tries to unlock the given upgrade
     * @param {string} upgradeId
     * @returns {boolean}
     */
    tryUnlockUpgrade(upgradeId) {
        if (!this.canUnlockUpgrade(upgradeId)) {
            return false;
        }

        const handle = UPGRADES[upgradeId];
        const currentLevel = this.getUpgradeLevel(upgradeId);

        const tierData = handle.tiers[currentLevel];
        if (!tierData) {
            return false;
        }

        if (G_IS_DEV && globalConfig.debug.upgradesNoCost) {
            // Dont take resources
        } else {
            for (let i = 0; i < tierData.required.length; ++i) {
                const requirement = tierData.required[i];

                // Notice: Don't have to check for hash here
                this.storedShapes[requirement.shape] -= requirement.amount;
            }
        }

        this.upgradeLevels[upgradeId] = (this.upgradeLevels[upgradeId] || 0) + 1;
        this.upgradeImprovements[upgradeId] += tierData.improvement;

        this.root.signals.upgradePurchased.dispatch(upgradeId);

        this.root.app.gameAnalytics.handleUpgradeUnlocked(upgradeId, currentLevel);

        return true;
    }

    /**
     * @returns {ShapeDefinition}
     */
    createRandomShape() {
        return this.createRandomShapeOfTiers({
            holeTier: 4,
            shapeTier: 4,
            colorTier: 4,
            layerTier: 4,
        });
    }

    /**
     * @param {object} arg
     * @param {number} arg.holeTier
     * @param {number} arg.shapeTier
     * @param {number} arg.colorTier
     * @param {number} arg.layerTier
     * @returns {ShapeDefinition}
     */
    createRandomShapeOfTiers({ holeTier, shapeTier, colorTier, layerTier }) {
        const layerCount = layerTier;

        /** @type {Array<import("./shape_definition").ShapeLayer>} */
        let layers = [];

        const rng = new RandomNumberGenerator(this.level + "|" + this.root.map.seed);

        // @ts-ignore
        const availableColors = Object.values(allColorData)
            .filter(e => e.id != enumColors.uncolored)
            .filter(e => e.tier <= colorTier)
            .map(e => e.id);
        // @ts-ignore
        const availableShapes = Object.values(allShapeData)
            .filter(e => e.tier <= shapeTier)
            .map(e => e.id);

        const randomColor = () => rng.choice(availableColors);
        const randomShape = () => rng.choice(availableShapes);

        let layerWith2Holes = -1;
        if (holeTier >= 2) {
            availableColors.push(enumColors.uncolored);
        }
        if (holeTier >= 4) {
            layerWith2Holes = rng.nextIntRange(0, layerCount);
        }

        for (let i = 0; i < layerCount; ++i) {
            /** @type {import("./shape_definition").ShapeLayer} */
            const layer = [null, null, null, null];

            for (let quad = 0; quad < 4; ++quad) {
                layer[quad] = {
                    subShape: randomShape(),
                    color: randomColor(),
                };
            }

            if (holeTier >= 3) {
                let holeIndex = rng.nextIntRange(0, 8);
                if (holeIndex < 4) {
                    layer[holeIndex] = null;
                }
                if (i == layerWith2Holes) {
                    layer[holeIndex % 4] = null;
                    let hole2Index = rng.nextIntRange(0, 4);
                    layer[hole2Index] = null;
                }
            }

            layers.push(layer);
        }

        const definition = new ShapeDefinition({ layers });
        return this.root.shapeDefinitionMgr.registerOrReturnHandle(definition);
    }

    ////////////// HELPERS

    /**
     * Belt speed
     * @returns {number} items / sec
     */
    getBeltBaseSpeed() {
        return globalConfig.beltSpeedItemsPerSecond * this.upgradeImprovements.belt;
    }

    /**
     * Underground belt speed
     * @returns {number} items / sec
     */
    getUndergroundBeltBaseSpeed() {
        return globalConfig.beltSpeedItemsPerSecond * this.upgradeImprovements.belt;
    }

    /**
     * Miner speed
     * @returns {number} items / sec
     */
    getMinerBaseSpeed() {
        return globalConfig.minerSpeedItemsPerSecond * this.upgradeImprovements.miner;
    }

    /**
     * Processor speed
     * @param {enumItemProcessorTypes} processorType
     * @returns {number} items / sec
     */
    getProcessorBaseSpeed(processorType) {
        switch (processorType) {
            case enumItemProcessorTypes.splitterWires:
                return globalConfig.wiresSpeedItemsPerSecond * 2;

            case enumItemProcessorTypes.trash:
            case enumItemProcessorTypes.hub:
                return 1e30;
            case enumItemProcessorTypes.splitter:
                return globalConfig.beltSpeedItemsPerSecond * this.upgradeImprovements.belt * 2;

            case enumItemProcessorTypes.mixer:
            case enumItemProcessorTypes.painter:
            case enumItemProcessorTypes.painterDouble:
            case enumItemProcessorTypes.painterQuad: {
                assert(
                    globalConfig.buildingSpeeds[processorType],
                    "Processor type has no speed set in globalConfig.buildingSpeeds: " + processorType
                );
                return (
                    globalConfig.beltSpeedItemsPerSecond *
                    this.upgradeImprovements.painting *
                    globalConfig.buildingSpeeds[processorType]
                );
            }

            case enumItemProcessorTypes.cutter:
            case enumItemProcessorTypes.cutterQuad:
            case enumItemProcessorTypes.rotater:
            case enumItemProcessorTypes.rotaterCCW:
            case enumItemProcessorTypes.rotaterFL:
            case enumItemProcessorTypes.stacker: {
                assert(
                    globalConfig.buildingSpeeds[processorType],
                    "Processor type has no speed set in globalConfig.buildingSpeeds: " + processorType
                );
                return (
                    globalConfig.beltSpeedItemsPerSecond *
                    this.upgradeImprovements.processors *
                    globalConfig.buildingSpeeds[processorType]
                );
            }
            case enumItemProcessorTypes.advancedProcessor: {
                return (
                    globalConfig.beltSpeedItemsPerSecond *
                    this.upgradeImprovements.painting *
                    globalConfig.buildingSpeeds[processorType]
                );
            }
            default: {
                if (customBuildingData[processorType]) {
                    let custom = customBuildingData[processorType];
                    globalConfig.buildingSpeeds[processorType] = custom.speed;
                    return (
                        globalConfig.beltSpeedItemsPerSecond *
                        this.upgradeImprovements[custom.speedClass] *
                        globalConfig.buildingSpeeds[processorType]
                    );
                }

                assertAlways(false, "invalid processor type: " + processorType);
            }
        }

        return 1 / globalConfig.beltSpeedItemsPerSecond;
    }
}
