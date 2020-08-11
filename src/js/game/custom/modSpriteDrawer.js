import { Loader } from "../../core/loader";

/**
 * draws building base on 192m*192n cells context
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} path
 */
function drawBaseLayer(ctx, path, bp) {
    let p = new Path2D(path);
    ctx.save();
    // shadow:
    ctx.save();
    ctx.fillStyle = "#91949e";
    ctx.globalAlpha = 0.2;
    ctx.translate(6, 8);
    ctx.fill(p);
    ctx.restore();
    // base:
    ctx.fillStyle = !bp ? "#dee1ea" : "#6CD1FF";
    ctx.strokeStyle = !bp ? "#64666e" : "#56A7D8";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = 4;
    ctx.fill(p);
    ctx.stroke(p);
    ctx.restore();
}
/**
 * draws a color-filled path on 192m*192n cells context
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} path
 */
function drawfillShape(ctx, path, color) {
    let p = new Path2D(path);
    ctx.save();
    // shadow:
    ctx.save();
    ctx.fillStyle = "#91949e";
    ctx.globalAlpha = 0.2;
    ctx.translate(6, 8);
    ctx.fill(p);
    ctx.restore();
    // base:
    ctx.fillStyle = color;
    ctx.strokeStyle = "#64666e";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = 4;
    ctx.stroke(p);
    ctx.fill(p);
    ctx.restore();
}
function drawShape(ctx, path, color1, color2) {
    let p = new Path2D(path);
    ctx.save();
    // base:
    ctx.fillStyle = color1;
    ctx.strokeStyle = color2;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = 4;
    ctx.stroke(p);
    ctx.fill(p);
    ctx.restore();
}

export function addSprite(data) {
    let info = data[0] || data;
    if (info.url) {
        drawSpriteFromImage(info.sprite, info.url, info);
        return;
    }
    let layers = data.layers || data.slice(1);
    drawSpriteFromJson(info.sprite, layers, info);
}

function drawSpriteFromJson(sprite, layers, info) {
    function draw({ context, canvas2, context2 }) {
        if (info.transparent) {
            for (let layer of layers) {
                if (layer.fill && layer.stroke) {
                    drawShape(context2, layer.path, layer.fill, layer.stroke);
                } else if (layer.fill) {
                    drawfillShape(context, layer.path, layer.fill);
                } else if (layer.stroke) {
                    throw "not implemented";
                } else {
                    drawBaseLayer(context, layer.path, true);
                }
            }
            context.save();
            context.globalAlpha = 0x99 / 0xff;
            context.drawImage(canvas2, 0, 0);
            context.restore();

            return;
        }

        for (let layer of layers) {
            if (layer.fill && layer.stroke) {
                drawShape(context, layer.path, layer.fill, layer.stroke);
            } else if (layer.fill) {
                drawfillShape(context, layer.path, layer.fill);
            } else if (layer.stroke) {
                throw "not implemented";
            } else {
                drawBaseLayer(context, layer.path);
            }
        }
    }
    Loader.drawSprite(sprite, draw, { w: info.w, h: info.h });
}

function drawSpriteFromImage(sprite, url, { w, h }) {
    function draw({ context }) {
        let img = new Image();
        img.onload = function () {
            context.drawImage(img, 0, 0);
        };
        img.src = url;
    }
    Loader.drawSprite(sprite, draw, { w, h });
}
