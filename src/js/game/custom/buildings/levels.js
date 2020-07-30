



const painter = {
    id: "painter4",
    goal: {
        shape: "CuCuCuCu",
        required: 5000,
        reward: "painter_quad",
    }
};
const inverter = {
    id: "inverter",
    goal: {
        shape: "CuCuCuCu",
        required: 5000,
        reward: "inverter",
    }
};
const counter = {
    id: "counter",
    goal: {
        shape: "CuCuCuCu",
        required: 5000,
        reward: "counter",
    }
};
const checker = {
    id: "checker",
    goal: {
        shape: "CuCuCuCu",
        required: 5000,
        reward: "checker",
    }
};
const combiner = {
    id: "combiner",
    goal: {
        shape: "CuCuCuCu",
        required: 5000,
        reward: "combiner",
    }
};

const unstacker = {
    id: "unstacker",
    goal: {
        shape: "CuCuCuCu",
        required: 5000,
        reward: "unstacker",
    }
};


const levels = [
    inverter,
    counter,
    checker,
    combiner,
    unstacker,
]



export default levels;