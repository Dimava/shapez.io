import { T } from "../gameData";

T.buildings.virtual_processor.adder = {
    name: "Adder",
    description: "Stacks shapes, paints shapes, mixes colors"
};


export const Sprite = {
    sprite: "sprites/buildings/virtual_processor-adder.png",
    url: "./res/adder.png",
    w: 192,
    h: 192,
};
export const SpriteBp = {
    sprite: "sprites/blueprints/virtual_processor-adder.png",
    url: "./res/adder.png",
    w: 192,
    h: 192,
};

// TODO: keyCode, toolbarIndex
/** @type {ModData} */
export const data = {
	id: "adder",
    sprite: Sprite,
    spriteBp: SpriteBp,
};

const color_magenta = {
	id: "magenta",
	sprite: {
		w: 65,
		h: 65,
		sprite: "sprites/wires/display/magenta.png",
		url: "./res/display_magenta.png"
	},
}

const color_black = {
	id: "black",
	sprite: {
		w: 65,
		h: 65,
		sprite: "sprites/wires/display/black.png",
		url: "./res/display_black.png"
	},
}

export default [data, color_magenta, color_black];
