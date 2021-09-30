const fs = require("fs");
const mime = require("mime-types");
  
async function download(param) {
    if (!param.fileName) {
        msg = "Missing file name";
        throw new Error("Missing file name");
    }

    var option = {
        q: `name='${param.fileName}'`,
        fields: "files(id, name)",
        spaces: "drive",
    };

    var response = await param.drive.files.list(option);
    const fileId = response.data.files[0].id;

    var response = await param.drive.files.get(
        {
        fileId: param.fileId,
        alt: "media",
        },
        {
        responseType: "stream",
        }
    );
    const item = response.data;
    const writeStream = fs.createWriteStream(`${param.filePath}/${param.fileName}`);

    var end = new Promise((resolve, reject) => {
        var buffer = [];
        item.on("data", (data) => {
        writeStream.write(data);
        buffer.push(data);
        });
        item.on("end", () => {
        writeStream.end();
        resolve(Buffer.concat(buffer));
        });
    });
    return await end;
}

async function upload(param) {
    const data = await fs.readFileSync(`${param.filePath}/${param.fileName}`);
    await param.drive.files.create({
        requestBody: {
        name: param.fileName,
        mimeType: mime.lookup(param.fileName),
        },
        media: {
        mimeType: mime.lookup(param.fileName),
        data: data,
        },
    });
    return Buffer.from(data);
    }

async function read(param) {
    if (!param.fileName) {
        msg = "Missing file name";
        throw new Error("Missing file name");
    }

    var option = {
        q: `name='${param.fileName}'`,
        fields: "files(id, name)",
        spaces: "drive",
    };
    var response = await drive.files.list(option);
    const fileId = response.data.files[0].id;

    var response = await drive.files.get(
        {
        fileId: param.fileId,
        alt: "media",
        },
        {
        responseType: "arraybuffer",
        }
    );
    return Buffer.from(new Uint8Array(response.data));
}

module.exports = {
    download,
    upload,
    read
  };