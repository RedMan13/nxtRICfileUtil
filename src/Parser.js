const Chunk = require('./utils/Chunk');
const littleEndian = require('./utils/littleEndian');

const decodeData = buffer => {
    const output = [];
    let offset = 0;
    while (offset < buffer.length) {
        const chunk = new Chunk(buffer, offset);
        offset += chunk.byteLength;
        output.push(chunk);
    }
    return output;
};
const encodeData = objects => {
    let output = Buffer.alloc(0);
    for (const chunk of objects) {
        output = Buffer.concat([output, chunk.getBytes()]);
    }
    return output;
};

module.exports = {
    littleEndian,
    decodeData,
    encodeData
};
