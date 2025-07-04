const { typeNames } = require('./constants.js');
const Sprite = require('./elements/Sprite.js');
const charMap = require('./chars.json');
const width = 100;
const height = 64;
const charWidth = 6;
const charHeight = 8;
const charBits = charWidth * charHeight;
const numChars = 128;
const rad45 = (Math.PI / 2) / 2;
const sin45 = Math.sin(rad45);
const frame = new Array(width).fill([]).map(() => new Array(height).fill(0));
const decayMap = new Array(width).fill([]).map(() => new Array(height).fill(0));
const decayRate = 300; // in ms, ticked down for each frame render step

/** @enum */
const ClearingModes = {
    0: 'none',
    1: 'whole',
    2: 'not-status',
    3: 'area',
    none: 'none',
    whole: 'whole',
    notStatus: 'not-status',
    area: 'area'
}
/** @enum */
const LogicalOperators = {
    0: 'copy',
    8: 'and',
    16: 'or',
    24: 'xor',
    copy: 'copy',
    and: 'and',
    or: 'or',
    xor: 'xor'
}
/** 
 * @typedef {Object} DrawingOptions
 * @prop {ClearingModes} clearing
 * @prop {boolean} invert
 * @prop {LogicalOperators} logic
 * @prop {boolean} fill
 */
/**
 * Parse a draw options int into a verbose form
 * @param {number} uint8 a uint8 shaped number that describes the draw options
 * @returns {DrawingOptions}
 */
function parseDrawOpts(uint8) {
    return {
        clearing: ClearingModes[uint8 & 0b00000011],
        invert:   !!(uint8 & 0b00000100),
        logic:    LogicalOperators[uint8 & 0b00011000],
        fill:     !!(uint8 & 0b00100000),
    }
}
function stringToChars(str) {
    const chars = [];
    for (const char of str) {
        let id = char.charCodeAt() - 0x20;
        if (id < 0) id = 0;
        if (id > numChars) id = 0;
        chars.push(id);
    }
    return chars
}
/**
 * Executes the clearing draw option
 * @param {ClearingModes} mode 
 * @param {number} x For area clearing only, the X position to start clearing from
 * @param {number} y For area clearing only, The Y position to start clearing from
 * @param {number} w For area clearing only, The Width to clear
 * @param {number} h For area clearing only, The Height to clear
 */
function clearScreen(mode, x,y, w,h) {
    switch (mode) {
    case ClearingModes.notStatus:
    case ClearingModes.whole:
        frame.forEach((arr, x) => arr.forEach((_, y) => {
            if (y > height - 10 && mode === ClearingModes.notStatus) return;
            frame[x][y] = 0;
        })); break;
    case ClearingModes.area:
        const copyLen = w * h;
        for (let i = 0, cx = x, cy = y; i < copyLen; cx = (++i % w) + x, cy = Math.floor(i / w) + y)
            frame[cx][cy] = 0;
    }
}

const drawCommands = {
    /**
     * Draw a subset of pixels from a sprite, only available to RIC files
     * @param {DrawingOptions} blitMode
     * @param {Sprite} sprite The RIC sprite to copy from
     * @param {number} sx The X position to start copying from
     * @param {number} sy The Y position to start copying from
     * @param {number} sw The Width to copy
     * @param {number} sh The Height to copy
     * @param {number} x The X position to paste to
     * @param {number} y The Y position to paste to
     */
    CopyBits(blitMode, sprite, sx,sy, sw,sh, x,y) {
        const copyLen = sw * sh;
        if (blitMode.fill || blitMode.clearing === ClearingModes.area)
            clearScreen(ClearingModes.area, x,y, sw,sh);
        for (let i = 0, cx = 0, cy = 0; i < copyLen; cx = ++i % sw, cy = Math.floor(i / sw))
            this.Pixel(blitMode, cx + x, cy + y, sprite.pixel(cx + sx,cy + sy));
    },
    /**
     * Draws in a single pixel
     * @param {DrawingOptions} blitMode 
     * @param {number} x
     * @param {number} y 
     */
    Pixel(blitMode, x,y, px = 1) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const pix = blitMode.invert ? !px : px;
        switch (blitMode.logic) {
        default:
        case LogicalOperators.copy:
            frame[x][y] = pix; break;
        case LogicalOperators.and:
            frame[x][y] &= pix; break;
        case LogicalOperators.or:
            frame[x][y] |= pix; break;
        case LogicalOperators.xor:
            frame[x][y] ^= pix; break;
        }
    },
    /**
     * Draws a line on the screen
     * @param {DrawingOptions} blitMode 
     * @param {number} sx The X position to start the line at
     * @param {number} sy The Y position to start the line at
     * @param {number} ex The X position to end the line at
     * @param {number} ey The Y position to end the line at
     */
    Line(blitMode, sx,sy, ex,ey) {
        if (ex < sx || ey < sy) {
            const tmpX = ex;
            const tmpY = ey;
            ex = sx;
            ey = sy;
            sx = tmpX;
            sy = tmpY;
        }
        this.Pixel(blitMode,sx,sy);
        this.Pixel(blitMode,ex,ey);
        const len = (ex - sx);
        for (let x = 0; x < len; x++) {
            const y = Math.floor((ey - sy) * (x / len));
            this.Pixel(blitMode,x + sx,y + sy);
        }
    },
    Rectangle(blitMode, x,y, w,h) {
        const copyLen = w * h;
        if (blitMode.clearing === ClearingModes.area)
            clearScreen(ClearingModes.area, x,y, w,h);
        for (let i = 0, cx = x, cy = y; i < copyLen; cx = (++i % w) + x, cy = Math.floor(i / w) + y) {
            if (!blitMode.fill) {
                const left = cx === x;
                const right = cx === (x + w -1);
                const top = cy === (y + h -1);
                const bottom = cy === y;
                if (!left && !right && !top && !bottom) {
                    i += w -3;
                    continue;
                }
            }
            this.Pixel(blitMode,cx,cy);
        }
    },
    Circle(blitMode, x,y, radius) {
        /*! Incorrect implementation! needs converted to the actual nxt implementation !*/
        let t1 = radius / 16;
        let rx = radius;
        let ry = 0;
        while (rx >= ry) {
            this.Pixel(blitMode,x + rx,y - ry);
            this.Pixel(blitMode,x - rx,y - ry);
            this.Pixel(blitMode,x + rx,y + ry);
            this.Pixel(blitMode,x - rx,y + ry);

            this.Pixel(blitMode,x - ry,y + rx);
            this.Pixel(blitMode,x + ry,y + rx);
            this.Pixel(blitMode,x - ry,y - rx);
            this.Pixel(blitMode,x + ry,y - rx);
            ry++;
            t1 += ry;
            t2 = t1 - rx;
            console.log(t1, t2, rx, ry);
            if (t2 >= 0) {
                t1 = t2;
                rx--;
            }
        }
    },
    NumBox(blitMode, x,y, num) { this.TextBox(blitMode, x,y, String(num)); },
    TextBox(blitMode, x,y, text) {
        y = Math.floor(y / 8) * 8;
        const chars = typeof text === 'string' ? stringToChars(text) : text;
        for (let c = 0; c < chars.length; c++) {
            const ox = (c * charWidth) + x;
            const high = (chars[c] & 0xF0) >> 4;
            const low = chars[c] & 0x0F;
            for (let i = 0, cx = 0, cy = 0; i < charBits; cx = ++i % charWidth, cy = Math.floor(i / charWidth))
                this.Pixel(blitMode, cx + ox, cy + y, charMap[high][cy][low][cx]);
        }
    },
    RICDraw(blitMode, ox,oy, context, params) {
        const pool = {};
        Object.assign(context.params, params);
        for (const cmd of context.items) {
            const mode = cmd.id ? cmd.id : parseDrawOpts(cmd.opts.valueOf() & 0b11111100);
            switch (cmd.type.valueOf()) {
            case typeNames.Information:
                if (blitMode.clearing === ClearingModes.area)
                    clearScreen(ClearingModes.area, x,y, cmd.width,cmd.height);
                break;
            case typeNames.Sprite: pool[mode] = cmd; break;
            case typeNames.VarMap: pool[mode] = cmd; break;
            case typeNames.CopyBits: {
                const sprite = pool[cmd.spriteID.valueOf()];
                if (!(sprite instanceof Sprite)) break;
                const sx = cmd.srcX.valueOf();
                const sy = cmd.srcY.valueOf();
                const sw = cmd.srcWidth.valueOf();
                const sh = cmd.srcHeight.valueOf();
                const x = cmd.relX.valueOf() + ox;
                const y = cmd.relY.valueOf() + oy;
                this.CopyBits(mode, sprite, sx,sy, sw,sh, x,y);
                break;
            }
            case typeNames.Pixel: {
                const x = cmd.x.valueOf() + ox;
                const y = cmd.y.valueOf() + oy;
                this.Pixel(mode, x,y);
                break;
            }
            case typeNames.Line: {
                const sx = cmd.startX.valueOf() + ox;
                const sy = cmd.startY.valueOf() + oy;
                const ex = cmd.endX.valueOf() + ox;
                const ey = cmd.endY.valueOf() + oy;
                this.Line(mode, sx,sy, ex,ey);
                break;
            }
            case typeNames.Rectangle: {
                const x = cmd.x.valueOf() + ox;
                const y = cmd.y.valueOf() + oy;
                const w = cmd.width.valueOf();
                const h = cmd.height.valueOf();
                this.Rectangle(mode, x,y, w,h);
                break;
            }
            /*
            // isnt actually supported by NXT VM
            case typeNames.Circle: {
                const x = cmd.x.valueOf() + ox;
                const y = cmd.y.valueOf() + oy;
                const rad = cmd.radius.valueOf();
                this.Circle(mode, x,y, rad);
                break;
            }
            */
            case typeNames.NumBox: {
                const x = cmd.x.valueOf() + ox;
                const y = cmd.y.valueOf() + oy;
                const num = cmd.value.valueOf();
                this.NumBox(mode, x,y, num);
                break;
            }
            }
        }
    }
}
function makeDraw(name, mode, ...args) {
    const blitMode = parseDrawOpts(mode);
    drawCommands[name](blitMode, ...args);
}
let lastTime = Date.now();
/**
 * Render out the current frame as an ANSII string
 * @param {[number,number,number]} fore The color for the foreground of the render
 * @param {[number,number,number]} back The color for the background of the render
 * @param {boolean} decay If this render should simulate the decay rate of the NXT LCD
 * @returns {string} An ANSII formated string of the NXT display output
 */
function renderFrame(fore = [0,0,0], back = [18,41,19], decay = false) {
    let str = `\x1b[38;2;${fore[0].toFixed(0)};${fore[1].toFixed(0)};${fore[2].toFixed(0)}m`;
    str += `\x1b[48;2;${back[0].toFixed(0)};${back[1].toFixed(0)};${back[2].toFixed(0)}m`;
    // use delta time, rather than a linear decay
    const dt = Date.now() - lastTime;
    lastTime = Date.now();
    for (let sy = height -1; sy >= 0; sy--) {
        for (let sx = 0; sx < width; sx++) {
            if (decay) {
                str += frame[sx][sy] ? '██' : '  ';
                continue;
            }
            decayMap[sx][sy] = Math.max(decayMap[sx][sy] - dt, 0);
            if (frame[sx][sy]) decayMap[sx][sy] = decayRate;
            const lin = decayMap[sx][sy] / decayRate;
            const red = (back[0] - fore[0]) + (fore[0] * lin);
            const green = (back[1] - fore[1]) + (fore[1] * lin);
            const blue = (back[2] - fore[2]) + (fore[2] * lin);
            const color = `\x1b[38;2;${red.toFixed(0)};${green.toFixed(0)};${blue.toFixed(0)}m`;
            str += color;
            str += decayMap[sx][sy] > 0 ? '██' : '  ';
        }
        str += '\n';
    }
    return str + '\x1b[0m';
}

module.exports.draw = makeDraw;
module.exports.capture = renderFrame;
module.exports.frame = frame;