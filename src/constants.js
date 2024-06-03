const typeNames = {
    0: 'Information',
    1: 'Sprite',
    2: 'VarMap',
    3: 'CopyBits',
    4: 'Pixel',
    5: 'Line',
    6: 'Rectangle',
    7: 'Circle',
    8: 'NumBox',
    'Information': 0,
    'Sprite': 1,
    'VarMap': 2,
    'CopyBits': 3,
    'Pixel': 4,
    'Line': 5,
    'Rectangle': 6,
    'Circle': 7,
    'NumBox': 8
};
const indexNames = [
    ['type', 'opts', 'width', 'height'],
    ['type', 'id'],
    ['type', 'id'],
    ['type', 'opts', 'spriteID', 'srcX', 'srcY', 'srcWidth', 'srcHeight', 'relX', 'relY'],
    ['type', 'opts', 'x', 'y'],
    ['type', 'opts', 'startX', 'startY', 'endX', 'endY'],
    ['type', 'opts', 'x', 'y', 'width', 'height'],
    ['type', 'opts', 'x', 'y', 'radious'],
    ['type', 'opts', 'x', 'y', 'value']
];

module.exports = {
    typeNames,
    indexNames
}