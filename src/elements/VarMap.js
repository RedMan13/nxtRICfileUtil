const Generic = require('./Generic.js')

class VarMap extends Generic {
    [Symbol.iterator] = function*() {
        for (let i = 2; i < this.length; i++) {
            yield this.readEndian(i)
        }
        const list = [];
        for (let i = 0; i < this.numSteps; i++) {
            list.push(this.at(i));
        }
        yield list
    }

    constructor(buf, info) {
        super(buf, info);
        this.length = 3;
    }
    get numSteps() {
        return this.readEndian(2);
    }
    set numSteps(val) {
        const diff = val - ((this.buf.length - this.length) / 4);
        if (diff > 0) this.expandBuffer(diff * 4);
        else this.shrinkBuffer(Math.abs(diff) * 4);
        this.encodeEndian(2, val);
    }

    where(idx) {
        return (idx * 2) + this.length;
    }
    push(step, map) {
        this.numSteps++;
        const bufLoc = this.where(idx);
        this.encodeEndian(bufLoc, step);
        this.encodeEndian(bufLoc +1, map);
    }
    insert(idx, step, map) {
        // explicitly expand the buffer, as we need it to open at a certain location
        const bufLoc = this.where(idx);
        this.expandBuffer(4, bufLoc);
        this.numSteps++;
        this.encodeEndian(bufLoc, step);
        this.encodeEndian(bufLoc +1, map);
    }
    pop() {
        this.numSteps--;
    }
    remove(idx) {
        this.shrinkBuffer(4, this.where(idx));
    }
    set(idx, step, map) {
        const bufLoc = this.where(idx);
        if (typeof step === 'number') this.encodeEndian(bufLoc, step);
        if (typeof map === 'number') this.encodeEndian(bufLoc +1, map);
    }
    at(idx) {
        const bufLoc = this.where(idx);
        return [this.readEndian(bufLoc), this.readEndian(bufLoc +1)]
    }
    mapOut(val) {
        let start = this.at(0);
        let end = null;
        if (val < start[0]) return start[1];
        for (let i = 1; i < this.numSteps; i++) {
            end = this.at(i);
            if (end[0] < val) break;
            start = end;
        }

        return ((end[1] - start[1]) * ((val - start[0]) / (end[0] - start[0]))) + start[1];
    }
}

module.exports = VarMap;
