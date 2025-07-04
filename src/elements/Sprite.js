const Generic = require('./Generic');

class Sprite extends Generic {
    [Symbol.iterator] = function*() {
        for (let i = 2; i < this.length; i++) {
            yield this.readEndian(i)
        }
        const img = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            img.push(row);
            for (let x = 0; x < this.width; x++) {
                row.push(this.pixel(x, y));
            }
        }
        yield img
    }

    constructor(buf, info) {
        super(buf, info);
        this.length = 4;
    }
    get width() {
        return this.readEndian(3) * 8;
    }
    get height() {
        return this.readEndian(2);
    }
    set width(val) {
        val = Math.floor(val / 8)
        const diff = val - (this.width / 8);
        for (let y = 0; y < this.height; y++) {
            if (diff > 0) this.expandBuffer(diff, (y * this.width) + this.width + this.length);
            else this.shrinkBuffer(-diff, (y * this.width) + this.width + this.length);
        }
        this.encodeEndian(3, val);
    }
    set height(val) {
        const diff = val - this.height;
        if (diff > 0) this.expandBuffer(diff * this.width);
        else this.shrinkBuffer(-diff * this.width);
        this.encodeEndian(2, val);
    }
    pixel(x, y, set) {
        const xy = (x + ((this.height - y -1) * this.width)) + (this.length * 16);
        const byte = Math.floor(xy / 8);
        const bit = 8 - ((xy % 8) + 1);
        if (typeof set !== 'undefined') {
            const mask = 0xff ^ (1 << bit);
            const masked = (this.buf[byte] & mask)
            this.buf[byte] = masked | (set << bit);
        }
        return !!((this.buf[byte] >> bit) & 1);
    }
}

module.exports = Sprite;
