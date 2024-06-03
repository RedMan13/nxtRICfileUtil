const { typeNames, indexNames } = require('./constants')

function stringValue(bitsOrClass) {
    const isClass = typeof bitsOrClass !== 'number';
    const variable = isClass 
        ? bitsOrClass.variable?.id ?? 0 
        : (bitsOrClass & 0x0f00) >> 8;
    const paramater = isClass
        ? bitsOrClass.paramater
        : bitsOrClass & 0x00ff;
    const isSpecial = isClass || bitsOrClass & 0xf000;

    if (isSpecial) {
        if (!variable) return `P[${paramater}]`;
        return `V[${variable}:${paramater}]`;
    }
    return String(bitsOrClass);
}
function stringElement(buf) {
    const type = (buf[1] << 8) + buf[0];
    if (!indexNames[type]) return `Error(UnkownType: ${type});`
    const names = indexNames[type]
    let text = `${typeNames[type]}(`;
    for (let i = 1; i <= buf.length / 2; i++) {
        if (!names[i]) break;
        text += `${names[i]}: ${stringValue((buf[(i * 2) + 1] << 8) + buf[i * 2])}, `;
    }
    if (type === typeNames.VarMap) {
        text += '[';
        const len = (buf[5] << 8) + buf[4];
        for (let i = 0; i < len; i++) {
            text += `${(buf[(i * 4) + 7] << 8) + buf[(i * 4) + 6]} => ${(buf[(i * 4) + 9] << 8) + buf[(i * 4) + 8]}, `;
        }
        text += ']'
    }
    if (type === typeNames.Sprite) {
        text += '{\n';
        const height = (buf[5] << 8) + buf[4];
        const width = ((buf[7] << 8) + buf[6]) * 8;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const xy = (x + (y * width)) + (8 * 8);
                const byte = Math.floor(xy / 8);
                const bit = 8 - ((xy % 8) + 1);
                text += (buf[byte] >> bit) & 1
                    ? '11'
                    : '  ';
            }
            text += '|\n'
        }
        text += '}'
    }
    text += ');';

    return text;
}

module.exports = {
    stringValue,
    stringElement
}