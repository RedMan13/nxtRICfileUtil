const { stringValue } = require('../stringify')

// class for values, handles connecting the params list and variable outputs to a type coersion
class CrossReference {
    constructor(bits, info) {
        this.info = info;
        this.variable = (bits & 0x0f00) >> 8;
        // the real value resolver ignores the first four bits, only recognising 16 different arguments 
        // only done here because of explicit compatibility
        this.paramater = bits & 0x000f // bits & 0x00ff;
        if (this.variable) {
            this.variable = info.items.find(item => item.id === this.variable) ?? 0;
        }
    }

    toString() { return stringValue(this); }

    valueOf() {
        const paramValue = this.info.params[this.paramater];
        if (this.variable) return this.variable.mapOut(paramValue);
        return paramValue;
    }
}
class RawInteger {
    constructor(val) { this.val = val; }
    toString() { return String(this.val); }
    valueOf() { return this.val; }
}
CrossReference.RawInteger = RawInteger;

module.exports = CrossReference;
