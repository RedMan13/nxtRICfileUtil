const littleEndian = require('./littleEndian');

class Value {
    static get length () {
        return 2;
    }
    constructor (buf) {
        if (Buffer.isBuffer(buf)) buf = littleEndian.decode(buf);
        this._value = buf & 0xFF;
        this._type = (buf >> 12) & 0x0F;
        this._variable = (buf >> 8) & 0x0F;
    }
    // orignal data is still stored inside
    // so we just reconstruct the data
    toBits () {
        return (this._value << 8) + (this._type << 4) + this._variable;
    }
    toArray () {
        return [this._value, (this._type << 4) + this._variable];
    }
    toBuffer () {
        return Buffer.from(this.toArray());
    }
    get type () {
        if (this._type > 0) {
            return this._value > 0 
                ? 'variable' 
                : 'paramater';
        }
        return 'number';
    }
    get variable () {
        return this._value;
    }
    get parameter () {
        return this._variable;
    }
    get value () {
        return this._value;
    }
}

module.exports = Value;
