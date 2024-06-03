const { typeNames,  indexNames } = require('../constants.js');
const { stringElement } = require('../Stringify.js')
const CrossReference = require('./CrossReference.js');

class Generic {
    encodeEndian(i, num) {
        i *= 2;
        this.buf[i] = num & 0xff;
        this.buf[i +1] = (num >> 8) & 0xff;
    }
    encodeValue(i, val) {
        if (typeof val === 'number') return this.encodeEndian(i, buf, val & 0x0fff);
        return this.encodeEndian(i, buf, 0xf000 + (((val[2]?.id ?? val[2]) & 0xf) << 8) + (val[1] & 0x00ff));
    }
    readEndian(i){
        i *= 2;
        return (this.buf[i +1] << 8) + this.buf[i];
    }
    parseValue(i) {
        const toParse = this.readEndian(i);
        const special = !!((toParse & 0xf000) >> 12);
        if (!special) return toParse & 0x0fff;
        return new CrossReference(toParse, this.info);
    }
    expandBuffer(size, idx) {
        const more = Buffer.alloc(size);
        if (typeof idx === 'number') {
            const left = this.buf.slice(0, idx);
            const right = this.buf.slice(idx);
            this.buf = Buffer.concat([left, more, right]);
            return;
        }
        this.buf = Buffer.concat([this.buf, more]);
    }
    shrinkBuffer(size, idx) {
        if (typeof idx === 'number') {
            const left = this.buf.slice(0, idx - size);
            const right = this.buf.slice(idx)
            this.buf = Buffer.concat([left, right])
            return;
        }
        this.buf = this.buf.slice(0, this.buf.length - size);
    }

    [Symbol.iterator] = function*() {
        for (let i = 2; i < this.length; i++) {
            yield this.parseValue(i)
        }
    }

    constructor(buf, info) {
        this.buf = buf;
        this.info = info;
        this.length = buf.length / 2;
        const type = this.readEndian(0);
        const names = indexNames[type];
        if (!names) throw new Error(`Generic can not handle type ${typeNames[type]}(${type})`);
        for (const [index, key] of Object.entries(names)) {
            Object.defineProperty(this, key, {
                get() {
                    if (index === 0) return type;
                    return this.parseValue(index);
                },
                set(newVal) {
                    if (index === 0) throw new Error('type is immutable');
                    return this.encodeValue(index, newVal);
                }
            });
        }
        if (names.length === 2) return;
        if (buf.length / 2 < names.length) throw new Error(`to few arguments given to Generic\n${stringElement(buf)}`);
    }
    toString() { return stringElement(this.buf); }
}

module.exports = Generic;