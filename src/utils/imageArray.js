class Image {
    constructor (bpr, height, bytes) {
        this._width = bpr * 8;
        this._height = height;
        this._bpr = bpr;
        this._pixels = [];
        if (Array.isArray(bytes)) {
            this._pixels = bytes;
            return;
        }
        for (let byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
            const byte = byteIndex;
            for (let bit = 0; bit < 8; bit++) {
                this._pixels.push((byte >> bit) & 0b1);
            }
        }
    }
    get width () {
        return this._width;
    }
    get height () {
        return this._height;
    }
    set width (value) {
        if (typeof value !== 'number') throw new Error('width must be a number');
        const filler = new Array(Math.abs(this._width - value)).fill(0);
        const bpr = Math.ceil(value / 8);
        this._width = bpr * 8;
        for (let index = 0; index < this._height; index++) {
            const offset = (index * this._bpr) + this._bpr;
            this._pixels.splice(offset, 0, ...filler);
        }
        this._bpr = bpr;
    }
    set height (value) {
        if (typeof value !== 'number') throw new Error('height must be a number');
        const filler = new Array((this._bpr * 8) * Math.abs(this._height - value)).fill(0);
        this._pixels.splice(this._height * this._bpr, 0, ...filler);
        this._height = value;
    }
    copyBits (x, y, width, height) {
        const endX = x + width;
        const endY = y + height;
        const copiedBits = [];
        if (x < 0 || y < 0 || x > this._width || y > this._height) throw new Error('x, y must be within the image');
        if (width < 1 || height < 1) throw new Error('width, height must be greater then 0');
        if (endX > this._width || endY > this._height) throw new Error('copy range must be inside the image');

        for (let rowIndex = x; rowIndex < endY; rowIndex++) {
            const rowOffset = rowIndex * (this._bpr * 8);
            const row = this._pixels.slice(rowOffset, rowOffset + (this._bpr * 8));
            copiedBits.concat(row.slice(x, endX));
        }

        const bpr = Math.ceil(width / 8);
        return new Image(bpr, width, copiedBits);
    }
}

module.exports = Image;
