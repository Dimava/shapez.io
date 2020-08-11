const painter = {
    id: "painter42",
    goal: {
        shape: "CwCcCmCy:RwRcRmRy:SwScSmSy:WwWcWmWy",
        required: 20e3,
        reward: "quaduo",
        title: "Ultimate painting",
        desc: "You have unlocked the <strong>Quaduo painter</strong> - It can paints a whole belt.",
    },
};
const inverter = {
    id: "inverter",
    goal: {
        shape: "CwCrCgCb:CuCcCmCy:CwCrCgCb:CuCcCmCy",
        required: 30e3,
        reward: "inverter",
        title: "Inversion",
        desc:
            "The new <strong>Inverter</strong> allows you to obtain a new <strong>black</strong> color as well as the good old <strong>grey</strong>.",
    },
};
const counter = {
    id: "counter",
    goal: {
        shape: "RwCwSbCw:RcCwSrCw:RwCwSyCw", // onion rocket
        required: 12.5e3,
        reward: "counter",
        title: "The Speed Unravelled",
        desc:
            "The <strong>Counter</strong> will allow you to see the speed not onli as a blinking of insanely fast shapes.",
    },
};
const combiner = {
    id: "combiner",
    goal: {
        shape: "CuRuSuWu:RrSrWrCr:SgWgCgRg:WbCbRbSb",
        required: 35e3,
        reward: "combiner",
    },
};
const unstacker = {
    id: "unstacker",
    goal: {
        shape: "RyRyRcRc:SyScSySc:ScSyScSy:CyCyCcCc", // cyan-yellow stack
        required: 25e3,
        reward: "unstacker",
        title: "unstacker",
        desc: "<strong>unstacker</strong> is unlocked, no comments.",
    },
};
const repeater = {
    id: "repeater",
    goal: {
        shape: "CuRuSuWu:CuRuSuWu:CuRuSuWu:CuRuSuWu", // <-----------------------------------------
        required: 7.5e3,
        reward: "repeater",
    },
};

const levels = [inverter, counter, combiner, unstacker, painter, repeater];

let baseCount = 1000;
let countPerLevel = 200;

let freeplayIndex = 1;
function makeFreeplay(minLevel, maxLevel, holeTier, colorTier, shapeTier, layerTier, etc) {
    let freeplayGoal = {
        id: `freeplay_${freeplayIndex}`,
        goal: {
            fixed: true,
            minLevel,
            maxLevel,
            baseCount: baseCount + minLevel * countPerLevel,
            countPerLevel,
            shape: {
                holeTier,
                shapeTier,
                colorTier,
                layerTier,
            },
            reward: `no_reward_freeplay_${freeplayIndex}`,
            ...etc,
        },
    };
    levels.push(freeplayGoal);

    ++freeplayIndex;
}

levels.push({
    id: "freeplay",
    goal: {
        reward: "freeplay",
        title: "The Freeplay",
        desc:
            "So, this was the first <strong>Freeplay</strong> level. Nothing really special, just a random shape." +
            " This one was easy, but next ones are going to be harder, slowly becoming harder and harder once a while to keep you stuffed." +
            " Make sure to use <strong>Checker</strong> and make a fully automated Ultimate Factory that can produce Anywhing! <strong>Onwards, to FREEPLAY!!!</strong>",
        shape: "CrRgSbWw",
        required: 5000,
        sort_index: 100e3,
    },
});

function makeNoDescFreeplay(minLevel, maxLevel, holeTier, colorTier, shapeTier, layerTier) {
    let args = [holeTier, colorTier, shapeTier, layerTier];
    return makeFreeplay(minLevel, maxLevel, holeTier, colorTier, shapeTier, layerTier, {
        title: `Freeplay [${args}]`,
        desc: `I, Dimava, have not wrote all the descriptions yet. Hardness id [${args}]. Harder levels are to come...`,
    });
}

let n = 25,
    h,
    c,
    s,
    l;
makeNoDescFreeplay(25, (n = 34), (h = 1), (c = 1), (s = 1), (l = 1)); // base
makeNoDescFreeplay((n += 1), (n += 4), h, (c = 2), s, l); // +cmy
makeNoDescFreeplay((n += 1), (n += 4), h, (c = 3), s, l); // +w
makeNoDescFreeplay((n += 1), (n += 4), (h = 2), c, (s = 2), l); // +uk +shape +COMBINER
makeNoDescFreeplay((n += 1), (n += 4), h, (c = 4), s, (l = 2)); // +black +layer +INVERTOR
makeNoDescFreeplay((n += 1), (n += 4), (h = 3), c, s, l); // +hole
makeNoDescFreeplay((n += 1), (n += 4), h, c, s, (l = 3)); // +
makeNoDescFreeplay((n += 1), (n += 4), h, c, (s = 3), l); // +shape3
makeNoDescFreeplay((n += 1), (n += 4), (h = 4), c, s, l); // +hole*2
makeNoDescFreeplay((n += 1), (n += 4), h, c, s, (l = 4)); // +layer
makeFreeplay((n += 1), Math.max(100, (n += 4)), h, c, (s = 4), l, {
    // +shape4
    title: "Freeplay [4, 4, 4, 4]",
    desc:
        "I, Dimava, have not wrote all the descriptions yet. Hardness id [4, 4, 4, 4]. This is the TOP hardness so far.",
});

export default levels;
