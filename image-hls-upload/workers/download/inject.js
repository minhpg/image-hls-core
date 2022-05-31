const fs = require('fs');

const inject = async (file) => {
    const fileData = await fs.promises.readFile(file)
    const imageBuffer = await fs.promises.readFile('base.png')
    await fs.promises.writeFile(file.replace('.ts','.png'),  Buffer.from(Buffer.concat([imageBuffer, fileData]), 'binary'))
    return file
}

module.exports = inject