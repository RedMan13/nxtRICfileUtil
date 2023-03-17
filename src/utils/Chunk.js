const Value = require('./Value');
const littleEndian = require('./littleEndian');
const Image = require('./imageArray');

const names = [
    'header',
    'sprite',
    'variable',
    'copy',
    'dot',
    'line',
    'rectangle',
    'circle',
    'number'
];

// this isnt a dummy for extending, this is for holding the actualy data
class Chunk {
    constructor (allBuf, start) {
        const lengthBuf = allBuf.subarray(start, start + 2);
        const length = littleEndian.decode(lengthBuf);
        const thisBuf = allBuf.subarray(start, start + 2 + length);
        // we set up an empty array for the values
        this._data = new Array(length / 2);
        // set the type
        this._data[0] = littleEndian.decode(thisBuf.subarray(2, 4));
        this._name = names[this._data[0]];
        // we cut off the exess data that is on the buffer
        const inputs = thisBuf.subarray(4, thisBuf.length);
        // the length of sprite difers from all the others becuase of the pixel array
        const numInputs = this._name === 'sprite' ? 3 : inputs.length / 2;
        this._isSprite = this._name === 'sprite';
        for (let inputIdx = 0; inputIdx < numInputs; inputIdx++) {
            const inputStart = inputIdx * 2;
            const inputEnd = this._isSprite && inputIdx === 2 
                ? (this._data[1] * this._data[2]) + 6
                : inputStart + 2;
            const inputBuffer = inputs.subarray(inputStart, inputEnd);
            if (this._isSprite) {
                this._data[3] = new Image(this._data[2], this._data[1], inputBuffer);
                break;
            }
            const inputValue = new Value(inputBuffer);
            this._data[inputIdx + 1] = inputValue;
        }
    }
    get type () {
        return this._name;
    }
    get length () {
        return this._data.length;
    }
    get byteLength () {
        return (this._data.length * 2) + 2;
    }
    // all chunks have an id esc value at position 0, so we give it a permanent name
    get id () {
        return this._data[0];
    }
    get inputs () {
        return this._data;
    }
}

module.exports = Chunk;
