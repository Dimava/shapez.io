/** @typedef {import('../gameData').ModLevel} ModLevel */

/** @type {ModLevel[]} */
let levels = [];

let lvl = 100;

let colors = "rgbcmywku";

for (let c of colors) {
    let shape = `C${c}C${c}C${c}C${c}:`.repeat(4).slice(0, -1);
    levels.push({
        id: "test_freeplay_" + c,
        goal: {
            fixed: true,
            title: "Test level [" + c + "]",
            desc: "a test level",
            minLevel: ++lvl,
            maxLevel: lvl,
            baseCount: 100,
            countPerLevel: 0,
            shape,
            reward: "no_reward_test_freeplay_" + c,
        },
    });
}

let shapes = "RCSWBDOFUMPLTZY";

for (let c of shapes) {
    let shape = `${c}u${c}u${c}u${c}u:`.repeat(4).slice(0, -1);
    levels.push({
        id: "test_freeplay_" + c,
        goal: {
            fixed: true,
            title: "Test level [" + c + "]",
            desc: "a test level",
            minLevel: ++lvl,
            maxLevel: lvl,
            baseCount: 100,
            countPerLevel: 0,
            shape,
            reward: "no_reward_test_freeplay_" + c,
        },
    });
}

export default levels;
