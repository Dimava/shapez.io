import { T } from "../gameData";

T.buildings.virtual_processor.adder = {
    name: "Adder",
    description: "Stacks shapes, paints shapes, mixes colors"
};


export const Sprite = {
    sprite: "sprites/buildings/virtual_processor-adder.png",
    url: "./res/adder.png",
    w: 142,
    h: 142,
};
export const SpriteBp = {
    sprite: "sprites/blueprints/virtual_processor-adder.png",
    url: "./res/adder.png",
    w: 142,
    h: 142,
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
	sprite: [{
		w: 49,
		h: 49,
		sprite: "sprites/wires/display/magenta.png",
	}, {
		path: "M 1 1 L 1 48 48 48 48 1 Z",
		fill: "magenta",
	}],
}

const color_black = {
	id: "black",
	sprite: [{
		w: 49,
		h: 49,
		sprite: "sprites/wires/display/black.png",
	}, {
		path: "M 1 1 L 1 48 48 48 48 1 Z",
		fill: "black",
	}],
}

export default [data, color_magenta, color_black];
