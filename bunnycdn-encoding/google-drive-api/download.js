const fs = require('fs');

module.exports = (drive, file_id, filename) => {
    return new Promise((resolve, reject) => {
        dest = fs.createWriteStream(filename);
        console.log(`downloading ${file_id} to ${filename}`)
        drive.files.get(
            { fileId: file_id, alt: "media" },
            { responseType: "stream" },
            (err, response) => {
                if(response){
                    response.data
                    .on("end", () => resolve(filename))
                    .on("error", (err) => {
                        reject(err)
                    })
                    .pipe(dest);
                }
                else reject(new Error('file not available!'))

            }
        );

    })
}