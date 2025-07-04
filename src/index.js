const Generic = require('./elements/Generic');
const Sprite = require('./elements/Sprite');
const VarMap = require('./elements/VarMap');
const { stringValue, stringElement } = require('./stringify');
const { draw, capture } = require('./render');

function decodeBinnary(buf) {
    const infoContainer = {
        items: [],
        params: new Array(16).fill(0)
    }
    let cur = 0;
    const items = infoContainer.items;
    while (cur < buf.length) {
        try {
            const len = (buf[cur + 1] << 8) + buf[cur];
            const args = buf.slice(cur + 2, (cur + len) + 2);
            const type = (args[1] << 8) + args[0];
            cur += len + 2;
            switch (type) {
            case 1:
                items.push(new Sprite(args, infoContainer));
                continue;
            case 2:
                items.push(new VarMap(args, infoContainer));
                continue;
            default:
                items.push(new Generic(args, infoContainer));
            }
        } catch (err) {
            console.warn('Failed to finish loading RIC file', err);
            break;
        }
    }

    return infoContainer;
}
function encodeBinnary(items) {
    const buffers = items.reduce((acc, val) => {
        acc.push(Buffer.concat([Buffer.from([val.buf.length & 0xff, (val.buf.length >> 8) & 0xff]), val.buf]));
        return acc; 
    }, [])
    return Buffer.concat(buffers);
}

module.exports = {
    decodeBinnary,
    encodeBinnary,
    stringValue,
    stringElement,
    draw,
    capture
};