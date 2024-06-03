const { stringValue } = require('../Stringify')

// class for values, handles connecting the params list and variable outputs to a type coersion
class CrossReference {
    constructor(bits, info) {
        this.info = info;
        this.variable = (bits & 0x0f00) >> 8;
        this.paramater = bits & 0x00ff;
        if (this.variable) {
            this.variable = info.find(item => item.id === this.variable) ?? 0;
        }
    }

    toString() { return stringValue(this); }

    valueOf() {
        const paramValue = Math.min(this.info.params[this.paramater], 0x10ff);
        if (this.variable) return this.variable.mapOut(paramValue);
        return paramValue;
    }
}

module.exports = CrossReference