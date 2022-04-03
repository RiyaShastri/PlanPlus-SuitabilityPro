const jetpack = require('fs-jetpack');
const path = require('path');
const minifier = require('minifier');

const files = jetpack.list(path.join(__dirname, 'dist'));

console.log(files);

for (const file of files) {
    if (/.*(\.js|\.css)$/g.test(file)) {
        console.log(`Start ${file}`);
        const filePath = path.join(__dirname, 'dist', file);
        minifier.minify(filePath, {
            output: filePath
        }); 
    }
}

console.log('End');