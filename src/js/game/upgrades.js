import { findNiceIntegerValue } from "../core/utils";
import { ShapeDefinition } from "./shape_definition";

export const finalGameShape = "RuCw--Cw:----Ru--";
export const blueprintShape = "CbCbCbRb:CwCwCwCw";

export const UPGRADES = {
    belt: {
        tiers: [
            {
                required: [{ shape: "CuCuCuCu", amount: 150 }],
                improvement: 1,
            },
            {
                required: [{ shape: "--CuCu--", amount: 1200 }],
                improvement: 2,
            },
            {
                required: [{ shape: "CmCmCmCm", amount: 5000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "SrSrSrSr:CyCyCyCy", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "SrSrSrSr:CyCyCyCy:SwSwSwSw", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: finalGameShape, amount: 50000 }],
                improvement: 5,
                excludePrevious: true,
            },
        ],
    },

    miner: {
        tiers: [
            {
                required: [{ shape: "RuRuRuRu", amount: 400 }],
                improvement: 1,
            },
            {
                required: [{ shape: "Cu------", amount: 4000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "ScScScSc", amount: 6000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "CwCwCwCw:WbWbWbWb", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "CbRbRbCb:CwCwCwCw:WbWbWbWb", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: finalGameShape, amount: 50000 }],
                improvement: 5,
                excludePrevious: true,
            },
        ],
    },

    processors: {
        tiers: [
            {
                required: [{ shape: "SuSuSuSu", amount: 1000 }],
                improvement: 1,
            },
            {
                required: [{ shape: "RuRu----", amount: 2000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "CgScScCg", amount: 7000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "CwCrCwCr:SgSgSgSg", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "WrRgWrRg:CwCrCwCr:SgSgSgSg", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: finalGameShape, amount: 50000 }],
                improvement: 5,
                excludePrevious: true,
            },
        ],
    },

    painting: {
        tiers: [
            {
                required: [{ shape: "RbRb----", amount: 1500 }],
                improvement: 2,
            },
            {
                required: [{ shape: "WrWrWrWr", amount: 4000 }],
                improvement: 1,
            },
            {
                required: [{ shape: "RmRmRmRm:CwCwCwCw", amount: 8000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "WmWmWmWm:CwCwCwCw:WmWmWmWm", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: "WmWmWmWm:CwCwCwCw:WmWmWmWm:CwCwCwCw", amount: 10000 }],
                improvement: 2,
            },
            {
                required: [{ shape: finalGameShape, amount: 50000 }],
                improvement: 5,
                excludePrevious: true,
            },
        ],
    },
};

// Tiers need % of the previous tier as requirement too
const tierGrowth = 2.5;

// Automatically generate tier levels
for (const upgradeId in UPGRADES) {
    const upgrade = UPGRADES[upgradeId];

    let currentTierRequirements = [];
    for (let i = 0; i < upgrade.tiers.length; ++i) {
        const tierHandle = upgrade.tiers[i];
        const originalRequired = tierHandle.required.slice();

        for (let k = currentTierRequirements.length - 1; k >= 0; --k) {
            const oldTierRequirement = currentTierRequirements[k];
            if (!tierHandle.excludePrevious) {
                tierHandle.required.unshift({
                    shape: oldTierRequirement.shape,
                    amount: oldTierRequirement.amount,
                });
            }
        }
        currentTierRequirements.push(
            ...originalRequired.map(req => ({
                amount: req.amount,
                shape: req.shape,
            }))
        );
        currentTierRequirements.forEach(tier => {
            tier.amount = findNiceIntegerValue(tier.amount * tierGrowth);
        });
    }
}

if (G_IS_DEV) {
    for (const upgradeId in UPGRADES) {
        const upgrade = UPGRADES[upgradeId];
        upgrade.tiers.forEach(tier => {
            tier.required.forEach(({ shape }) => {
                try {
                    ShapeDefinition.fromShortKey(shape);
                } catch (ex) {
                    throw new Error("Invalid upgrade goal: '" + ex + "' for shape" + shape);
                }
            });
        });
    }
}
