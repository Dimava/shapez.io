/** @enum {string} */
export const customShapes = [];

/**
 * @callback DrawShape
 * @param {Object} args
 */

/**
 * @typedef {Object} ShapeData
 * @property {string} id
 * @property {string} code
 * @property {boolean} [spawnable]
 * @property {string} [spawnColor]
 * @property {number} [maxQuarters]
 * @property {number} [minDistance]
 * @property {number} [minChance]
 * @property {number} [distChance]
 * @property {number} [maxChance]
 * @property {DrawShape|string} draw
 * @property {number} tier
 */

/**
 * @param {ShapeData} shapeData
 */
export function registerCustomShape(shapeData) {
    customShapes.push(shapeData);
}

let customDefaults = {
    spawnable: false,
    spawnColor: "uncolored",
    maxQuarters: 4,
    minDistance: 6,
    minChance: 4,
    distChance: 1 / 3,
    maxChance: 12,
    tier: 3,
};

registerCustomShape({
    id: "clover",
    code: "L",
    ...customDefaults,
    spawnColor: "green",
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.3, path: true, zero: true });
        const inner = 0.5;
        const inner_center = 0.45;
        context.lineTo(0, inner);
        context.bezierCurveTo(0, 1, inner, 1, inner_center, inner_center);
        context.bezierCurveTo(1, inner, 1, 0, inner, 0);
    },
    tier: 3,
});

registerCustomShape({
    id: "star8",
    code: "T",
    ...customDefaults,
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.22, path: true, zero: true });
        const inner = 0.5;
        context.lineTo(0, inner);
        context.lineTo(Math.sin(Math.PI / 8), Math.cos(Math.PI / 8));
        context.lineTo(inner * Math.sin(Math.PI / 4), inner * Math.cos(Math.PI / 4));
        context.lineTo(Math.sin((Math.PI * 3) / 8), Math.cos((Math.PI * 3) / 8));
        context.lineTo(inner, 0);
    },
    tier: 3,
});

registerCustomShape({
    id: "rhombus",
    code: "B",
    ...customDefaults,
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.2, path: true, zero: true });
        const rad = 0.001;
        // with rounded borders
        context.arcTo(0, 1, 1, 0, rad);
        context.arcTo(1, 0, 0, 0, rad);
    },
    tier: 4,
});

registerCustomShape({
    id: "plus",
    code: "P",
    ...customDefaults,
    draw: "M 0 0 L 1.1 0 1.1 0.5 0.5 0.5 0.5 1.1 0 1.1 z",
    tier: 3,
});

registerCustomShape({
    id: "saw",
    code: "Z",
    ...customDefaults,
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.1, path: true, zero: true });
        const inner = 0.5;
        context.lineTo(inner, 0);
        context.bezierCurveTo(inner, 0.3, 1, 0.3, 1, 0);
        context.bezierCurveTo(
            1,
            inner,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT1_2,
            inner * Math.SQRT1_2
        );
        context.rotate(Math.PI / 4);
        context.bezierCurveTo(inner, 0.3, 1, 0.3, 1, 0);
        context.bezierCurveTo(
            1,
            inner,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT2 * 0.9,
            inner * Math.SQRT1_2,
            inner * Math.SQRT1_2
        );
    },
    tier: 3,
});

registerCustomShape({
    id: "sun",
    code: "U",
    ...customDefaults,
    spawnColor: "yellow",
    draw({ dims, innerDims, layer, quad, context, color, begin }) {
        begin({ size: 1.3, path: true, zero: true });
        const PI = Math.PI;
        const PI3 = ((PI * 3) / 8) * 0.75;
        const c = 1 / Math.cos(Math.PI / 8);
        const b = c * Math.sin(Math.PI / 8);

        context.moveTo(0, 0);
        context.rotate(Math.PI / 2);
        context.arc(c, 0, b, -PI, -PI + PI3);
        context.rotate(-Math.PI / 4);
        context.arc(c, 0, b, -PI - PI3, -PI + PI3);
        context.rotate(-Math.PI / 4);
        context.arc(c, 0, b, PI - PI3, PI);
    },
    tier: 4,
});

registerCustomShape({
    id: "leaf",
    code: "F",
    ...customDefaults,
    draw: "M 0 0 v 0.5 a 0.5 0.5 0 0 0 0.5 0.5 h 0.5 v -0.5 a 0.5 0.5 0 0 0 -0.5 -0.5 z",
});

registerCustomShape({
    id: "diamond",
    code: "D",
    ...customDefaults,
    draw: "M 0 0 l 0 0.5 0.5 0.5 0.5 0 0 -0.5 -0.5 -0.5 z",
});

registerCustomShape({
    id: "mill",
    code: "M",
    ...customDefaults,
    draw: "M 0 0 L 0 1 1 1 Z",
});

// registerCustomShape({
//     id: "halfleaf",
//     code: "H",
//     ...customDefaults,
//     draw: "100 M 0 0 L 0 100 A 45 45 0 0 0 30 30 A 45 45 0 0 0 100 0 Z",
// })

registerCustomShape({
    id: "yinyang",
    code: "Y",
    ...customDefaults,
    // draw({ dims, innerDims, layer, quad, context, color, begin }) {
    //     begin({ size: 1/(0.5+Math.SQRT1_2), path: true });

    //     /** @type{CanvasRenderingContext2D} */
    //     let ctx = context;

    //     with (ctx) { with (Math) {
    //     ////////////////////////
    //     // draw mostly in [0,1]x[0,1] square
    //     // draw: "100 M 0 50 A 50 50 0 1 1 85 85 A 121 121 0 0 1 -85 85 A 50 50 0 0 0 0 50",
    //     moveTo(0, 0.5);
    //     arc(0.5, 0.5, 0.5, PI, PI/4)
    //     arc(0, 0, 0.5+SQRT1_2, PI/4, PI/4+PI/2, 0)
    //     arc(-0.5, 0.5, 0.5, 3*PI/4, 0, 1)

    //     moveTo(0.6, 0.5)
    //     arc(0.5, 0.5, 0.1, 0, 2*PI)
    //     }}

    // },
    draw:
        "120.71 M 0 50 A 50 50 0 1 1 85.355 85.355 A 120.71 120.71 0 0 1 -85.355 85.355 A 50 50 0 0 0 0 50 Z M 40 50 A 10 10 0 1 0 40 49.99 Z",
});

registerCustomShape({
    id: "octagon",
    code: "O",
    ...customDefaults,
    draw: "M 0 0 L 0 1 0.4142 1 1 0.4142 1 0 Z",
});
