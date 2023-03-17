const littleEndian = {
    decode: bufferSlice => {
        let output = 0;
        let offset = 0;
        for (const byte of bufferSlice) {
            output += byte << offset;
            offset += 8;
        }
        return output;
    },
    encode: (number, size) => {
        const output = [];
        let offset = 0;
        for (let index = 0; index < size; index++) {
            output.push(number >> offset);
            offset += 8;
        }
        return output;
    }
};

module.exports = littleEndian;
