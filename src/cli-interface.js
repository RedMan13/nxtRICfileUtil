const { argv } = require('process');
const { decodeBinnary } = require('./index');
const fs = require('fs/promises');

if (!argv[2]) throw 'Path argument is required to point to an RIC file';
fs.readFile(argv[2])
    .then(buf => {
        const { items } = decodeBinnary(buf);
        console.log(items.join('\n'));
    })
    .catch(err => console.error(err));