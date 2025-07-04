const { argv } = require('process');
const { decodeBinnary, draw, capture } = require('./index');
const fs = require('fs/promises');

if (!argv[2]) throw 'Path argument is required to point to an RIC file';
fs.readFile(argv[2])
    .then(buf => {
        const context = decodeBinnary(buf);
        console.log(context.items.join('\n'));
        draw('RICDraw', 0, 0,0, context, [])
        console.log(capture());
    })
    .catch(err => console.error(err));