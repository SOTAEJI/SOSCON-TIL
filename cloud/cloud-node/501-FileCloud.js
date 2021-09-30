const fs = require("fs");
const axios = require("axios");
const { google } = require("googleapis");
const mime = require("mime-types");

module.exports = function exportFunc(RED) {
  function FileCloudNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on("input", async (msg, send, done) => {
      const doType = config.doType;
      const cloudType = config.cloudType;
      const fileName = msg.payload.fileName || config.fileName;
      const filePath = msg.payload.filePath || config.filePath;

      if (cloudType === "google") {
        const clientId = msg.payload.clientId || config.clientId;
        const clientSecret = msg.payload.clientSecret || config.clientSecret;
        const refreshToken = msg.payload.refreshToken || config.refreshToken;
        const redirectUri = "https://developers.google.com/oauthplayground";

        if (!clientId || !clientSecret || !refreshToken) {
          throw new Error("Missing token to access Google Drive");
        }

        const auth = new google.auth.OAuth2(
          clientId,
          clientSecret,
          redirectUri
        );
        auth.setCredentials({ refresh_token: refreshToken });
        const drive = google.drive({
          version: "v3",
          auth,
        });

        switch (doType) {
          case "download":
            DonwloadToGoogleDrive(fileName, filePath, drive)
              .then((val) => {
                msg.filePath = `${filePath}/${fileName}`;
                msg.data = val;
              })
              .catch((error) => {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error("failed: download" + error.toString(), msg);
              });
            break;
          case "upload":
            UploadToGoogleDrive(fileName, filePath, drive)
              .then((val) => {
                msg.filePath = `${filePath}/${fileName}`;
                msg.data = val;
                send(msg);
              })
              .catch((error) => {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error("failed: upload" + error.toString(), msg);
              });
            break;
            case "read":
            ReadToGoogleDrive(fileName, drive)
              .then((val) => {
                msg.data = val;
                send(msg);
              })
              .catch((error) => {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error("failed: read" + error.toString(), msg);
              });
        }
      } else if (cloudType === "one") {
        const apiUrl = "https://graph.microsoft.com/v1.0/me/drive/";
        const accessToken = config.accessToken;
        const params = {
          apiUrl,
          accessToken,
          fileName,
          filePath,
        };
        switch (doType) {
          case "download":
            download(params)
              .then((val) => {
                msg.filePath = `${filePath}/${fileName}`;
                msg.data = val;
                send(msg);
              })
              .catch((error) => {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error("failed: download" + error.toString(), msg);
              });
            break;
          case "upload":
            upload(params)
              .then((val) => {
                msg.filePath = `${filePath}/${fileName}`;
                msg.data = val;
                send(msg);
              })
              .catch((error) => {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error("failed: upload" + error.toString(), msg);
              });
            break;
          case "read":
            read(params)
              .then((val) => {
                msg.data = val;
                send(msg);
              })
              .catch((error) => {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error("failed: read" + error.toString(), msg);
              });
        }
      }
    });
  }

  async function download(params) {
    if (!params.accessToken) {
      throw new Error("Missing accessToken");
    }
    if (!params.fileName) {
      throw new Error("Missing fileName");
    }
    if (!params.filePath) {
      throw new Error("Missing filePath");
    }

    var options = {
      method: "GET",
      url: params.apiUrl + "root:/" + encodeURIComponent(params.fileName),
      headers: {
        Authorization: "Bearer " + params.accessToken,
      },
    };
    var response = await axios(options);
    const fileId = response.data.id;

    const path = `${params.filePath}/${params.fileName}`;
    var options = {
      method: "GET",
      url: params.apiUrl + "items/" + fileId + "/content",
      headers: {
        Authorization: "Bearer " + params.accessToken,
      },
      responseType: "stream",
    };
    var response = await axios(options);
    const item = response.data;
    const writeStream = fs.createWriteStream(path);

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

  async function upload(params) {
    if (!params.accessToken) {
      throw new Error("Missing accessToken");
    }
    if (!params.fileName) {
      throw new Error("Missing fileName");
    }
    if (!params.filePath) {
      throw new Error("Missing filePath");
    }

    const path = `${params.filePath}/${params.fileName}`;
    const data = await fs.promises.readFile(path);

    var options = {
      method: "PUT",
      url: params.apiUrl + "items/root:/" + encodeURIComponent(params.fileName) + ":/content",
      headers: {
        "Content-Type": mime.lookup(path),
        Authorization: "Bearer " + params.accessToken,
      },
      data: data,
      encoding: null,
    };
    axios(options);
    return Buffer.from(data);
  }

  async function read(params) {
    if (!params.accessToken) {
      throw new Error("Missing accessToken");
    }
    if (!params.fileName) {
      throw new Error("Missing fileName");
    }

    var options = {
      method: "GET",
      url: params.apiUrl + "root:/" + encodeURIComponent(params.fileName),
      headers: {
        Authorization: "Bearer " + params.accessToken,
      },
    };
    var response = await axios(options);
    const fileId = response.data.id;

    var options = {
      method: "GET",
      url: params.apiUrl + "items/" + fileId + "/content",
      headers: {
        Authorization: "Bearer " + params.accessToken,
      },
    };
    var response = await axios(options);
    return Buffer.from(response.data);
  }

  // function for google drive
  async function DonwloadToGoogleDrive(fileName, filePath, drive) {
    if (!fileName) {
      msg = "Missing file name";
      throw new Error("Missing file name");
    }

    const params = {
      q: `name='${fileName}'`,
      fields: "files(id, name)",
      spaces: "drive",
    };

    // let fileId = null;
    // await drive.files.list(params).then((res) => {
    //   fileId = res.data.files.length > 0 ? res.data.files[0]["id"] : null;
    // });
    var response = await drive.files.list(params);
    const fileId = response.data.files[0].id;

    var response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      {
        responseType: "stream",
      }
    );
    const item = response.data;
    const writeStream = fs.createWriteStream(`${filePath}/${fileName}`);

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

  async function UploadToGoogleDrive(fileName, filePath, drive) {
    const data = await fs.readFileSync(`${filePath}/${fileName}`);
    await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mime.lookup(fileName),
      },
      media: {
        mimeType: mime.lookup(fileName),
        data: data,
      },
    });
    return Buffer.from(data);
  }

  async function ReadToGoogleDrive(fileName, drive) {
    if (!fileName) {
      msg = "Missing file name";
      throw new Error("Missing file name");
    }

    const params = {
      q: `name='${fileName}'`,
      fields: "files(id, name)",
      spaces: "drive",
    };
    var response = await drive.files.list(params);
    const fileId = response.data.files[0].id;
    
    var response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer",
      }
    );
    return Buffer.from(new Uint8Array(response.data));
  }

  RED.nodes.registerType("FileCloud", FileCloudNode);
};
