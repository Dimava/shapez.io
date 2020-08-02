import { supportedBuildings as toolbar } from "../hud/parts/buildings_toolbar";
import { supportedBuildings as tooolbar } from "../hud/parts/tools_toolbar";

import { enumItemProcessorTypes } from "../components/item_processor";
import { T } from "../../translations";
import { addSprite } from "./modSpriteDrawer";
import { enumHubGoalRewards, tutorialGoals } from "../tutorial_goals";

import * as gameData from "./gameData";

export let allCustomBuildingData = [];
export const customBuildingData = {};

const localMods = require.context("./buildings", false, /.*\.js/i);
for (let key of localMods.keys()) {
    let mod = localMods(key).default;
    if (!Array.isArray(mod)) {
        mod = [mod];
    }
    for (let entry of mod) {
        allCustomBuildingData.push(entry);
    }
}

for (let custom of allCustomBuildingData) {
    if (!customBuildingData[custom.id]) {
        customBuildingData[custom.id] = custom;
    } else {
        customBuildingData[custom.id] = Object.assign({}, customBuildingData[custom.id], custom);
    }
}
allCustomBuildingData = Object.values(customBuildingData);
allCustomBuildingData.sort((a, b) => (a.variantId || 1e4) - (b.variantId || 1e4));

for (let custom of allCustomBuildingData) {
    addCustom(custom);
}

globalThis.addCustom = addCustom;
globalThis.gameData = gameData;
globalThis.addMod = addMod;

function addMod(mod) {
    addCustom(mod(gameData));
}

function addCustom(custom) {
    Object.assign(customBuildingData[custom.id], custom);

    if (custom.goal) {
        if (tutorialGoals.find(e => e.reward == custom.goal.reward)) {
            let index = tutorialGoals.findIndex(e => e.reward == custom.goal.reward);
            tutorialGoals.splice(index, 1);
        }
        tutorialGoals.push(custom.goal);
        tutorialGoals.sort((a, b) => a.required - b.required);
        if (custom.goal.reward) {
            if (!custom.goal.reward.startsWith("reward_")) {
                custom.goal.reward = "reward_" + custom.goal.reward;
            }
            enumHubGoalRewards[custom.goal.reward] = custom.goal.reward;
            if (!T.storyRewards[custom.goal.reward]) {
                T.storyRewards[custom.goal.reward] = {
                    title: custom.goal.Tname || custom.Tname || custom.id,
                };
            }
        }
    }

    if (custom.building) {
        if (!custom.variant) {
            custom.variant = "default";
        }

        if (custom.process) {
            enumItemProcessorTypes[custom.id] = custom.id;
        }

        if (!custom.Tname) {
            custom.Tname = custom.id;
        }
        if (!custom.Tdesc) {
            custom.Tdesc = "";
        }
        if (!T.buildings[custom.id]) {
            T.buildings[custom.id] = {};
        }
        T.buildings[custom.id][custom.variant] = {
            name: custom.Tname,
            description: custom.Tdesc,
        };

        if (!custom.speed) {
            custom.speed = 1;
        }
        if (!custom.speedClass) {
            custom.speedClass = "belt";
        }

        if (custom.meta && custom.toolbar == 0) {
            toolbar.push(custom.meta);
        }
        if (custom.meta && custom.toolbar == 2) {
            tooolbar.push(custom.meta);
        }
    }

    if (custom.sprite) {
        (custom.sprite[0] || custom.sprite).sprite = `sprites/buildings/${custom.id}${
            custom.variant == "default" ? "" : "-" + custom.variant
        }.png`;
        addSprite(custom.sprite);
        (custom.spriteBp[0] || custom.spriteBp).sprite = `sprites/blueprints/${custom.id}${
            custom.variant == "default" ? "" : "-" + custom.variant
        }.png`;
        custom.spriteBp.transparent = true;
        addSprite(custom.spriteBp);
    }
}

export function getCustomBuildingSystemsNulled() {
    let r = {};
    for (let k in allCustomBuildingData) {
        let data = allCustomBuildingData[k];
        if (!data.system) {
            continue;
        }
        r[data.id] = null;
    }
    return r;
}

/**
 * @param {number} order
 */
export function internalInitSystemsAddAt(order, add) {
    let systems = Object.values(allCustomBuildingData).filter(data => {
        if (!data.system) return false;
        if (order <= 0) return data.sysOrder && data.sysOrder < order;
        if (order) return data.sysOrder && order <= data.sysOrder && data.sysOrder < order + 1;
        // NaN/undefined goes here
        return !data.sysOrder;
    });
    systems.sort((a, b) => a.sysOrder - b.sysOrder);
    for (let data of systems) {
        add(data.id, data.system);
    }
}
