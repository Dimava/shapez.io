const painter = {
    id: "painter4",
    goal: {
        shape: "CuCuCuCu",
        required: 5000,
        reward: "painter_quad",
        title: "Ultimate painting",
        desc: "You have unlocked the <strong>Quaduo painter</strong> - It can paints a whole belt.",
    },
};
const inverter = {
    id: "inverter",
    goal: {
        shape: "CuCuCuCu", // <-----------------------------------------
        required: 5000,
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
        required: 5000,
        reward: "counter",
        title: "The Speed Unravelled",
        desc:
            "The <strong>Counter</strong> will allow you to see the speed not onli as a blinking of insanely fast shapes.",
    },
};
const checker = {
    id: "checker",
    goal: {
        shape: "CuCuCuCu", // <-----------------------------------------
        required: 5000,
        reward: "checker",
        title: "The Full Automation",
        desc:
            "Say hello to the <strong>Checker</strong>, the king of Automation." +
            " - Set it a simple filter - a <strong>shape quad</strong> or a <strong>colored quad</strong>" +
            " and it will <strong>select path</strong> depending on <strong>current Hub Goal</strong>, itself, forever!" +
            " In case you need some more advanced options, <strong>layer</strong> quads to filter a higher layer," +
            " color 3 of 4 quads for <strong>uncolored</strong> or leave a single <strong>hole</strong> to get a hole one",
    },
};
const combiner = {
    id: "combiner",
    goal: {
        shape: "CuCuCuCu", // <-----------------------------------------
        required: 5000,
        reward: "combiner",
    },
};
const unstacker = {
    id: "unstacker",
    goal: {
        shape: "RyRyRcRc:SyScSySc:ScSyScSy:CyCyCcCc", // cyan-yellow stack
        required: 5000,
        reward: "unstacker",
        title: "unstacker unlocked",
        desc: "<strong>unstacker</strong> is unlocked, no comments.",
    },
};
const repeater = {
    id: "repeater",
    goal: {
        shape: "CuCuCuCu", // <-----------------------------------------
        required: 5000,
        reward: "repeater",
    },
};

const levels = [inverter, counter, checker, combiner, unstacker];

let baseCount = 1000;
let countPerLevel = 200;

let freeplayIndex = 1;
function makeFreeplay(minLevel, maxLevel, holeTier, shapeTier, colorTier, layerTier, etc) {
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

makeFreeplay(25, 25, 1, 1, 1, 1, {
    title: "The Freeplay",
    desc:
        "So, this was the first <strong>Freeplay</strong> level. Nothing really special, just a random shape." +
        " This one was easy, but next ones are going to be harder, slowly becoming harder and harder once a while to keep you stuffed." +
        " Make sure to use <strong>Checker</strong> and make a fully automated Ultimate Factory that can produce Anywhing! <strong>Onwards, to FREEPLAY!!!</strong>",
});
makeFreeplay(26, 29, 1, 2, 1, 1, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(30, 34, 1, 3, 1, 1, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(35, 39, 2, 3, 2, 1, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(40, 44, 2, 4, 2, 2, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(45, 49, 3, 4, 2, 2, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(50, 54, 3, 4, 2, 3, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(55, 59, 3, 4, 3, 3, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(60, 64, 4, 4, 3, 3, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(65, 74, 4, 4, 3, 4, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. Harder levels are to come...",
});
makeFreeplay(75, 100, 4, 4, 4, 4, {
    title: "descriptions are WIP but progression goes",
    desc: "I, Dimava, have not wrote all the descriptions yet. This is the TOP hardness so far.",
});

export default levels;
