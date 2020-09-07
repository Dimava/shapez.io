import { supportedBuildings as toolbar } from "../hud/parts/buildings_toolbar";
import { supportedBuildings as tooolbar } from "../hud/parts/tools_toolbar";

import { enumItemProcessorTypes } from "../components/item_processor";
import { T } from "../../translations";
import { addSprite } from "./modSpriteDrawer";
import { enumHubGoalRewards, tutorialGoals, fixedGoals } from "../tutorial_goals";
import { tutorialsByLevel } from "../hud/parts/interactive_tutorial";

import { KEYMAPPINGS, keyCodeOf } from "../key_action_mapper";

import * as gameData from "./gameData";

export let allCustomBuildingData = [];
export const customBuildingData = {};

const localMods = require.context("./mods", false, /.*\.js/i);
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
        if (!custom.goal.fixed) {
            if (tutorialGoals.find(e => e.reward == custom.goal.reward)) {
                let index = tutorialGoals.findIndex(e => e.reward == custom.goal.reward);
                tutorialGoals.splice(index, 1);
            }
            tutorialGoals.push(custom.goal);
            tutorialGoals.sort((a, b) => (a.sort_index || a.required) - (b.sort_index || b.required));
        } else {
            if (!custom.goal.reward) {
                custom.goal.reward = "no_reward_freeplay";
            }
            custom.goal.shape = custom.goal.shape || {};
            if (typeof custom.goal.shape != "string") {
                custom.goal.shape.holeTier = custom.goal.shape.holeTier || 1;
                custom.goal.shape.shapeTier = custom.goal.shape.shapeTier || 1;
                custom.goal.shape.colorTier = custom.goal.shape.colorTier || 1;
                custom.goal.shape.layerTier = custom.goal.shape.layerTier || 1;
            }
            custom.goal.minLevel = custom.goal.minLevel || 1;
            custom.goal.maxLevel = custom.goal.maxLevel || 1;
            fixedGoals.push(custom.goal);
        }

        if (custom.goal.reward) {
            if (!custom.goal.reward.includes("reward_")) {
                custom.goal.reward = "reward_" + custom.goal.reward;
            }
            enumHubGoalRewards[custom.goal.reward] = custom.goal.reward;
            if (!T.storyRewards[custom.goal.reward]) {
                T.storyRewards[custom.goal.reward] = {
                    title: custom.goal.title || custom.Tname || custom.id,
                    desc: "no description",
                };
            }
            if (custom.goal.desc) {
                T.storyRewards[custom.goal.reward].desc = custom.goal.desc;
            }
        }
        if (custom.goal.tutorial) {
            for (let step of custom.goal.tutorial) {
                T.ingame.interactiveTutorial.hints[step.id] = step.Tdesc;
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

        if (custom.meta && custom.toolbarIndex) {
            custom.meta.toolbarIndex = custom.toolbarIndex;
        }
        if (custom.meta && custom.toolbar == 0) {
            toolbar.push(custom.meta);
            sortToolbar(toolbar);
        }
        if (custom.meta && custom.toolbar == 2) {
            tooolbar.push(custom.meta);
            sortToolbar(tooolbar);
        }

        if (custom.keyCode) {
            KEYMAPPINGS.buildings[custom.id] = { keyCode: keyCodeOf(custom.keyCode), id: custom.id };
            T.keybindings.mappings[custom.id] = custom.Tname;
        }
    }

    if (custom.sprite) {
        if (!(custom.sprite[0] || custom.sprite).sprite) {
            (custom.sprite[0] || custom.sprite).sprite = `sprites/buildings/${custom.id}${
                custom.variant == "default" ? "" : "-" + custom.variant
                }.png`;
        }
        addSprite(custom.sprite);
        if (custom.spriteBp) {
            if (!(custom.spriteBp[0] || custom.spriteBp).sprite) {
                (custom.spriteBp[0] || custom.spriteBp).sprite = `sprites/blueprints/${custom.id}${
                    custom.variant == "default" ? "" : "-" + custom.variant
                    }.png`;
            }
            (custom.spriteBp[0] || custom.spriteBp).blueprint = true;
            addSprite(custom.spriteBp);
        }
    }
}

function sortToolbar(toolbar) {
    let copy = tooolbar.slice().sort((a, b) => (a.toolbarIndex || 0) - (b.toolbarIndex || 0));
    while (toolbar.length) toolbar.pop();
    for (let meta of copy) {
        if (!meta.toolbarIndex) {
            toolbar.push(meta);
        } else {
            toolbar.splice(meta.toolbarIndex, 0, meta);
        }
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
